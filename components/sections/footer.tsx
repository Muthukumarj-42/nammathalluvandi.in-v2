import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Mail, Phone } from "lucide-react";
import {
  DISPLAY_CALL_PHONE,
  DISPLAY_RENTAL_WHATSAPP,
  rentalTamilMessage,
} from "@/lib/utils";
import { WA_NUMBER, buildWAUrl } from "@/config/whatsapp";

const groups = {
  Navigation: [
    ["Home", "முகப்பு", "/"],
    ["Explore Carts", "வண்டிகளை பாருங்க", "/explore"],
    ["How It Works", "எப்படி rent பண்ணுவது?", "/how-it-works"],
    ["Publish Cart", "என் வண்டி சேர்க்க", "/publish"],
  ],
  Branch: [
    ["Coimbatore Hub", "கோவை கிளை", "/contact"],
  ],
  Contact: [
    [DISPLAY_CALL_PHONE, DISPLAY_CALL_PHONE, "tel:+919442763940"],
    [
      DISPLAY_RENTAL_WHATSAPP,
      DISPLAY_RENTAL_WHATSAPP,
      buildWAUrl(WA_NUMBER, rentalTamilMessage),
    ],
    [
      "WhatsApp Enquiry",
      "வாட்ஸ்அப் விசாரணை",
      "/contact#enquiry-form",
    ],
  ],
};

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-outline-variant bg-surface pb-24 text-on-surface md:pb-0">
      <div className="site-container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Image
              src="/brand/full-logo-with-background.webp"
              alt="Thalluvandi food cart rental Tamil Nadu logo"
              width={168}
              height={82}
              sizes="168px"
              className="h-20 w-auto transition hover:scale-105"
            />
            <p className="mt-6 max-w-sm text-sm leading-7 text-on-surface-variant">
              <span className="en">
                Food cart rentals for Coimbatore vendors. Start your business with ease and low investment.
              </span>
              <span className="ta tamil-text">
                கோவையில் தொழில் தொடங்க சிறந்த தள்ளுவண்டிகள். குறைந்த முதலீட்டில் எளிய முறையில் ஆரம்பிக்கலாம்.
              </span>
            </p>
            <div className="mt-6 flex gap-3">
              {/* WhatsApp Icon Link */}
              <a
                href="https://wa.me/918838292849"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-11 w-11 place-items-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition"
              >
                <span className="sr-only">WhatsApp</span>
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 2.023 14.12 1 11.5 1c-5.438 0-9.863 4.372-9.867 9.802-.001 1.73.473 3.41 1.37 4.908l-.926 3.392 3.48-.912zm11.367-6.003c-.327-.164-1.938-.957-2.238-1.067-.3-.11-.518-.164-.738.164-.22.329-.85.164-1.04.164-.19-.163-.38-.328-.707-.492-1.285-.64-2.28-1.12-3.1-2.527-.2-.342.2-.317.575-.853.11-.22.055-.41-.027-.574-.082-.164-.738-1.777-1.01-2.434-.268-.64-.563-.55-.738-.56-.164-.01-.355-.01-.548-.01-.192 0-.507.072-.77.36-.263.289-1.004.983-1.004 2.396 0 1.413 1.027 2.78 1.17 2.973.143.193 2.023 3.09 4.9 4.336.685.297 1.22.474 1.637.607.688.219 1.314.187 1.81.114.55-.082 1.938-.793 2.21-1.56.273-.767.273-1.423.19-1.56-.081-.137-.3-.22-.627-.384z"/>
                </svg>
              </a>
              {/* Phone Icon Link */}
              <a
                href="tel:+919442763940"
                className="grid h-11 w-11 place-items-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition"
              >
                <span className="sr-only">Phone</span>
                <Phone size={18} />
              </a>
              {/* Instagram Icon Link - https://www.instagram.com/nammathalluvandi.in */}
              <a
                href="https://www.instagram.com/nammathalluvandi.in"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-11 w-11 place-items-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition"
              >
                <span className="sr-only">Instagram</span>
                <Instagram size={18} />
              </a>
            </div>
          </div>
          <div className="grid gap-9 sm:grid-cols-3">
            {Object.entries(groups).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {title}
                </h3>
                <ul className="mt-5 space-y-3 text-sm text-on-surface-variant">
                  {links.map(([label, tamil, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="transition hover:text-primary"
                      >
                        <span className="en">{label}</span>
                        <span className="ta tamil-text">{tamil}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-outline-variant pt-6 text-xs uppercase tracking-[0.14em] text-on-surface-variant md:flex-row md:justify-between">
          <div className="flex flex-col gap-1 normal-case tracking-normal">
            <span className="uppercase tracking-[0.14em]">© 2026 Namma Thalluvandi</span>
            <span>D. Nagaraj Thallu Vandi — 30+ Years of Trust</span>
            <span>Ondipudur, Coimbatore</span>
          </div>
          <span>
            <span className="en"></span>
            <span className="ta tamil-text"></span>
          </span>
        </div>
      </div>
    </footer>
  );
}
