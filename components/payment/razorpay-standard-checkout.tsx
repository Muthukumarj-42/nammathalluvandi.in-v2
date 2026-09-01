"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface RazorpayStandardCheckoutProps {
  amountInPaise: number; // e.g. 9900 for ₹99
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (paymentDetails: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
  className?: string;
  buttonText?: string;
}

export function RazorpayStandardCheckout({
  amountInPaise,
  name = "Namma Thalluvandi",
  description = "Food Cart Booking & Listing",
  prefill,
  onSuccess,
  onFailure,
  onDismiss,
  className = "",
  buttonText,
}: RazorpayStandardCheckoutProps) {
  const [loading, setLoading] = useState(false);

  // Load checkout.js script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleOpenCheckout = async () => {
    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // 2. Open standard modal
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || "",
          email: prefill?.email || "",
          contact: prefill?.contact || "",
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (onDismiss) onDismiss();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setLoading(false);
          // 3. Call verify-payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            onSuccess(response);
          } else {
            if (onFailure) onFailure(verifyData.error || "Signature verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (err: any) => {
        setLoading(false);
        if (onFailure) onFailure(err);
      });
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      if (onFailure) onFailure(err);
    }
  };

  const displayAmount = `₹${(amountInPaise / 100).toLocaleString("en-IN")}`;

  return (
    <Button
      onClick={handleOpenCheckout}
      disabled={loading}
      className={`w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Opening Checkout…</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span>{buttonText || `Pay ${displayAmount} Now`}</span>
        </span>
      )}
    </Button>
  );
}
