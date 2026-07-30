// supabase/functions/verify-whatsapp-otp/index.ts
// Verify incoming OTP, enforce attempt limits, and mark verification success

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatPhoneNumber } from "../_shared/whatsapp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ verified: false, reason: "Phone number and OTP code are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    const cleanOtp = otp.trim();

    // 1. Fetch latest OTP request for this phone number
    const { data: record, error: selectError } = await supabaseClient
      .from("otp_verifications")
      .select("*")
      .eq("phone", cleanPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error("Database query failed while fetching OTP record:", selectError);
      throw selectError;
    }

    if (!record) {
      return new Response(
        JSON.stringify({ verified: false, reason: "No OTP request found for this phone number." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check if already verified
    if (record.verified) {
      return new Response(
        JSON.stringify({ verified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check attempts: Max 5 attempts allowed
    if (record.attempts >= 5) {
      return new Response(
        JSON.stringify({ verified: false, reason: "Maximum verification attempts reached." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Check expiry: Must be within 10 minutes
    const now = new Date();
    const expiry = new Date(record.expires_at);
    if (now > expiry) {
      return new Response(
        JSON.stringify({ verified: false, reason: "OTP has expired." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Increment attempt count in database immediately
    const nextAttempts = record.attempts + 1;
    const { error: updateAttemptsErr } = await supabaseClient
      .from("otp_verifications")
      .update({ attempts: nextAttempts })
      .eq("id", record.id);

    if (updateAttemptsErr) {
      console.error("Failed to increment verification attempt count:", updateAttemptsErr);
      throw updateAttemptsErr;
    }

    // 6. Compare OTP
    if (record.otp === cleanOtp) {
      // Success: mark as verified
      const { error: updateVerifiedErr } = await supabaseClient
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", record.id);

      if (updateVerifiedErr) {
        console.error("Failed to update verification status:", updateVerifiedErr);
        throw updateVerifiedErr;
      }

      return new Response(
        JSON.stringify({ verified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Failure: invalid code
    return new Response(
      JSON.stringify({ verified: false, reason: "Invalid OTP." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("verify-whatsapp-otp function error:", err);
    return new Response(
      JSON.stringify({ verified: false, reason: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
