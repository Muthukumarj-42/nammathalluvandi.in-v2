import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  isWebhookEventProcessed,
  recordWebhookEvent,
  recordPaymentTransaction,
  createOrUpdateSubscription,
  findSubscriptionByRazorpayId,
  updateSubscriptionStatusByRazorpayId,
  getUsers,
  getVendorProfiles,
  VendorSubscription,
} from "@/lib/db";
import { getPlan, getPlanPricing, PlanTier, BillingCycle, ListingPlan, PlanPricing } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Helper: Convert Unix timestamp in seconds to ISO 8601 string
function unixToIso(ts: number | null | undefined): string | null {
  if (!ts || isNaN(ts) || ts <= 0) return null;
  return new Date(ts * 1000).toISOString();
}

// Helper: Validate payment amount, plan, and currency
function validatePaymentPlanAndAmount(
  planId: string,
  billingCycle: string,
  amountInPaise: number,
  currency: string
): {
  isValid: boolean;
  reason?: string;
  expectedAmountInPaise?: number;
  planConfig?: ListingPlan;
  pricing?: PlanPricing;
} {
  if (currency && currency.toUpperCase() !== "INR") {
    return { isValid: false, reason: `Invalid currency: ${currency}. Expected INR.` };
  }

  const validPlans: PlanTier[] = ["basic", "growth", "pro"];
  if (!validPlans.includes(planId as PlanTier)) {
    return { isValid: false, reason: `Unknown plan tier: ${planId}` };
  }

  const validCycles: BillingCycle[] = ["1_month", "3_months"];
  if (!validCycles.includes(billingCycle as BillingCycle)) {
    return { isValid: false, reason: `Unknown billing cycle: ${billingCycle}` };
  }

  const planConfig = getPlan(planId);
  const pricing = getPlanPricing(planConfig.id, billingCycle as BillingCycle);
  const expectedAmountInPaise = Math.round(pricing.price * 100);

  if (amountInPaise !== expectedAmountInPaise) {
    return {
      isValid: false,
      reason: `Amount mismatch: received ${amountInPaise} paise (₹${amountInPaise / 100}), expected ${expectedAmountInPaise} paise (₹${pricing.price}) for ${planId} (${billingCycle}).`,
      expectedAmountInPaise,
      planConfig,
      pricing,
    };
  }

  return { isValid: true, expectedAmountInPaise, planConfig, pricing };
}

// Helper: Map user from notes, order/subscription, or contact fallback
async function resolveUserId(
  notes: any,
  email?: string | null,
  phone?: string | null,
  existingSub?: VendorSubscription | null
): Promise<string | null> {
  // 1. Direct from notes
  if (notes?.userId) return notes.userId;
  if (notes?.user_id) return notes.user_id;

  // 2. From pre-existing internal subscription
  if (existingSub?.user_id) return existingSub.user_id;

  // 3. Database match via email or phone
  try {
    const [allUsers, allVendors] = await Promise.all([getUsers(), getVendorProfiles()]);

    if (email) {
      const lowerEmail = email.toLowerCase().trim();
      const matchedUser = allUsers.find((u: any) => u.email?.toLowerCase() === lowerEmail);
      if (matchedUser) return matchedUser.id;
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        const matchedVendor = allVendors.find((v: any) => {
          const vPhone = (v.whatsapp_number || v.phone || "").replace(/\D/g, "").slice(-10);
          return vPhone === cleanPhone;
        });
        if (matchedVendor) return matchedVendor.id;

        const matchedUser = allUsers.find((u: any) => {
          const uPhone = (u.phone || "").replace(/\D/g, "").slice(-10);
          return uPhone === cleanPhone;
        });
        if (matchedUser) return matchedUser.id;
      }
    }
  } catch (err: any) {
    console.warn("[Razorpay Webhook] User resolution lookup error:", err.message);
  }

  return null;
}

export async function POST(request: Request) {
  // ── 1. Read Request Body as RAW TEXT First ──
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (err: any) {
    console.error("[Razorpay Webhook] Failed to read raw request body:", err.message);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── 2. Validate Signature using dedicated RAZORPAY_WEBHOOK_SECRET ──
  const signature = request.headers.get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Razorpay Webhook] Server Configuration Error: RAZORPAY_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Webhook signature secret is not configured on server" },
      { status: 500 }
    );
  }

  if (!signature) {
    console.warn("[Razorpay Webhook] Signature failure: missing x-razorpay-signature header");
    return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  let isSignatureValid = false;
  try {
    isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    isSignatureValid = false;
  }

  if (!isSignatureValid) {
    console.warn("[Razorpay Webhook] Signature failure: HMAC SHA256 mismatch");
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  // ── 3. Parse JSON Payload ONLY AFTER Signature Verification ──
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (parseErr: any) {
    console.error("[Razorpay Webhook] Malformed JSON payload after signature verification:", parseErr.message);
    return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
  }

  const eventId: string = event.event_id || event.id || request.headers.get("x-razorpay-event-id") || `evt_${Date.now()}`;
  const eventType: string = event.event || "";
  const payload = event.payload || {};

  console.log(`[Razorpay Webhook] Received event: ${eventType} (${eventId})`);

  // ── 4. Idempotency Guard ──
  const alreadyProcessed = await isWebhookEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`[Razorpay Webhook] Duplicate event detected: ${eventId} (${eventType}). Skipping execution.`);
    return NextResponse.json({ status: "already_processed" }, { status: 200 });
  }

  // Record initial event state in webhook_events
  const razorpayEntityId =
    payload.payment?.entity?.id ||
    payload.subscription?.entity?.id ||
    payload.order?.entity?.id ||
    payload.invoice?.entity?.id ||
    eventId;

  await recordWebhookEvent({
    event_id: eventId,
    event_type: eventType,
    razorpay_entity_id: razorpayEntityId,
    payload: event,
    processing_status: "processing",
  });

  // ── 5. Ignore Unrelated Business Events Safely ──
  const ignoredPrefixes = [
    "payment.dispute.",
    "payment.downtime.",
    "settlement.",
    "qr_code.",
    "fund_account.",
    "account.",
    "payment_link.",
    "engage.",
    "refund.",
    "transfer.",
  ];

  if (ignoredPrefixes.some((prefix) => eventType.startsWith(prefix))) {
    console.log(`[Razorpay Webhook] Safely ignored non-subscription event: ${eventType}`);
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      razorpay_entity_id: razorpayEntityId,
      payload: event,
      processing_status: "ignored",
    });
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  try {
    // ══════════════════════════════════════════════════════
    // A. PAYMENT EVENTS
    // ══════════════════════════════════════════════════════

    if (eventType === "payment.captured") {
      const payment = payload.payment?.entity;
      if (!payment) throw new Error("Missing payment entity in payload");

      const notes = payment.notes || {};
      const orderId = payment.order_id || null;
      const subId = payment.subscription_id || null;

      // Look up existing pending subscription
      const existingSub = orderId
        ? await findSubscriptionByRazorpayId(orderId)
        : subId
        ? await findSubscriptionByRazorpayId(subId)
        : null;

      const userId = await resolveUserId(notes, payment.email, payment.contact, existingSub);
      const planId: PlanTier = (notes.planId || existingSub?.plan_id || "basic") as PlanTier;
      const billingCycle: BillingCycle = (notes.billingCycle || existingSub?.billing_cycle || "1_month") as BillingCycle;
      const amountInPaise = payment.amount;
      const currency = payment.currency || "INR";

      // Validate payment plan & amount
      const validation = validatePaymentPlanAndAmount(planId, billingCycle, amountInPaise, currency);
      if (!validation.isValid) {
        console.warn(`[Razorpay Webhook] Payment validation warning: ${validation.reason}`);
      }

      const planConfig = validation.planConfig || getPlan(planId);
      const pricing = validation.pricing || getPlanPricing(planConfig.id, billingCycle);

      // Record transaction in subscription_payments
      await recordPaymentTransaction({
        user_id: userId || "unmapped",
        vendor_id: notes.vendorId || existingSub?.vendor_id || null,
        subscription_id: existingSub?.id || null,
        razorpay_payment_id: payment.id,
        razorpay_order_id: orderId,
        razorpay_subscription_id: subId,
        amount: amountInPaise / 100,
        currency,
        status: "captured",
        payment_method: payment.method || null,
        raw_payload: payment,
      });

      // Activate subscription if legitimate user mapped
      if (userId && validation.isValid) {
        await createOrUpdateSubscription({
          user_id: userId,
          vendor_id: notes.vendorId || existingSub?.vendor_id || null,
          plan_id: planConfig.id,
          billing_cycle: billingCycle,
          amount: amountInPaise / 100,
          payment_id: payment.id,
          razorpay_order_id: orderId,
          razorpay_subscription_id: subId,
          payment_status: "completed",
          status: "active",
          max_carts: planConfig.maxCarts,
          duration_days: pricing.durationDays,
          payment_method: payment.method,
          raw_event_reference: { eventId, eventType, paymentId: payment.id },
        });

        console.log(`[Razorpay Webhook] Activated ${planConfig.nameEn} plan for user ${userId} via payment.captured (${payment.id})`);
      } else if (!userId) {
        console.warn(`[Razorpay Webhook] Mapping failure: payment ${payment.id} could not be mapped to an internal user.`);
      }
    } else if (eventType === "payment.authorized") {
      const payment = payload.payment?.entity;
      if (payment) {
        const notes = payment.notes || {};
        const userId = await resolveUserId(notes, payment.email, payment.contact);

        await recordPaymentTransaction({
          user_id: userId || "unmapped",
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id || null,
          amount: payment.amount / 100,
          currency: payment.currency || "INR",
          status: "authorized",
          payment_method: payment.method || null,
          raw_payload: payment,
        });

        console.log(`[Razorpay Webhook] Recorded authorized payment ${payment.id}`);
      }
    } else if (eventType === "payment.failed") {
      const payment = payload.payment?.entity;
      if (payment) {
        const notes = payment.notes || {};
        const orderId = payment.order_id || null;
        const subId = payment.subscription_id || null;
        const existingSub = orderId
          ? await findSubscriptionByRazorpayId(orderId)
          : subId
          ? await findSubscriptionByRazorpayId(subId)
          : null;

        const userId = await resolveUserId(notes, payment.email, payment.contact, existingSub);

        await recordPaymentTransaction({
          user_id: userId || "unmapped",
          razorpay_payment_id: payment.id,
          razorpay_order_id: orderId,
          razorpay_subscription_id: subId,
          amount: payment.amount / 100,
          currency: payment.currency || "INR",
          status: "failed",
          payment_method: payment.method || null,
          error_code: payment.error_code || null,
          error_description: payment.error_description || payment.error_reason || null,
          raw_payload: payment,
        });

        // Mark subscription payment_status as failed if an order was pending
        if (orderId) {
          await updateSubscriptionStatusByRazorpayId(orderId, {
            payment_status: "failed",
          });
        }

        console.log(`[Razorpay Webhook] Recorded payment failure: ${payment.id} (${payment.error_code})`);
      }
    }

    // ══════════════════════════════════════════════════════
    // B. ORDER EVENTS
    // ══════════════════════════════════════════════════════

    else if (eventType === "order.paid") {
      const order = payload.order?.entity;
      const payment = payload.payment?.entity;

      if (!order) throw new Error("Missing order entity in payload");

      const notes = order.notes || payment?.notes || {};
      const orderId = order.id;
      const paymentId = payment?.id || order.receipt || `pay_order_${orderId}`;

      const existingSub = await findSubscriptionByRazorpayId(orderId);
      const userId = await resolveUserId(notes, payment?.email, payment?.contact, existingSub);
      const planId: PlanTier = (notes.planId || existingSub?.plan_id || "basic") as PlanTier;
      const billingCycle: BillingCycle = (notes.billingCycle || existingSub?.billing_cycle || "1_month") as BillingCycle;
      const amountInPaise = order.amount_paid || order.amount;
      const currency = order.currency || "INR";

      const validation = validatePaymentPlanAndAmount(planId, billingCycle, amountInPaise, currency);
      const planConfig = validation.planConfig || getPlan(planId);
      const pricing = validation.pricing || getPlanPricing(planConfig.id, billingCycle);

      if (payment) {
        await recordPaymentTransaction({
          user_id: userId || "unmapped",
          subscription_id: existingSub?.id || null,
          razorpay_payment_id: payment.id,
          razorpay_order_id: orderId,
          amount: amountInPaise / 100,
          currency,
          status: "captured",
          payment_method: payment.method || null,
          raw_payload: payment,
        });
      }

      if (userId && validation.isValid) {
        await createOrUpdateSubscription({
          user_id: userId,
          plan_id: planConfig.id,
          billing_cycle: billingCycle,
          amount: amountInPaise / 100,
          payment_id: paymentId,
          razorpay_order_id: orderId,
          payment_status: "completed",
          status: "active",
          max_carts: planConfig.maxCarts,
          duration_days: pricing.durationDays,
          raw_event_reference: { eventId, eventType, orderId },
        });

        console.log(`[Razorpay Webhook] Order ${orderId} marked paid. Activated plan for user ${userId}.`);
      }
    }

    // ══════════════════════════════════════════════════════
    // C. INVOICE EVENTS
    // ══════════════════════════════════════════════════════

    else if (eventType === "invoice.paid") {
      const invoice = payload.invoice?.entity;
      const payment = payload.payment?.entity;

      if (invoice) {
        const subId = invoice.subscription_id;
        const existingSub = subId ? await findSubscriptionByRazorpayId(subId) : null;
        const userId = existingSub?.user_id || (await resolveUserId(invoice.notes, invoice.customer_email, invoice.customer_contact));

        if (payment) {
          await recordPaymentTransaction({
            user_id: userId || "unmapped",
            subscription_id: existingSub?.id || null,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subId || null,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency || "INR",
            status: "captured",
            payment_method: payment.method || null,
            raw_payload: payment,
          });
        }

        if (subId) {
          await updateSubscriptionStatusByRazorpayId(subId, {
            status: "active",
            payment_status: "completed",
            invoice_id: invoice.id,
            paid_count: (existingSub?.paid_count || 0) + 1,
            raw_event_reference: { eventId, eventType, invoiceId: invoice.id },
          });

          console.log(`[Razorpay Webhook] Invoice ${invoice.id} paid for subscription ${subId}`);
        }
      }
    } else if (eventType === "invoice.partially_paid") {
      const invoice = payload.invoice?.entity;
      if (invoice?.subscription_id) {
        await updateSubscriptionStatusByRazorpayId(invoice.subscription_id, {
          payment_status: "pending",
          invoice_id: invoice.id,
          raw_event_reference: { eventId, eventType, invoiceId: invoice.id, note: "partially_paid" },
        });
        console.warn(`[Razorpay Webhook] Invoice ${invoice.id} partially paid. Attention required.`);
      }
    } else if (eventType === "invoice.expired") {
      const invoice = payload.invoice?.entity;
      if (invoice?.subscription_id) {
        await updateSubscriptionStatusByRazorpayId(invoice.subscription_id, {
          payment_status: "failed",
          status: "pending",
          invoice_id: invoice.id,
          raw_event_reference: { eventId, eventType, invoiceId: invoice.id, note: "invoice_expired" },
        });
        console.warn(`[Razorpay Webhook] Invoice ${invoice.id} expired.`);
      }
    }

    // ══════════════════════════════════════════════════════
    // D. SUBSCRIPTION LIFECYCLE EVENTS
    // ══════════════════════════════════════════════════════

    else if (eventType === "subscription.authenticated") {
      const sub = payload.subscription?.entity;
      const payment = payload.payment?.entity;

      if (sub) {
        const notes = sub.notes || {};
        const existingSub = await findSubscriptionByRazorpayId(sub.id);
        const userId = await resolveUserId(notes, payment?.email, payment?.contact, existingSub);
        const planId: PlanTier = (notes.planId || existingSub?.plan_id || "basic") as PlanTier;
        const billingCycle: BillingCycle = (notes.billingCycle || existingSub?.billing_cycle || "1_month") as BillingCycle;
        const planConfig = getPlan(planId);
        const pricing = getPlanPricing(planConfig.id, billingCycle);

        if (payment) {
          await recordPaymentTransaction({
            user_id: userId || "unmapped",
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: sub.id,
            amount: payment.amount / 100,
            currency: payment.currency || "INR",
            status: "authorized",
            payment_method: payment.method || null,
            raw_payload: payment,
          });
        }

        if (userId) {
          await createOrUpdateSubscription({
            user_id: userId,
            plan_id: planConfig.id,
            billing_cycle: billingCycle,
            amount: pricing.price,
            razorpay_subscription_id: sub.id,
            razorpay_customer_id: sub.customer_id || null,
            razorpay_plan_id: sub.plan_id || null,
            status: "authenticated",
            payment_status: "pending",
            max_carts: planConfig.maxCarts,
            current_start: unixToIso(sub.current_start),
            current_end: unixToIso(sub.current_end),
            total_count: sub.total_count ?? 0,
            paid_count: sub.paid_count ?? 0,
            raw_event_reference: { eventId, eventType, subId: sub.id },
          });

          console.log(`[Razorpay Webhook] Subscription authenticated: ${sub.id} for user ${userId}`);
        }
      }
    } else if (eventType === "subscription.activated") {
      const sub = payload.subscription?.entity;
      if (sub) {
        const notes = sub.notes || {};
        const existingSub = await findSubscriptionByRazorpayId(sub.id);
        const userId = await resolveUserId(notes, null, null, existingSub);
        const planId: PlanTier = (notes.planId || existingSub?.plan_id || "basic") as PlanTier;
        const billingCycle: BillingCycle = (notes.billingCycle || existingSub?.billing_cycle || "1_month") as BillingCycle;
        const planConfig = getPlan(planId);
        const pricing = getPlanPricing(planConfig.id, billingCycle);

        const currentStartIso = unixToIso(sub.current_start) || new Date().toISOString();
        const currentEndIso = unixToIso(sub.current_end) || unixToIso(sub.end_at);
        const durationDays = pricing.durationDays;
        const calculatedExpiresAt = currentEndIso || new Date(Date.now() + durationDays * 86400000).toISOString();

        if (userId) {
          await createOrUpdateSubscription({
            user_id: userId,
            plan_id: planConfig.id,
            billing_cycle: billingCycle,
            amount: pricing.price,
            razorpay_subscription_id: sub.id,
            razorpay_customer_id: sub.customer_id || null,
            razorpay_plan_id: sub.plan_id || null,
            status: "active",
            payment_status: "completed",
            max_carts: planConfig.maxCarts,
            starts_at: currentStartIso,
            expires_at: calculatedExpiresAt,
            current_start: currentStartIso,
            current_end: currentEndIso,
            total_count: sub.total_count ?? 0,
            paid_count: sub.paid_count ?? 1,
            raw_event_reference: { eventId, eventType, subId: sub.id },
          });

          console.log(`[Razorpay Webhook] Subscription activated: ${sub.id} for user ${userId}`);
        }
      }
    } else if (eventType === "subscription.charged") {
      const sub = payload.subscription?.entity;
      const payment = payload.payment?.entity;

      if (sub) {
        const notes = sub.notes || {};
        const existingSub = await findSubscriptionByRazorpayId(sub.id);
        const userId = await resolveUserId(notes, payment?.email, payment?.contact, existingSub);
        const planId: PlanTier = (notes.planId || existingSub?.plan_id || "basic") as PlanTier;
        const billingCycle: BillingCycle = (notes.billingCycle || existingSub?.billing_cycle || "1_month") as BillingCycle;
        const planConfig = getPlan(planId);
        const pricing = getPlanPricing(planConfig.id, billingCycle);

        if (payment) {
          await recordPaymentTransaction({
            user_id: userId || "unmapped",
            subscription_id: existingSub?.id || null,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: sub.id,
            amount: payment.amount / 100,
            currency: payment.currency || "INR",
            status: "captured",
            payment_method: payment.method || null,
            raw_payload: payment,
          });
        }

        const currentStartIso = unixToIso(sub.current_start) || new Date().toISOString();
        const currentEndIso = unixToIso(sub.current_end) || unixToIso(sub.end_at);
        const expiresAt = currentEndIso || new Date(Date.now() + pricing.durationDays * 86400000).toISOString();

        if (userId) {
          await createOrUpdateSubscription({
            user_id: userId,
            plan_id: planConfig.id,
            billing_cycle: billingCycle,
            amount: pricing.price,
            payment_id: payment?.id || existingSub?.payment_id,
            razorpay_subscription_id: sub.id,
            razorpay_customer_id: sub.customer_id || null,
            status: "active",
            payment_status: "completed",
            max_carts: planConfig.maxCarts,
            starts_at: existingSub?.starts_at || currentStartIso,
            expires_at: expiresAt,
            current_start: currentStartIso,
            current_end: currentEndIso,
            paid_count: sub.paid_count ?? (existingSub?.paid_count || 0) + 1,
            total_count: sub.total_count ?? existingSub?.total_count ?? 0,
            payment_method: payment?.method || existingSub?.payment_method,
            raw_event_reference: { eventId, eventType, subId: sub.id },
          });

          console.log(`[Razorpay Webhook] Subscription charged: ${sub.id} (Paid count: ${sub.paid_count})`);
        }
      }
    } else if (eventType === "subscription.pending") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        await updateSubscriptionStatusByRazorpayId(sub.id, {
          status: "pending",
          payment_status: "pending",
          charge_at: unixToIso(sub.charge_at),
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.warn(`[Razorpay Webhook] Subscription pending payment: ${sub.id}`);
      }
    } else if (eventType === "subscription.halted") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        await updateSubscriptionStatusByRazorpayId(sub.id, {
          status: "halted",
          payment_status: "failed",
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.warn(`[Razorpay Webhook] Subscription halted: ${sub.id}. Entitlement revoked.`);
      }
    } else if (eventType === "subscription.cancelled") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        await updateSubscriptionStatusByRazorpayId(sub.id, {
          status: "cancelled",
          ended_at: unixToIso(sub.ended_at) || new Date().toISOString(),
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.log(`[Razorpay Webhook] Subscription cancelled: ${sub.id}`);
      }
    } else if (eventType === "subscription.completed") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        await updateSubscriptionStatusByRazorpayId(sub.id, {
          status: "completed",
          ended_at: unixToIso(sub.ended_at) || new Date().toISOString(),
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.log(`[Razorpay Webhook] Subscription completed: ${sub.id}`);
      }
    } else if (eventType === "subscription.paused") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        await updateSubscriptionStatusByRazorpayId(sub.id, {
          status: "paused",
          paused_at: new Date().toISOString(),
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.log(`[Razorpay Webhook] Subscription paused: ${sub.id}`);
      }
    } else if (eventType === "subscription.resumed") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        const currentEndIso = unixToIso(sub.current_end);
        const isStillValid = currentEndIso ? new Date(currentEndIso).getTime() > Date.now() : true;

        await updateSubscriptionStatusByRazorpayId(sub.id, {
          status: isStillValid ? "active" : "expired",
          resumed_at: new Date().toISOString(),
          current_start: unixToIso(sub.current_start),
          current_end: currentEndIso,
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.log(`[Razorpay Webhook] Subscription resumed: ${sub.id}`);
      }
    } else if (eventType === "subscription.updated") {
      const sub = payload.subscription?.entity;
      if (sub?.id) {
        await updateSubscriptionStatusByRazorpayId(sub.id, {
          current_start: unixToIso(sub.current_start),
          current_end: unixToIso(sub.current_end),
          charge_at: unixToIso(sub.charge_at),
          total_count: sub.total_count,
          paid_count: sub.paid_count,
          raw_event_reference: { eventId, eventType, subId: sub.id },
        });
        console.log(`[Razorpay Webhook] Subscription updated: ${sub.id}`);
      }
    }

    // ── Mark webhook as successfully processed ──
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      razorpay_entity_id: razorpayEntityId,
      payload: event,
      processing_status: "processed",
    });

    console.log(`[Razorpay Webhook] Successfully processed event ${eventId} (${eventType})`);
    return NextResponse.json({ status: "success", event_id: eventId }, { status: 200 });
  } catch (processError: any) {
    console.error(`[Razorpay Webhook] Processing error for ${eventId}:`, processError.message);

    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      razorpay_entity_id: razorpayEntityId,
      payload: event,
      processing_status: "failed",
    });

    return NextResponse.json(
      { error: "Webhook processing error", message: processError.message },
      { status: 500 }
    );
  }
}
