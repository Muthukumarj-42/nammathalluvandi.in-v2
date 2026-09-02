import { NextResponse } from "next/server";
import {
  getUserEntitlement,
  createOrUpdateSubscription,
  findSubscriptionByRazorpayId,
  recordPaymentTransaction,
  getUsers,
  getVendorProfiles,
} from "@/lib/db";
import { getPlan, getPlanPricing, PlanTier, BillingCycle } from "@/lib/plans";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, paymentId, subscriptionId, planId = "basic", billingCycle = "1_month" } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // 1. Check if user already has an active entitlement
    let entitlement = await getUserEntitlement(userId);
    if (entitlement.canPublish && entitlement.status === "active") {
      return NextResponse.json({
        success: true,
        message: "Active subscription found",
        entitlement,
      });
    }

    // 2. Check if a payment exists in database for this payment ID or subscription ID
    if (paymentId || subscriptionId) {
      const idToSearch = paymentId || subscriptionId;
      const { data: matchedPayment } = await supabaseAdmin
        .from("subscription_payments")
        .select("*")
        .or(`razorpay_payment_id.eq.${idToSearch},razorpay_subscription_id.eq.${idToSearch},razorpay_order_id.eq.${idToSearch}`)
        .maybeSingle();

      if (matchedPayment) {
        // Activate subscription linked to this payment
        const plan = getPlan(planId as PlanTier);
        const pricing = getPlanPricing(plan.id, billingCycle as BillingCycle);

        await createOrUpdateSubscription({
          user_id: userId,
          plan_id: plan.id,
          billing_cycle: billingCycle as BillingCycle,
          amount: matchedPayment.amount || pricing.price,
          payment_id: matchedPayment.razorpay_payment_id,
          razorpay_subscription_id: matchedPayment.razorpay_subscription_id,
          razorpay_order_id: matchedPayment.razorpay_order_id,
          status: "active",
          payment_status: "completed",
          max_carts: plan.maxCarts,
          duration_days: pricing.durationDays,
        });

        entitlement = await getUserEntitlement(userId);
        return NextResponse.json({
          success: true,
          message: "Subscription activated from verified payment",
          entitlement,
        });
      }
    }

    // 3. Check if user has an existing vendor subscription row in pending or active status
    const { data: userSub } = await supabaseAdmin
      .from("vendor_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userSub && (userSub.status === "active" || userSub.payment_status === "completed")) {
      entitlement = await getUserEntitlement(userId);
      return NextResponse.json({
        success: true,
        message: "Existing active subscription restored",
        entitlement,
      });
    }

    // 4. If paymentId was provided by user (e.g. from Razorpay receipt/SMS)
    if (paymentId && (paymentId.startsWith("pay_") || paymentId.startsWith("sub_"))) {
      const plan = getPlan(planId as PlanTier);
      const pricing = getPlanPricing(plan.id, billingCycle as BillingCycle);

      // Record transaction
      await recordPaymentTransaction({
        user_id: userId,
        razorpay_payment_id: paymentId,
        amount: pricing.price,
        currency: "INR",
        status: "captured",
        payment_method: "widget_manual_confirmation",
      });

      // Activate subscription
      await createOrUpdateSubscription({
        user_id: userId,
        plan_id: plan.id,
        billing_cycle: billingCycle as BillingCycle,
        amount: pricing.price,
        payment_id: paymentId,
        payment_status: "completed",
        status: "active",
        max_carts: plan.maxCarts,
        duration_days: pricing.durationDays,
      });

      entitlement = await getUserEntitlement(userId);
      return NextResponse.json({
        success: true,
        message: "Subscription activated from payment ID",
        entitlement,
      });
    }

    // 5. Look for any unmapped payment recorded in the last 2 hours that can be claimed
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const { data: recentUnmapped } = await supabaseAdmin
      .from("subscription_payments")
      .select("*")
      .eq("user_id", "unmapped")
      .gt("created_at", twoHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentUnmapped) {
      // Claim this payment for the current user
      await supabaseAdmin
        .from("subscription_payments")
        .update({ user_id: userId })
        .eq("id", recentUnmapped.id);

      const plan = getPlan(planId as PlanTier);
      const pricing = getPlanPricing(plan.id, billingCycle as BillingCycle);

      await createOrUpdateSubscription({
        user_id: userId,
        plan_id: plan.id,
        billing_cycle: billingCycle as BillingCycle,
        amount: recentUnmapped.amount,
        payment_id: recentUnmapped.razorpay_payment_id,
        payment_status: "completed",
        status: "active",
        max_carts: plan.maxCarts,
        duration_days: pricing.durationDays,
      });

      entitlement = await getUserEntitlement(userId);
      return NextResponse.json({
        success: true,
        message: "Successfully synchronized recent payment to account",
        entitlement,
      });
    }

    return NextResponse.json({
      success: false,
      message: "No unlinked active payment found. Please enter your Payment ID.",
      entitlement,
    });
  } catch (error: any) {
    console.error("Error in sync-subscription:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
