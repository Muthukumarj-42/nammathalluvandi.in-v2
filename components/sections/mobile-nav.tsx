"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/20 bg-surface/95 backdrop-blur-md px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-[60px] items-stretch justify-around max-w-md mx-auto relative">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 transition-colors ${pathname === "/" ? "text-primary" : "text-on-surface-variant/60 hover:text-primary"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>
            <Text en="Home" ta="முகப்பு" />
          </span>
        </Link>

        <Link
          href="/explore"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 transition-colors ${pathname === "/explore" ? "text-primary" : "text-on-surface-variant/60 hover:text-primary"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>
            <Text en="Browse" ta="வண்டிகள்" />
          </span>
        </Link>

        {/* Sell/List Button - Elevated Circular */}
        <div className="flex flex-col items-center justify-start w-16 relative">
          <Link
            href="/publish"
            className="absolute -top-5 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-md border-4 border-surface transition-transform active:scale-95">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className={`text-[10px] font-bold mt-1 ${pathname === "/publish" ? "text-primary" : "text-on-surface-variant/60"}`}>
              <Text en="List" ta="பதிவிட" />
            </span>
          </Link>
        </div>

        <Link
          href="/contact#enquiry-form"
          scroll={false}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 transition-colors ${pathname === "/contact" ? "text-primary" : "text-on-surface-variant/60 hover:text-primary"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>
            <Text en="Contact" ta="தொடர்பு" />
          </span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 transition-colors ${pathname === "/profile" ? "text-primary" : "text-on-surface-variant/60 hover:text-primary"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>
            <Text en="Profile" ta="சுயவிவரம்" />
          </span>
        </Link>
      </div>
    </nav>
  );
}
