// supabase/functions/send-vendor-notification/index.ts
// Send vendor booking alert notification template via Meta WhatsApp Cloud API

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
    const { phone, booking_code, renter_name, renter_phone, cart_name, date } = await req.json();

    if (!phone || !booking_code || !renter_name || !renter_phone || !cart_name || !date) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required vendor notification variables." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parameters for vendor_booking_alert template:
    // 1. Customer Name
    // 2. Phone
    // 3. Booking ID
    // 4. Rental Date
    // 5. Cart Name
    const parameters = [
      { type: "text" as const, text: renter_name },
      { type: "text" as const, text: renter_phone },
      { type: "text" as const, text: booking_code },
      { type: "text" as const, text: date },
      { type: "text" as const, text: cart_name }
    ];

    await sendWhatsAppTemplate(phone, "vendor_booking_alert", parameters);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("send-vendor-notification function error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
