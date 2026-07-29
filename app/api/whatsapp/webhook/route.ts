import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client
// Using service_role key if available for administrative DB access, falling back to anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Meta Webhook Handshake Verification
 * GET /api/whatsapp/webhook
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp Webhook Handshake verified successfully.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("WhatsApp Webhook Handshake verification failed. Tokens mismatched.");
  return new Response("Forbidden", { status: 403 });
}

/**
 * Handle incoming Meta WhatsApp webhook events
 * POST /api/whatsapp/webhook
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Log the full payload for debugging/auditing purposes
    console.log("Incoming WhatsApp Webhook Payload:", JSON.stringify(payload, null, 2));

    // Fast-Ack: Return 200 OK immediately under 20s as required by Meta
    // Processing is executed asynchronously
    processWebhookPayload(payload).catch((err) => {
      console.error("Error processing WhatsApp Webhook payload asynchronously:", err);
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("Error parsing WhatsApp webhook payload:", error);
    return NextResponse.json({ error: error.message || "Bad Request" }, { status: 400 });
  }
}

/**
 * Process Meta webhook payload and store details in Supabase
 */
async function processWebhookPayload(payload: any) {
  if (!payload || payload.object !== "whatsapp_business_account") {
    return;
  }

  const entries = payload.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value || {};
      
      // 1. Detect incoming user messages
      if (value.messages && value.messages.length > 0) {
        for (const msg of value.messages) {
          const phone = msg.from;
          const messageType = msg.type || "text";
          
          console.log(`Detected incoming user message from ${phone} of type ${messageType}`);

          const { error } = await supabase.from("whatsapp_messages").insert({
            direction: "in",
            phone,
            message_type: messageType,
            payload,
            status: "received",
          });

          if (error) {
            console.error("Failed to insert incoming user message to Supabase:", error);
          }
        }
      }

      // 2. Detect message status updates (delivered/read/failed)
      if (value.statuses && value.statuses.length > 0) {
        for (const statusObj of value.statuses) {
          const phone = statusObj.recipient_id;
          const status = statusObj.status; // e.g. 'delivered', 'read', 'failed'
          
          console.log(`Detected status update for recipient ${phone}: ${status}`);

          const { error } = await supabase.from("whatsapp_messages").insert({
            direction: "out",
            phone,
            message_type: "status_update",
            payload,
            status,
          });

          if (error) {
            console.error("Failed to insert status update to Supabase:", error);
          }
        }
      }
    }
  }
}
