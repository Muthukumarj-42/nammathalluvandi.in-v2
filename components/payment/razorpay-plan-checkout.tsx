"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, AlertCircle, RefreshCw, Sparkles, CreditCard } from "lucide-react";
import { ListingPlan, BillingCycle, getPlanPricing, formatCurrency } from "@/lib/plans";
import { RazorpaySubscriptionWidget } from "@/components/payment/razorpay-subscription-widget";
import { createSubscriptionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

interface RazorpayPlanCheckoutProps {
  plan: ListingPlan;
  billingCycle: BillingCycle;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  vendorId?: string | null;
  onSuccess: (subscription: any) => void;
  onCancel?: () => void;
}

export function RazorpayPlanCheckout({
  plan,
  billingCycle,
  user,
  vendorId,
  onSuccess,
  onCancel,
}: RazorpayPlanCheckoutProps) {
  const pricing = getPlanPricing(plan.id, billingCycle);
  const amount = pricing.price;

  const [paymentStatus, setPaymentStatus] = useState<"idle" | "activating" | "failed" | "cancelled">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to ensure page scrolling is NEVER locked or frozen after failure / modal close
  const unlockPageScroll = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.pointerEvents = "";
      document.body.classList.remove("overflow-hidden");

      document.documentElement.style.overflow = "";
      document.documentElement.style.position = "";
      document.documentElement.style.pointerEvents = "";
      document.documentElement.classList.remove("overflow-hidden");

      // Reset any stuck pointer-events from third-party iframes
      const stuckElements = document.querySelectorAll(
        ".razorpay-container, .razorpay-backdrop, [class*='razorpay-modal']"
      );
      stuckElements.forEach((el) => {
        (el as HTMLElement).style.pointerEvents = "none";
      });
    } catch (e) {
      console.warn("Scroll unlock error:", e);
    }
  }, []);

  // Always guarantee scroll restoration on mount, unmount, and status updates
  useEffect(() => {
    unlockPageScroll();
    return () => {
      unlockPageScroll();
    };
  }, [unlockPageScroll, paymentStatus]);

  // Handle post-payment continuation
  const handleProceedAfterPayment = async () => {
    setLoading(true);
    setPaymentStatus("activating");
    setErrorMessage("");

    try {
      const paymentId = `sub_${plan.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const res = await createSubscriptionAction({
        userId: user.id,
        vendorId: vendorId || null,
        planId: plan.id,
        billingCycle,
        amount,
        paymentId,
        paymentStatus: "completed",
        durationDays: pricing.durationDays,
        maxCarts: plan.maxCarts,
      });

      if (res.success && res.data) {
        unlockPageScroll();
        onSuccess(res.data);
      } else {
        throw new Error(res.error || "Subscription activation could not be completed. Please try again.");
      }
    } catch (err: any) {
      unlockPageScroll();
      setPaymentStatus("failed");
      setErrorMessage(err.message || "An error occurred while confirming payment. Please retry.");
      setLoading(false);
    }
  };

  const handleResetError = () => {
    unlockPageScroll();
    setPaymentStatus("idle");
    setErrorMessage("");
    setLoading(false);
  };

  const cycleLabelEn = billingCycle === "1_month" ? "1 Month" : "3 Months";
  const cycleLabelTa = billingCycle === "1_month" ? "1 மாதம்" : "3 மாதங்கள்";

  return (
    <div className="w-full space-y-4">
      <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-5">
        {/* Selected Plan Summary Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">
              <T en="Selected Plan" ta="தேர்ந்தெடுக்கப்பட்ட திட்டம்" />
            </p>
            <h4 className="text-lg font-bold text-on-surface font-display">
              <T en={plan.nameEn} ta={plan.nameTa} /> ({cycleLabelEn})
            </h4>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant font-medium">
              <T en="Payable Amount" ta="செலுத்த வேண்டிய தொகை" />
            </p>
            <p className="text-2xl font-bold font-display text-primary">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Plan Breakdown Info */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">
              <T en="Cart Listing Limit:" ta="வண்டிகளின் வரம்பு:" />
            </span>
            <span className="font-semibold text-emerald-600">
              Up to {plan.maxCarts} food carts
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">
              <T en="Validity Period:" ta="செல்லுபடியாகும் காலம்:" />
            </span>
            <span className="font-semibold text-on-surface">
              {pricing.durationDays} days ({cycleLabelEn})
            </span>
          </div>
          {pricing.savingsNoteEn && (
            <div className="flex justify-between text-xs font-semibold text-emerald-600 pt-1 border-t border-outline-variant/20">
              <span><T en="Discount Applied:" ta="தள்ளுபடி:" /></span>
              <span><T en={pricing.savingsNoteEn} ta={pricing.savingsNoteTa || ""} /></span>
            </div>
          )}
        </div>

        {/* Status Error Banner with Scroll Restoration & Retry */}
        {paymentStatus === "failed" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  <T en="Payment or Activation Error" ta="கட்டணம் அல்லது செயல்படுத்துவதில் பிழை" />
                </p>
                <p className="mt-0.5 leading-relaxed">
                  {errorMessage || "The transaction could not be verified. You can retry safely below."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetError}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider hover:bg-red-700 transition"
              >
                <T en="Try Again" ta="மீண்டும் முயற்சி செய்க" />
              </button>
            </div>
          </div>
        )}

        {/* Integrated Razorpay Official Subscription Widget Area */}
        <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/20 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-xs text-on-surface font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <T
              en={`Subscribe to ${plan.nameEn} Plan (${formatCurrency(amount)})`}
              ta={`${plan.nameTa} திட்டத்திற்கு சந்தா பெறுக (${formatCurrency(amount)})`}
            />
          </p>

          {/* Official Razorpay Subscription Button */}
          <div className="w-full flex justify-center py-2">
            <RazorpaySubscriptionWidget
              key={`${plan.id}-${billingCycle}`}
              subscriptionButtonId={plan.subscriptionButtonId}
            />
          </div>

          <p className="text-[11px] text-on-surface-variant/70">
            Secured by Razorpay · Auto-renewal / Instant UPI, Cards & Net Banking
          </p>
        </div>

        {/* Custom Pay Now / Completed Confirmation Button */}
        <div className="space-y-2.5 pt-1">
          <Button
            type="button"
            onClick={handleProceedAfterPayment}
            disabled={loading}
            className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <T en="Activating Your Listing Plan…" ta="திட்டம் செயல்படுத்தப்படுகிறது…" />
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  <T en="CONTINUE TO SUBMIT CART" ta="வண்டி விவரங்களை சமர்ப்பிக்க தொடரவும்" />
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                unlockPageScroll();
                onCancel();
              }}
              disabled={loading}
              className="w-full py-2.5 h-auto text-xs text-on-surface-variant hover:text-on-surface"
            >
              <T en="← Choose a Different Plan" ta="← வேறு திட்டத்தைத் தேர்ந்தெடுக்கவும்" />
            </Button>
          )}
        </div>

        {/* Security & Razorpay Badges */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <T en="Official Razorpay Subscription" ta="ரேசர்பே அதிகாரப்பூர்வ சந்தா" />
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant/60 text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
