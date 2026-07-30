// supabase/functions/_shared/whatsapp.ts
// Shared helper for sending templates via Meta WhatsApp Cloud API

export const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";
export const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "";

export interface TemplateParameter {
  type: "text";
  text: string;
}

/**
 * Normalizes any phone number into pure digits (without '+' or leading '0' prefix)
 * prepending the country code (default 91 for India) if it's a 10 digit number.
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.trim().replace(/\D/g, "");
  
  // If it starts with 0 and has 11 digits, strip the leading 0
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // If it's a 10 digit number, prepend India country code 91
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  
  return cleaned;
}

/**
 * Invokes Meta's Cloud API to send a WhatsApp template to a recipient.
 */
export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  parameters: TemplateParameter[],
  buttonParameters?: TemplateParameter[]
) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error("Missing WhatsApp credentials. WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN not set.");
    throw new Error("WhatsApp Cloud API configuration is missing.");
  }

  const cleanPhone = formatPhoneNumber(toPhone);
  const url = `https://graph.facebook.com/v24.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const components: any[] = [
    {
      type: "body",
      parameters: parameters,
    }
  ];

  if (buttonParameters && buttonParameters.length > 0) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: buttonParameters,
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "en"
      },
      components: components
    }
  };

  console.log(`Sending WhatsApp Template message to ${cleanPhone} [Template: ${templateName}]`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  console.log(`WhatsApp API response for ${cleanPhone}:`, responseText);

  if (!response.ok) {
    throw new Error(`WhatsApp API request failed: ${responseText}`);
  }

  return JSON.parse(responseText);
}
