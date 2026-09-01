"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, AlertCircle, RefreshCw, CreditCard, Sparkles } from "lucide-react";
import { ListingPlan, BillingCycle, getPlanPricing, formatCurrency } from "@/lib/plans";
import { RazorpaySubscriptionWidget } from "@/components/payment/razorpay-subscription-widget";
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
  const [verifiedSubscription, setVerifiedSubscription] = useState<any>(null);

  // Helper to ensure page scrolling is NEVER locked or frozen after failure or modal dismissal
  // NOTE: NEVER set pointer-events: none on Razorpay elements!
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
    } catch (e) {
      console.warn("Scroll unlock error:", e);
    }
  }, []);

  // Guarantee scroll restoration on mount and unmount
  useEffect(() => {
    unlockPageScroll();
    return () => {
      unlockPageScroll();
    };
  }, [unlockPageScroll]);

  // Load Razorpay Standard Web Checkout script (<script src="https://checkout.razorpay.com/v1/checkout.js"></script>)
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
      // STEP 1: Call Backend /api/create-order
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          userId: user.id,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create payment order. Please try again.");
      }

      const orderData = await orderResponse.json();

      if (!orderData.order_id) {
        throw new Error("Invalid order response from server");
      }

      // Ensure Razorpay script is ready
      if (typeof window === "undefined" || !window.Razorpay) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout SDK failed to load. Please check your internet connection.");
      }

      const cycleLabel = billingCycle === "1_month" ? "1 Month" : "3 Months";

      // STEP 2: Open Razorpay Standard Checkout modal with returned order_id
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Namma Thalluvandi",
        description: `${plan.nameEn} Plan (${cycleLabel}) - Listing Subscription`,
        image: "/favicon.ico",
        order_id: orderData.order_id,
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
            unlockPageScroll();
            setPaymentStatus("cancelled");
          },
        },
        // STEP 3: On Success receive payment_id, order_id, signature and verify on backend
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setPaymentStatus("verifying");

          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                billingCycle,
                userId: user.id,
                vendorId: vendorId || null,
              }),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment signature verification failed");
            }

            unlockPageScroll();
            setPaymentStatus("success");
            setVerifiedSubscription(verifyData.subscription);
          } catch (verifyErr: any) {
            unlockPageScroll();
            console.error("Verification error:", verifyErr);
            setPaymentStatus("failed");
            setErrorMessage(verifyErr.message || "Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (failedResponse: any) => {
        unlockPageScroll();
        setPaymentStatus("failed");
        setErrorMessage(
          failedResponse.error?.description ||
            failedResponse.error?.reason ||
            "Payment failed or was declined by the bank."
        );
      });

      setPaymentStatus("checkout_open");
      rzp.open();
    } catch (err: any) {
      unlockPageScroll();
      console.error("Checkout initiation error:", err);
      setPaymentStatus("failed");
      setErrorMessage(err.message || "Could not open checkout. Please try again.");
    }
  };

  const handleContinueToCart = () => {
    unlockPageScroll();
    if (verifiedSubscription) {
      onSuccess(verifiedSubscription);
    }
  };

  const handleResetError = () => {
    unlockPageScroll();
    setPaymentStatus("idle");
    setErrorMessage("");
  };

  const cycleLabelEn = billingCycle === "1_month" ? "1 Month" : "3 Months";
  const cycleLabelTa = billingCycle === "1_month" ? "1 மாதம்" : "3 மாதங்கள்";

  // ── SUCCESS STATE UI ──
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
              en="Your listing plan has been activated."
              ta="உங்கள் பட்டியல் திட்டம் செயல்படுத்தப்பட்டது."
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
          <span><T en="CONTINUE TO SUBMIT CART →" ta="வண்டி விவரங்களை சமர்ப்பிக்க தொடரவும் →" /></span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ── CHECKOUT / PAYMENT CARD UI ──
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

        {/* Status Error / Dismissed Banner */}
        {paymentStatus === "failed" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold"><T en="Payment Failed" ta="கட்டணம் தோல்வியடைந்தது" /></p>
                <p className="mt-0.5 leading-relaxed">{errorMessage || "The transaction could not be completed."}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetError}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider hover:bg-red-700 transition"
              >
                <T en="Dismiss & Try Again" ta="மீண்டும் முயற்சி செய்க" />
              </button>
            </div>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold"><T en="Checkout Cancelled" ta="பரிவர்த்தனை ரத்து செய்யப்பட்டது" /></p>
              <p className="mt-0.5">
                <T
                  en="You closed the checkout modal. Click Pay Now below to try again."
                  ta="நீங்கள் கட்டண சாளரத்தை மூடிவிட்டீர்கள். மீண்டும் முயற்சிக்க கீழே உள்ள பொத்தானை அழுத்தவும்."
                />
              </p>
            </div>
          </div>
        )}

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

        {/* Option A: Custom NTV Pay Now Button (Direct Checkout modal) */}
        <div className="space-y-3 pt-1">
          <Button
            type="button"
            onClick={handlePayNow}
            disabled={isLoading}
            className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {paymentStatus === "verifying" ? (
                  <T en="Verifying Payment Signature…" ta="கட்டணம் சரிபார்க்கப்படுகிறது…" />
                ) : (
                  <T en="Opening Razorpay Checkout…" ta="கட்டண தளம் திறக்கப்படுகிறது…" />
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

          {/* Option B: Official Razorpay Subscription Widget fallback */}
          {plan.subscriptionButtonId && (
            <div className="pt-2 flex flex-col items-center justify-center gap-1.5 border-t border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant/70">
                <T en="Or subscribe via official widget:" ta="அல்லது அதிகாரப்பூர்வ விட்ஜெட் மூலம் சந்தா பெறுக:" />
              </span>
              <div className="w-full flex justify-center py-1">
                <RazorpaySubscriptionWidget
                  key={`${plan.id}-${billingCycle}`}
                  subscriptionButtonId={plan.subscriptionButtonId}
                />
              </div>
            </div>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                unlockPageScroll();
                onCancel();
              }}
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
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
