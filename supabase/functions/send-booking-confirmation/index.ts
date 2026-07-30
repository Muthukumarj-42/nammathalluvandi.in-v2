// supabase/functions/send-booking-confirmation/index.ts
// Send booking confirmation template to renter via Meta WhatsApp Cloud API

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendWhatsAppTemplate } from "../_shared/whatsapp.ts";

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
    const { phone, booking_code, renter_name, cart_name, date } = await req.json();

    if (!phone || !booking_code || !renter_name || !cart_name || !date) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required booking variables." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parameters for booking_success template:
    // 1. Customer Name
    // 2. Booking ID
    // 3. Cart Name
    // 4. Rental Date
    const parameters = [
      { type: "text" as const, text: renter_name },
      { type: "text" as const, text: booking_code },
      { type: "text" as const, text: cart_name },
      { type: "text" as const, text: date }
    ];

    await sendWhatsAppTemplate(phone, "booking_success", parameters);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("send-booking-confirmation function error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
