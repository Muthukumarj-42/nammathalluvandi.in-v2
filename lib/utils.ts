import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CALL_PHONE = "+919442763940";
export const DISPLAY_CALL_PHONE = "+91 94427 63940";
export const DISPLAY_RENTAL_WHATSAPP = "+91 88382 92849";
export const DISPLAY_PUBLISH_WHATSAPP = "+91 73055 14199";

export const rentalTamilMessage = `வணக்கம், நான் தள்ளுவண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.

பெயர்:
தொலைபேசி:
தேவையான தேதி:
இடம் (கோவையில்):
கால அவகாசம்:
மேலும் விவரம்:`;

export function cartBookingMessage(cartNameTa: string) {
  return `வணக்கம், நான் ${cartNameTa} வாடகைக்கு எடுக்க விரும்புகிறேன்.

பெயர்:
தொலைபேசி:
தேவையான தேதி:
இடம் (கோவையில்):
கால அவகாசம்:
மேலும் விவரம்:`;
}

export const customCartMessage = `வணக்கம், நான் தனிப்பட்ட உணவு வண்டி வாங்க விரும்புகிறேன்.
பெயர்:
தொலைபேசி:
வண்டி அளவு:
வடிவமைப்பு விருப்பம்:
பட்ஜெட்:`;

export const publishCartMessage = `Hi, I want to list my food cart on Thalluvandi.

Name:
Phone:
Number of carts:
Cart type:
Rental price expectation:
Location (Tamil nadu):`;
