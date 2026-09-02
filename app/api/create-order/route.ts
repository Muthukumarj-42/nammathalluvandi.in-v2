import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getPlan, getPlanPricing, PlanTier, BillingCycle } from "@/lib/plans";
import { createOrUpdateSubscription } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, billingCycle, userId, amount: requestAmount } = body;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured on the server" },
        { status: 401 }
      );
    }

    // Determine amount securely from server-side plan configuration or fallback to validated request amount
    let finalAmountInPaise = 0;
    let description = "NTV Listing Plan";

    if (planId && billingCycle) {
      const plan = getPlan(planId as PlanTier);
      const pricing = getPlanPricing(plan.id, billingCycle as BillingCycle);
      finalAmountInPaise = Math.round(pricing.price * 100);
      description = `${plan.nameEn} Plan (${billingCycle === "1_month" ? "1 Month" : "3 Months"})`;
    } else if (typeof requestAmount === "number" && requestAmount > 0) {
      finalAmountInPaise = Math.round(requestAmount);
    }

    // Razorpay minimum amount is 100 paise (₹1)
    if (finalAmountInPaise < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${userId ? userId.slice(0, 8) : "anon"}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: finalAmountInPaise,
      currency: "INR",
      receipt,
      notes: {
        planId: planId || "basic",
        billingCycle: billingCycle || "1_month",
        userId: userId || "",
        description,
      },
    });

    // Record legitimate internal pending purchase in Supabase
    if (userId && planId && billingCycle) {
      try {
        const plan = getPlan(planId as PlanTier);
        const pricing = getPlanPricing(plan.id, billingCycle as BillingCycle);

        await createOrUpdateSubscription({
          user_id: userId,
          plan_id: plan.id,
          billing_cycle: billingCycle,
          amount: pricing.price,
          razorpay_order_id: order.id,
          status: "pending",
          payment_status: "initiated",
          max_carts: plan.maxCarts,
          duration_days: pricing.durationDays,
        });
      } catch (subErr) {
        console.warn("Could not pre-record pending subscription:", subErr);
      }
    }

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
      key_id: keyId,
      receipt: order.receipt,
    });
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
