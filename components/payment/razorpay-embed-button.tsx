"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface RazorpayEmbedButtonProps {
  buttonId?: string;
  className?: string;
}

export function RazorpayEmbedButton({
  buttonId = "pl_TPLo63skjtat6p",
  className = "",
}: RazorpayEmbedButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formRef.current) return;

    // Clear any previous button instance to prevent duplicate injection
    formRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", buttonId);
    script.async = true;

    script.onload = () => {
      setLoading(false);
    };

    script.onerror = () => {
      setLoading(false);
      console.warn("Could not load Razorpay payment-button script.");
    };

    formRef.current.appendChild(script);

    return () => {
      if (formRef.current) {
        formRef.current.innerHTML = "";
      }
    };
  }, [buttonId]);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[50px] ${className}`}>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant py-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading Razorpay Payment Button…</span>
        </div>
      )}
      <form ref={formRef} className="w-full flex justify-center razorpay-form-wrapper" />
    </div>
  );
}
