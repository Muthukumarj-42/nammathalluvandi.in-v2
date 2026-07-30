// hooks/useWhatsappOTP.ts
// Reusable React hook for sending and verifying WhatsApp OTPs

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";

export function useWhatsappOTP() {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  /**
   * Triggers generation and WhatsApp delivery of an OTP code to a phone number.
   */
  const sendOTP = async (phone: string): Promise<boolean> => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError("Phone number is required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("send-whatsapp-otp", {
        body: { phone: cleanPhone }
      });

      if (invokeErr) {
        setError(invokeErr.message || "Failed to send OTP.");
        setLoading(false);
        return false;
      }

      if (data && data.success === false) {
        setError(data.message || "Failed to send OTP.");
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error("sendOTP hook failure:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
      return false;
    }
  };

  /**
   * Verifies the user entered OTP code against the latest generated OTP.
   */
  const verifyOTP = async (phone: string, otpCode: string): Promise<boolean> => {
    const cleanPhone = phone.trim();
    const cleanCode = otpCode.trim();

    if (!cleanPhone || !cleanCode) {
      setError("Phone number and OTP code are required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("verify-whatsapp-otp", {
        body: { phone: cleanPhone, otp: cleanCode }
      });

      if (invokeErr) {
        setError(invokeErr.message || "Verification failed.");
        setLoading(false);
        return false;
      }

      if (data && data.verified) {
        setVerified(true);
        setLoading(false);
        return true;
      } else {
        setError(data?.reason || "Invalid OTP.");
        setLoading(false);
        return false;
      }
    } catch (err: any) {
      console.error("verifyOTP hook failure:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    verified,
    error,
    sendOTP,
    verifyOTP,
    setVerified,
    setError
  };
}
