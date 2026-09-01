"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, RefreshCw, X, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { ListingPlan, BillingCycle, getPlanPricing, formatCurrency } from "@/lib/plans";
import { RazorpayEmbedButton } from "@/components/payment/razorpay-embed-button";
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
  onSuccess: (details: {
    paymentId: string;
    amount: number;
    planId: string;
    billingCycle: string;
  }) => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
}

export function RazorpayPlanCheckout({
  plan,
  billingCycle,
  user,
  onSuccess,
  onFailure,
  onCancel,
}: RazorpayPlanCheckoutProps) {
  const pricing = getPlanPricing(plan.id, billingCycle);
  const amount = pricing.price;

  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "initiated" | "pending" | "success" | "failed" | "cancelled"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleStartPayment = () => {
    setPaymentStatus("initiated");
    setErrorMessage("");
    setShowTestModal(true);
  };

  const handleSimulateSuccess = () => {
    setLoading(true);
    setPaymentStatus("pending");

    setTimeout(() => {
      const testPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setPaymentStatus("success");
      setLoading(false);
      setShowTestModal(false);

      onSuccess({
        paymentId: testPaymentId,
        amount,
        planId: plan.id,
        billingCycle,
      });
    }, 800);
  };

  const handleSimulateFailure = () => {
    setLoading(true);
    setPaymentStatus("pending");

    setTimeout(() => {
      const errorMsg = "Payment declined by bank or simulator. Please try again.";
      setPaymentStatus("failed");
      setErrorMessage(errorMsg);
      setLoading(false);
      if (onFailure) onFailure(errorMsg);
    }, 600);
  };

  const handleSimulateCancel = () => {
    setPaymentStatus("cancelled");
    setShowTestModal(false);
    if (onCancel) onCancel();
  };

  const handleRetry = () => {
    setPaymentStatus("initiated");
    setErrorMessage("");
    setShowTestModal(true);
  };

  const cycleLabelEn = billingCycle === "1_month" ? "1 Month" : "3 Months";
  const cycleLabelTa = billingCycle === "1_month" ? "1 மாதம்" : "3 மாதங்கள்";

  return (
    <div className="w-full space-y-4">
      {/* Official Razorpay Embedded Payment Button Form */}
      <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-5">
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

        {/* Status Banners */}
        {paymentStatus === "failed" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                <T en="Payment Failed" ta="பணம் செலுத்துதல் தோல்வியடைந்தது" />
              </p>
              <p className="text-xs mt-0.5">{errorMessage || "The transaction could not be completed."}</p>
            </div>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                <T en="Payment Cancelled" ta="பணம் செலுத்துதல் ரத்து செய்யப்பட்டது" />
              </p>
              <p className="text-xs mt-0.5">
                <T
                  en="You cancelled the transaction. You can retry anytime."
                  ta="பரிவர்த்தனை ரத்து செய்யப்பட்டது. மீண்டும் முயற்சிக்கலாம்."
                />
              </p>
            </div>
          </div>
        )}

        {/* Razorpay Button Embed */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-on-surface-variant font-medium text-center">
            <T en="Pay via Official Razorpay Payment Button:" ta="ரேசர்பே கட்டண பொத்தான் மூலம் செலுத்தவும்:" />
          </p>
          <RazorpayEmbedButton buttonId="pl_TPLo63skjtat6p" />
        </div>

        {/* Or Interactive Test / Direct Checkout */}
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/20" />
          </div>
          <span className="relative px-3 bg-surface text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            <T en="OR TEST MODE SIMULATION" ta="அல்லது சோதனை முறை" />
          </span>
        </div>

        {/* Primary Action Button */}
        {paymentStatus === "failed" || paymentStatus === "cancelled" ? (
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              className="flex-1 py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-wider"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <T en="Retry Payment" ta="மீண்டும் பணம் செலுத்தவும்" />
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="py-4 h-auto rounded-xl border-outline-variant/40 hover:bg-surface-container text-sm font-medium"
              >
                <T en="Change Plan" ta="திட்டத்தை மாற்றவும்" />
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleStartPayment}
            disabled={loading}
            className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md transition active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <T en="Processing…" ta="செயலாக்கப்படுகிறது…" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <T
                  en={`Confirm ${formatCurrency(amount)} & Submit Cart`}
                  ta={`${formatCurrency(amount)} உறுதிப்படுத்தி வண்டி சேர்`}
                />
              </span>
            )}
          </Button>
        )}

        {/* Security / Razorpay badges */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <T en="Razorpay Secure Test Gateway" ta="ரேசர்பே பாதுகாப்பான பரிவர்த்தனை" />
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant/60">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Interactive Razorpay Test Modal Dialog */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant/40 shadow-2xl max-w-md w-full p-6 text-on-surface animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h3 className="font-bold text-base font-display text-on-surface">
                    Razorpay Checkout (Test Mode)
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    NTV Merchant: Namma Thalluvandi Marketplace
                  </p>
                </div>
              </div>
              <button
                onClick={handleSimulateCancel}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plan Info Card in Modal */}
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/20 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">
                  <T en="Listing Plan:" ta="திட்டம்:" />
                </span>
                <span className="font-semibold text-on-surface">
                  <T en={plan.nameEn} ta={plan.nameTa} /> ({cycleLabelEn})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">
                  <T en="Cart Quota:" ta="வண்டிகளின் வரம்பு:" />
                </span>
                <span className="font-semibold text-emerald-600">
                  {plan.maxCarts} <T en="Carts" ta="வண்டிகள்" />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">
                  <T en="Customer:" ta="வாடிக்கையாளர்:" />
                </span>
                <span className="font-medium text-on-surface truncate max-w-[200px]">
                  {user.name || user.phone || user.email || "Vendor"}
                </span>
              </div>
              <div className="border-t border-outline-variant/20 pt-2 flex justify-between items-center">
                <span className="font-bold text-sm text-on-surface">
                  <T en="Amount to Pay:" ta="செலுத்த வேண்டிய தொகை:" />
                </span>
                <span className="text-xl font-bold font-display text-primary">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant/80 mb-5 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-900">
              💡 <strong>Test Mode Simulation:</strong> In this test environment, you can test both successful payment completion and failure handling with real-time state updates.
            </p>

            {/* Modal Actions */}
            <div className="space-y-2.5">
              <Button
                onClick={handleSimulateSuccess}
                disabled={loading}
                className="w-full py-3.5 h-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                <T
                  en={`Simulate Successful Payment (${formatCurrency(amount)})`}
                  ta={`வெற்றிகரமாக செலுத்தவும் (${formatCurrency(amount)})`}
                />
              </Button>

              <Button
                variant="outline"
                onClick={handleSimulateFailure}
                disabled={loading}
                className="w-full py-3 h-auto rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/5 text-xs font-semibold"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                <T en="Simulate Payment Failure (Test Error)" ta="தோல்வியை சோதிக்கவும்" />
              </Button>

              <Button
                variant="ghost"
                onClick={handleSimulateCancel}
                disabled={loading}
                className="w-full py-2.5 h-auto rounded-xl text-on-surface-variant hover:bg-surface-container text-xs"
              >
                <T en="Cancel Transaction" ta="பரிவர்த்தனையை ரத்து செய்" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
