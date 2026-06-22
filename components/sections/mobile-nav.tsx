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
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/" ? "text-error" : "text-muted"}`}
        >
          <Home size={20} className="shrink-0" />
          <span className="en">Home</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="முகப்பு">முகப்பு</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/search" ? "text-error" : "text-muted"}`}
        >
          <Search size={20} className="shrink-0" />
          <span className="en">Browse</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="தேடல்">தேடல்</span>
        </Link>

        <div className="flex flex-1 justify-center relative">
          <Link
            href="/sell"
            className="absolute -top-6 flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 bg-error text-white rounded-full flex items-center justify-center shadow-lg border-4 border-surface">
              <PlusCircle size={28} className="shrink-0" />
            </div>
            <span className={`text-[10px] font-bold text-center mt-1 ${pathname === "/sell" ? "text-error" : "text-error"}`}>
              <span className="en">Sell</span>
              <span className="ta tamil-text leading-tight truncate max-w-full" title="விற்க">விற்க</span>
            </span>
          </Link>
        </div>

        <Link
          href="/contact"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/contact" ? "text-error" : "text-muted"}`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span className="en">Chats</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="அரட்டை">அரட்டை</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold text-center px-1 ${pathname === "/profile" ? "text-error" : "text-muted"}`}
        >
          <User size={20} className="shrink-0" />
          <span className="en">Profile</span>
          <span className="ta tamil-text leading-tight truncate max-w-full" title="சுயவிவரம்">சுயவிவரம்</span>
        </Link>
      </div>
    </nav>
  );
}
