import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function WhatsAppFloat() {
  return (
    <Link
      href="/contact#enquiry-form"
      className="fixed bottom-[114px] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition hover:scale-110 active:scale-95 md:bottom-5"
      aria-label="WhatsApp booking"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle className="relative" size={26} />
    </Link>
  );
}
