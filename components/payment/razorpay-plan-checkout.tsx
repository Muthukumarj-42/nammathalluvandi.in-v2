"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, AlertCircle, RefreshCw, CreditCard, Sparkles } from "lucide-react";
import { ListingPlan, BillingCycle, getPlanPricing, formatCurrency } from "@/lib/plans";
import { createRazorpayOrderAction, verifyAndActivateSubscriptionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

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

  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "creating_order" | "checkout_open" | "verifying" | "success" | "failed" | "cancelled"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activatedSubscription, setActivatedSubscription] = useState<any>(null);

  // Load Razorpay standard checkout script safely
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // script cleanup
    };
  }, []);

  const handlePayNow = async () => {
    setPaymentStatus("creating_order");
    setErrorMessage("");

    try {
      // 1. Create order securely on the backend
      const orderRes = await createRazorpayOrderAction(plan.id, billingCycle, user.id);

      if (!orderRes.success) {
        throw new Error(orderRes.error || "Failed to initialize secure checkout order");
      }

      // 2. Open Razorpay Checkout programmatically
      if (typeof window === "undefined" || !window.Razorpay) {
        // Wait a brief moment if script is still loading
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout script could not be loaded. Please check your internet connection.");
      }

      const cycleLabel = billingCycle === "1_month" ? "1 Month" : "3 Months";

      const options = {
        key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "Namma Thalluvandi",
        description: `${plan.nameEn} Plan (${cycleLabel}) - Listing Subscription`,
        image: "/logo.png",
        order_id: orderRes.orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#f97316", // NTV brand orange
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("cancelled");
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          setPaymentStatus("verifying");

          // 3. Verify payment on backend securely before marking plan active
          const verifyRes = await verifyAndActivateSubscriptionAction({
            razorpayOrderId: response.razorpay_order_id || orderRes.orderId!,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            planId: plan.id,
            billingCycle,
            userId: user.id,
            vendorId: vendorId || null,
          });

          if (verifyRes.success && verifyRes.data) {
            setPaymentStatus("success");
            setActivatedSubscription(verifyRes.data);
          } else {
            setPaymentStatus("failed");
            setErrorMessage(verifyRes.error || "Payment verification failed. Please contact support.");
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", (failedRes: any) => {
        setPaymentStatus("failed");
        setErrorMessage(
          failedRes.error?.description || failedRes.error?.reason || "Payment was declined by bank or cancelled."
        );
      });

      setPaymentStatus("checkout_open");
      rzpInstance.open();
    } catch (err: any) {
      console.error("Razorpay payment initiation error:", err);
      setPaymentStatus("failed");
      setErrorMessage(err.message || "Could not open checkout. Please try again.");
    }
  };

  const handleContinueToCart = () => {
    if (activatedSubscription) {
      onSuccess(activatedSubscription);
    }
  };

  const cycleLabelEn = billingCycle === "1_month" ? "1 Month" : "3 Months";
  const cycleLabelTa = billingCycle === "1_month" ? "1 மாதம்" : "3 மாதங்கள்";

  // ── Verified Payment Success UI ──
  if (paymentStatus === "success") {
    return (
      <div className="bg-surface rounded-3xl p-8 border border-emerald-500/30 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-on-surface mb-1">
            <T en="✓ Payment Successful" ta="✓ கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது" />
          </h3>
          <p className="text-on-surface-variant text-sm">
            <T
              en={`Your ${plan.nameEn} Plan has been activated (${plan.maxCarts} carts quota).`}
              ta={`உங்கள் ${plan.nameTa} திட்டம் செயல்படுத்தப்பட்டது (${plan.maxCarts} வண்டிகள் வரை).`}
            />
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant"><T en="Plan Tier:" ta="திட்டம்:" /></span>
            <span className="font-bold text-on-surface">{plan.badgeEn}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant"><T en="Amount Paid:" ta="செலுத்திய தொகை:" /></span>
            <span className="font-bold text-emerald-600">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant"><T en="Listing Limit:" ta="வரம்பு:" /></span>
            <span className="font-bold text-on-surface">{plan.maxCarts} <T en="Food Carts" ta="உணவு வண்டிகள்" /></span>
          </div>
        </div>

        <Button
          onClick={handleContinueToCart}
          className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
        >
          <span><T en="CONTINUE TO SUBMIT CART" ta="வண்டி விவரங்களை உள்ளிடவும்" /></span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ── Checkout / Review Box ──
  const isLoading = paymentStatus === "creating_order" || paymentStatus === "verifying";

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
              <T en="Total Payable" ta="செலுத்த வேண்டிய தொகை" />
            </p>
            <p className="text-2xl font-bold font-display text-primary">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Status Error / Cancelled Banner */}
        {paymentStatus === "failed" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold"><T en="Payment Failed" ta="கட்டணம் தோல்வியடைந்தது" /></p>
              <p className="mt-0.5">{errorMessage || "The transaction could not be completed."}</p>
            </div>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold"><T en="Checkout Dismissed" ta="பரிவர்த்தனை ரத்து செய்யப்பட்டது" /></p>
              <p className="mt-0.5">
                <T
                  en="You closed the checkout window. Click Pay Now below to try again."
                  ta="நீங்கள் கட்டண சாளரத்தை மூடிவிட்டீர்கள். மீண்டும் முயற்சிக்க கீழே கிளிக் செய்யவும்."
                />
              </p>
            </div>
          </div>
        )}

        {/* Plan Breakdown Info */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant"><T en="Cart Listing Limit:" ta="வண்டிகளின் வரம்பு:" /></span>
            <span className="font-semibold text-emerald-600">Up to {plan.maxCarts} food carts</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant"><T en="Validity Period:" ta="செல்லுபடியாகும் காலம்:" /></span>
            <span className="font-semibold text-on-surface">{pricing.durationDays} days</span>
          </div>
          {pricing.savingsNoteEn && (
            <div className="flex justify-between text-xs font-semibold text-emerald-600 pt-1 border-t border-outline-variant/20">
              <span><T en="Discount:" ta="தள்ளுபடி:" /></span>
              <span><T en={pricing.savingsNoteEn} ta={pricing.savingsNoteTa || ""} /></span>
            </div>
          )}
        </div>

        {/* Custom NTV Pay Now Button */}
        <div className="space-y-3 pt-1">
          <Button
            onClick={handlePayNow}
            disabled={isLoading}
            className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {paymentStatus === "verifying" ? (
                  <T en="Verifying Payment with Bank…" ta="கட்டணம் சரிபார்க்கப்படுகிறது…" />
                ) : (
                  <T en="Opening Secure Checkout…" ta="கட்டண தளம் திறக்கப்படுகிறது…" />
                )}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <T
                  en={`PAY ${formatCurrency(amount)} NOW`}
                  ta={`இப்போது ${formatCurrency(amount)} செலுத்தவும்`}
                />
              </span>
            )}
          </Button>

          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
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
            <T en="Secured by Razorpay" ta="ரேசர்பே பாதுகாப்பானது" />
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
