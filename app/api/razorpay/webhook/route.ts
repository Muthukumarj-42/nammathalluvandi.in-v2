import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  isWebhookEventProcessed,
  recordWebhookEvent,
  recordPaymentTransaction,
  createOrUpdateSubscription,
  getUsers,
  getVendorProfiles,
} from "@/lib/db";
import { getPlan, getPlanPricing, PlanTier, BillingCycle } from "@/lib/plans";

// Disable body parsing so we receive the raw body
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (err: any) {
    console.error("Failed to read raw webhook body:", err);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured on the server");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!signature) {
    console.warn("Webhook request missing x-razorpay-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Cryptographic HMAC SHA256 verification using RAW request body
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );

  if (!isSignatureValid) {
    console.warn("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Parse payload ONLY AFTER signature verification
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (parseErr) {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const eventId = event.event_id || event.id || `evt_${Date.now()}`;
  const eventType = event.event;
  const payload = event.payload || {};

  console.log(`[Razorpay Webhook] Received ${eventType} (${eventId})`);

  // Webhook Idempotency Check: Prevent duplicate processing
  const alreadyProcessed = await isWebhookEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`[Razorpay Webhook] Event ${eventId} was already processed. Skipping duplicate.`);
    return NextResponse.json({ status: "already_processed" }, { status: 200 });
  }

  try {
    // ── Helper to locate NTV user ID ──
    const findUserId = async (notes: any, email?: string | null, phone?: string | null): Promise<string | null> => {
      if (notes?.userId) return notes.userId;

      // Fallback: match by email or phone in database
      const [allUsers, allVendors] = await Promise.all([getUsers(), getVendorProfiles()]);

      if (email) {
        const lowerEmail = email.toLowerCase().trim();
        const matchedUser = allUsers.find((u: any) => u.email?.toLowerCase() === lowerEmail);
        if (matchedUser) return matchedUser.id;
      }

      if (phone) {
        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        const matchedVendor = allVendors.find((v: any) => {
          const vPhone = (v.whatsapp_number || v.phone || "").replace(/\D/g, "").slice(-10);
          return vPhone === cleanPhone;
        });
        if (matchedVendor) return matchedVendor.id;
      }

      return null;
    };

    // ── EVENT: payment.captured OR order.paid ──
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;

      const paymentId = paymentEntity?.id || event.razorpay_payment_id;
      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const notes = { ...(orderEntity?.notes || {}), ...(paymentEntity?.notes || {}) };

      const userId = await findUserId(notes, paymentEntity?.email, paymentEntity?.contact);
      const planId: PlanTier = (notes.planId as PlanTier) || "basic";
      const billingCycle: BillingCycle = (notes.billingCycle as BillingCycle) || "1_month";
      const amount = paymentEntity ? paymentEntity.amount / 100 : orderEntity?.amount ? orderEntity.amount / 100 : 99;

      const planConfig = getPlan(planId);
      const pricing = getPlanPricing(planConfig.id, billingCycle);

      if (paymentEntity) {
        await recordPaymentTransaction({
          user_id: userId || "unknown",
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          amount,
          currency: paymentEntity.currency || "INR",
          status: "captured",
          payment_method: paymentEntity.method,
          raw_payload: paymentEntity,
        });
      }

      if (userId) {
        await createOrUpdateSubscription({
          user_id: userId,
          plan_id: planConfig.id,
          billing_cycle: billingCycle,
          amount,
          payment_id: paymentId,
          payment_status: "completed",
          max_carts: planConfig.maxCarts,
          duration_days: pricing.durationDays,
        });
        console.log(`[Razorpay Webhook] Successfully activated ${planConfig.nameEn} plan for user ${userId}`);
      }
    }

    // ── EVENT: subscription.activated OR subscription.charged ──
    else if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged" ||
      eventType === "subscription.authenticated"
    ) {
      const subEntity = payload.subscription?.entity;
      const paymentEntity = payload.payment?.entity;

      if (subEntity) {
        const subId = subEntity.id;
        const notes = subEntity.notes || {};
        const userId = await findUserId(notes, paymentEntity?.email, paymentEntity?.contact);
        const planId: PlanTier = (notes.planId as PlanTier) || "basic";
        const billingCycle: BillingCycle = (notes.billingCycle as BillingCycle) || "1_month";

        const planConfig = getPlan(planId);
        const pricing = getPlanPricing(planConfig.id, billingCycle);

        if (paymentEntity) {
          await recordPaymentTransaction({
            user_id: userId || "unknown",
            razorpay_payment_id: paymentEntity.id,
            razorpay_subscription_id: subId,
            amount: paymentEntity.amount / 100,
            currency: paymentEntity.currency || "INR",
            status: "captured",
            payment_method: paymentEntity.method,
            raw_payload: paymentEntity,
          });
        }

        if (userId) {
          await createOrUpdateSubscription({
            user_id: userId,
            plan_id: planConfig.id,
            billing_cycle: billingCycle,
            amount: pricing.price,
            payment_id: paymentEntity?.id || subId,
            payment_status: "completed",
            max_carts: planConfig.maxCarts,
            duration_days: pricing.durationDays,
          });
          console.log(`[Razorpay Webhook] Subscription ${subId} activated for user ${userId}`);
        }
      }
    }

    // ── EVENT: payment.failed ──
    else if (eventType === "payment.failed") {
      const paymentEntity = payload.payment?.entity;
      if (paymentEntity) {
        const notes = paymentEntity.notes || {};
        const userId = await findUserId(notes, paymentEntity.email, paymentEntity.contact);

        await recordPaymentTransaction({
          user_id: userId || "unknown",
          razorpay_payment_id: paymentEntity.id,
          razorpay_order_id: paymentEntity.order_id,
          amount: paymentEntity.amount / 100,
          currency: paymentEntity.currency || "INR",
          status: "failed",
          payment_method: paymentEntity.method,
          error_code: paymentEntity.error_code,
          error_description: paymentEntity.error_description,
          raw_payload: paymentEntity,
        });

        console.log(`[Razorpay Webhook] Recorded failed payment ${paymentEntity.id}`);
      }
    }

    // ── Mark webhook as processed ──
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      razorpay_entity_id: payload.payment?.entity?.id || payload.subscription?.entity?.id || eventId,
      payload: event,
      processing_status: "processed",
    });

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (processError: any) {
    console.error("[Razorpay Webhook] Processing error:", processError);
    await recordWebhookEvent({
      event_id: eventId,
      event_type: eventType,
      razorpay_entity_id: eventId,
      payload: event,
      processing_status: "failed",
    });
    return NextResponse.json({ status: "error", message: processError.message }, { status: 500 });
  }
}
