"use client";

import { useState } from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from "lucide-react";
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
  onCancel?: () => void;
}

export function RazorpayPlanCheckout({
  plan,
  billingCycle,
  user,
  onSuccess,
  onCancel,
}: RazorpayPlanCheckoutProps) {
  const pricing = getPlanPricing(plan.id, billingCycle);
  const amount = pricing.price;
  const [loading, setLoading] = useState(false);

  const handleConfirmPaid = () => {
    setLoading(true);
    const paymentId = `rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    onSuccess({
      paymentId,
      amount,
      planId: plan.id,
      billingCycle,
    });
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
              <T en="Total Payable" ta="செலுத்த வேண்டிய தொகை" />
            </p>
            <p className="text-2xl font-bold font-display text-primary">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Official Razorpay Embedded Payment Button */}
        <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/20 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xs text-on-surface-variant font-medium">
            <T
              en="Click below to complete secure payment via Razorpay:"
              ta="ரேசர்பே மூலம் பாதுகாப்பாக பணம் செலுத்த கீழே கிளிக் செய்யவும்:"
            />
          </p>

          {/* Official Razorpay Form Button Embed */}
          <div className="w-full flex justify-center py-1">
            <RazorpayEmbedButton buttonId="pl_TPLo63skjtat6p" />
          </div>

          <p className="text-[11px] text-on-surface-variant/70">
            UPI (Google Pay, PhonePe, Paytm), Net Banking, Debit / Credit Cards
          </p>
        </div>

        {/* Post-Payment Continuation CTA */}
        <div className="pt-2 space-y-3">
          <Button
            onClick={handleConfirmPaid}
            disabled={loading}
            className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span><T en="Activating Plan…" ta="திட்டம் செயல்படுத்தப்படுகிறது…" /></span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span><T en="I Have Completed Payment → Continue" ta="பணம் செலுத்தியாச்சு → வண்டி சேர்க்க" /></span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full py-2.5 h-auto text-xs text-on-surface-variant hover:text-on-surface"
            >
              <T en="← Change Plan" ta="← திட்டத்தை மாற்றவும்" />
            </Button>
          )}
        </div>

        {/* Security / Razorpay badges */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <T en="Official Razorpay Gateway" ta="அதிகாரப்பூர்வ ரேசர்பே தளம்" />
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant/60">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
