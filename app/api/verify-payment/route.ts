import { NextResponse } from "next/server";
import crypto from "crypto";
import { getPlan, getPlanPricing, PlanTier, BillingCycle } from "@/lib/plans";
import { createOrUpdateSubscription } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingCycle,
      userId,
      vendorId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required verification fields (order_id, payment_id, signature)" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay secret key not configured on server" },
        { status: 500 }
      );
    }

    // Generate expected HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    // Cryptographic comparison
    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.warn("Razorpay signature mismatch:", {
        expected: generatedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        { success: false, error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    // If subscription parameters are passed, activate subscription in database
    let subscription = null;
    if (userId && planId && billingCycle) {
      const plan = getPlan(planId as PlanTier);
      const pricing = getPlanPricing(plan.id, billingCycle as BillingCycle);

      subscription = await createOrUpdateSubscription({
        user_id: userId,
        vendor_id: vendorId || null,
        plan_id: plan.id,
        billing_cycle: billingCycle as BillingCycle,
        amount: pricing.price,
        payment_id: razorpay_payment_id,
        payment_status: "completed",
        max_carts: plan.maxCarts,
        duration_days: pricing.durationDays,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      subscription,
    });
  } catch (err: any) {
    console.error("Error verifying payment signature:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}
