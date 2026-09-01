"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface RazorpaySubscriptionWidgetProps {
  subscriptionButtonId: string;
  className?: string;
}

export function RazorpaySubscriptionWidget({
  subscriptionButtonId,
  className = "",
}: RazorpaySubscriptionWidgetProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formRef.current) return;

    // Clear previous instance to prevent duplicate script/button injection
    formRef.current.innerHTML = "";
    setLoading(true);

    const script = document.createElement("script");
    script.src = "https://cdn.razorpay.com/static/widget/subscription-button.js";
    script.setAttribute("data-subscription_button_id", subscriptionButtonId);
    script.setAttribute("data-button_theme", "brand-color");
    script.async = true;

    script.onload = () => {
      setLoading(false);
    };

    script.onerror = () => {
      setLoading(false);
      console.warn("Could not load Razorpay subscription widget script.");
    };

    formRef.current.appendChild(script);

    return () => {
      if (formRef.current) {
        formRef.current.innerHTML = "";
      }
    };
  }, [subscriptionButtonId]);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[54px] w-full ${className}`}>
      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant py-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading Razorpay Subscription Checkout…</span>
        </div>
      )}
      <form
        ref={formRef}
        className="w-full flex justify-center items-center razorpay-subscription-form"
      />
    </div>
  );
}
