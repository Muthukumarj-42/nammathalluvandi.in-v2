"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, AlertCircle, RefreshCw, CreditCard, Sparkles } from "lucide-react";
import { ListingPlan, BillingCycle, getPlanPricing, getPlanSubscriptionButtonId, formatCurrency } from "@/lib/plans";
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
  onSuccess: (entitlement: any) => void;
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
    "idle" | "creating_order" | "checkout_open" | "verifying" | "success" | "failed" | "cancelled" | "pending_verification"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeEntitlement, setActiveEntitlement] = useState<any>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to ensure page scrolling and pointer-events are NEVER frozen or locked
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
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [unlockPageScroll]);

  // Load Razorpay Standard Web Checkout script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {};
  }, []);

  // ── Authoritative Backend Entitlement Poller ──
  // Polls /api/user/entitlement every 1.5s for up to 15s to confirm webhook activation
  const startEntitlementPolling = useCallback(
    (onConfirmed?: (entitlement: any) => void) => {
      if (pollingRef.current) clearInterval(pollingRef.current);

      let attempts = 0;
      const maxAttempts = 10; // 15 seconds total

      pollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/api/user/entitlement?userId=${encodeURIComponent(user.id)}`, {
            cache: "no-store",
          });
          const data = await res.json().catch(() => ({}));

          if (data.success && data.entitlement && data.entitlement.status === "active") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            unlockPageScroll();
            setActiveEntitlement(data.entitlement);
            setPaymentStatus("success");

            if (onConfirmed) {
              onConfirmed(data.entitlement);
            } else {
              setTimeout(() => {
                onSuccess(data.entitlement);
              }, 1200);
            }
            return;
          }

          if (attempts >= maxAttempts) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            unlockPageScroll();
            // Webhook delayed or still processing — do NOT claim payment failed
            setPaymentStatus("pending_verification");
          }
        } catch (pollErr) {
          console.warn("Entitlement poll error:", pollErr);
        }
      }, 1500);
    },
    [user.id, unlockPageScroll, onSuccess]
  );

  // Listen for Razorpay widget completion messages from iframe
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;

        let isSuccess = false;

        if (typeof data === "string") {
          if (
            data.includes("razorpay_payment_id") ||
            data.includes("payment.authorized") ||
            data.includes("subscription.charged")
          ) {
            isSuccess = true;
          }
        } else if (typeof data === "object") {
          if (
            data.razorpay_payment_id ||
            data.payment_id ||
            data.subscription_id ||
            data.status === "success" ||
            data.event === "subscription.charged" ||
            data.event === "payment.authorized" ||
            data.type === "payment.success"
          ) {
            isSuccess = true;
          }
        }

        if (isSuccess && paymentStatus !== "verifying" && paymentStatus !== "success") {
          setPaymentStatus("verifying");
          startEntitlementPolling();
        }
      } catch (e) {
        console.warn("Error processing Razorpay message:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [paymentStatus, startEntitlementPolling]);

  // ── Primary Razorpay Standard Checkout Flow ──
  const handlePayNow = async () => {
    setPaymentStatus("creating_order");
    setErrorMessage("");

    try {
      // 1. Call Backend /api/create-order with authenticated user ID and selected plan
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

      // Ensure Razorpay SDK is loaded
      if (typeof window === "undefined" || !window.Razorpay) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout SDK failed to load. Please check your internet connection.");
      }

      const cycleLabel = billingCycle === "1_month" ? "1 Month" : "3 Months";

      // 2. Open Razorpay Checkout modal
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
            // If user closed modal while idle or before finishing, set cancelled
            setPaymentStatus((prev) => (prev === "verifying" || prev === "success" ? prev : "cancelled"));
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          unlockPageScroll();
          setPaymentStatus("verifying");

          // Trigger background server verification as client fallback while polling entitlement
          fetch("/api/verify-payment", {
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
          }).catch(console.warn);

          // Authoritatively poll backend entitlement
          startEntitlementPolling();
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
      console.error("Checkout error:", err);
      setPaymentStatus("failed");
      setErrorMessage(err.message || "Could not open checkout. Please try again.");
    }
  };

  const handleReset = () => {
    unlockPageScroll();
    setPaymentStatus("idle");
    setErrorMessage("");
  };

  const cycleLabelEn = billingCycle === "1_month" ? "1 Month" : "3 Months";

  // ── 1. SUCCESS STATE UI (Automatic Unlock Trigger) ──
  if (paymentStatus === "success") {
    return (
      <div className="bg-surface rounded-3xl p-8 border border-emerald-500/30 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-on-surface mb-1">
            <T en="✓ Payment Successful!" ta="✓ கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது!" />
          </h3>
          <p className="text-on-surface-variant text-sm">
            <T
              en={`${plan.nameEn} plan activated. Unlocking your listing form…`}
              ta={`${plan.nameTa} திட்டம் செயல்படுத்தப்பட்டது. படிவம் திறக்கப்படுகிறது…`}
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
          onClick={() => {
            unlockPageScroll();
            onSuccess(activeEntitlement);
          }}
          className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md flex items-center justify-center gap-2"
        >
          <span><T en="CONTINUE TO SUBMIT CART →" ta="வண்டி விவரங்களை சமர்ப்பிக்க தொடரவும் →" /></span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // ── 2. VERIFYING STATE UI (Automatic Polling) ──
  if (paymentStatus === "verifying") {
    return (
      <div className="bg-surface rounded-3xl p-8 border border-primary/30 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-on-surface mb-2">
            <T en="Verifying your payment…" ta="கட்டணம் சரிபார்க்கப்படுகிறது…" />
          </h3>
          <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
            <T
              en="Connecting with Razorpay to confirm your subscription. This page will automatically unlock in a moment."
              ta="உங்கள் கட்டணத்தை உறுதிப்படுத்துகிறது. ஒரு நொடியில் பக்கம் தானாகவே திறக்கப்படும்."
            />
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant/70 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span><T en="Synchronizing backend entitlement…" ta="திட்டம் செயல்படுத்தப்படுகிறது…" /></span>
        </div>
      </div>
    );
  }

  // ── 3. PENDING VERIFICATION STATE UI (Delayed Webhook) ──
  if (paymentStatus === "pending_verification") {
    return (
      <div className="bg-surface rounded-3xl p-8 border border-amber-500/30 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-600">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">
            <T en="Payment Received — Finalizing Activation" ta="கட்டணம் பெறப்பட்டது — செயல்படுத்தப்படுகிறது" />
          </h3>
          <p className="text-on-surface-variant text-xs max-w-sm mx-auto leading-relaxed">
            <T
              en="Your transaction was received and is being synchronized by our secure banking webhook. Please wait a moment."
              ta="உங்கள் பரிவர்த்தனை பெறப்பட்டு வங்கி மூலம் சரிபார்க்கப்படுகிறது. தயவுசெய்து சிறிது நேரம் காத்திருக்கவும்."
            />
          </p>
        </div>

        <Button
          onClick={() => startEntitlementPolling()}
          className="w-full py-3 h-auto rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider shadow-sm"
        >
          <T en="Re-check Subscription Status" ta="நிலையை மீண்டும் சரிபார்க்கவும்" />
        </Button>
      </div>
    );
  }

  // ── 4. CHECKOUT / PAYMENT CARD UI ──
  const isLoading = paymentStatus === "creating_order";

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
                <p className="font-bold"><T en="Payment Wasn't Completed" ta="கட்டணம் நிறைவடையவில்லை" /></p>
                <p className="mt-0.5 leading-relaxed">{errorMessage || "The transaction could not be completed. Please try again."}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider hover:bg-red-700 transition cursor-pointer"
              >
                <T en="Retry Payment" ta="மீண்டும் முயற்சி செய்க" />
              </button>
            </div>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold"><T en="Checkout Closed" ta="சாளரம் மூடப்பட்டது" /></p>
              <p className="mt-0.5">
                <T
                  en="You closed the payment modal. Click Pay Now below to complete your listing."
                  ta="நீங்கள் கட்டண சாளரத்தை மூடிவிட்டீர்கள். பட்டியலிட கீழே உள்ள பொத்தானை அழுத்தவும்."
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

        {/* Primary Checkout Button: Opens Razorpay Standard Checkout with Server Order */}
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
                <T en="Opening Razorpay Checkout…" ta="கட்டண தளம் திறக்கப்படுகிறது…" />
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

          {/* Official Razorpay Subscription Widget fallback */}
          {getPlanSubscriptionButtonId(plan.id, billingCycle) && (
            <div className="pt-2 flex flex-col items-center justify-center gap-1.5 border-t border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant/70">
                <T en="Or subscribe via Razorpay widget:" ta="அல்லது ரேசர்பே விட்ஜெட் மூலம் சந்தா பெறுக:" />
              </span>
              <div className="w-full flex justify-center py-1">
                <RazorpaySubscriptionWidget
                  key={`${plan.id}-${billingCycle}-${getPlanSubscriptionButtonId(plan.id, billingCycle)}`}
                  subscriptionButtonId={getPlanSubscriptionButtonId(plan.id, billingCycle)}
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
              className="w-full py-2.5 h-auto text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <T en="← Choose a Different Plan" ta="← வேறு திட்டத்தைத் தேர்ந்தெடுக்கவும்" />
            </Button>
          )}
        </div>

        {/* Security & Badges */}
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
