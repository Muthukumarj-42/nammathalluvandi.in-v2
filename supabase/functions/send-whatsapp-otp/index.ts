// supabase/functions/send-whatsapp-otp/index.ts
// Generate, save, rate-limit, and send WhatsApp OTP authentication code

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWhatsAppAuthOTP, formatPhoneNumber } from "../_shared/whatsapp.ts";

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

    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ success: false, message: "A valid phone number is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);

    // 1. Rate Limiting check: Only 1 OTP sent every 60 seconds per phone number
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentOtps, error: checkError } = await supabaseClient
      .from("otp_verifications")
      .select("created_at")
      .eq("phone", cleanPhone)
      .gt("created_at", oneMinuteAgo)
      .order("created_at", { ascending: false });

    if (checkError) {
      console.error("Database query failed while checking rate limits:", checkError);
      throw checkError;
    }

    if (recentOtps && recentOtps.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please wait 60 seconds before requesting another OTP."
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Generate secure 6-digit OTP code
    // Cryptographically secure random integer generation
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const otpVal = (randomArray[0] % 900000) + 100000; // ensures exactly 6-digits 100000 - 999999
    const otp = otpVal.toString();

    // OTP Expiry: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Store OTP in database
    const { error: insertError } = await supabaseClient
      .from("otp_verifications")
      .insert([
        {
          phone: cleanPhone,
          otp: otp,
          expires_at: expiresAt,
          attempts: 0,
          verified: false
        }
      ]);

    if (insertError) {
      console.error("Database insertion failed for OTP registration:", insertError);
      throw insertError;
    }

    // 4. Send the OTP code via Meta Authentication Template payload
    await sendWhatsAppAuthOTP(cleanPhone, otp, "otp_verification");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("send-whatsapp-otp function error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
