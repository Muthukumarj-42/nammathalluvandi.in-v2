"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Phone, Search, PlusCircle, User } from "lucide-react";

import { LanguageToggle } from "@/components/sections/language-toggle";



export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface-container/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-premium backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-5 z-40 md:hidden">
        <LanguageToggle compact />
      </div>
      <div className="flex h-16 items-stretch">
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/" ? "text-primary" : "text-muted"}`}
        >
          <Home size={20} className="shrink-0" />
          <span className="en">Home</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="முகப்பு">முகப்பு</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/search" ? "text-primary" : "text-muted"}`}
        >
          <Search size={20} className="shrink-0" />
          <span className="en">Search</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="தேடல்">தேடல்</span>
        </Link>

        <Link
          href="/sell"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/sell" ? "text-primary" : "text-muted"}`}
        >
          <PlusCircle size={20} className="shrink-0" />
          <span className="en">Sell</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="விற்க">விற்க</span>
        </Link>

        <Link
          href="/contact"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/contact" ? "text-primary" : "text-muted"}`}
        >
          <Phone size={20} className="shrink-0" />
          <span className="en">Contact</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="தொடர்பு">தொடர்பு</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/profile" ? "text-primary" : "text-muted"}`}
        >
          <User size={20} className="shrink-0" />
          <span className="en">Profile</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="சுயவிவரம்">சுயவிவரம்</span>
        </Link>
      </div>
    </nav>
  );
}
