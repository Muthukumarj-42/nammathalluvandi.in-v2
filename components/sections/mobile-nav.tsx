"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";

export function MobileNav() {
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
          <Home className="w-5 h-5" />
          <span>Home</span>
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
          <span>Browse</span>
        </Link>

        {/* Sell/List Button - Elevated Circular */}
        <div className="flex flex-col items-center justify-start w-16 relative">
          <Link
            href="/publish"
            className="absolute -top-5 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-md border-4 border-surface transition-transform active:scale-95">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </div>
            <span className={`text-[10px] font-bold mt-1 ${pathname === "/publish" ? "text-primary" : "text-on-surface-variant/60"}`}>
              List
            </span>
          </Link>
        </div>

        <Link
          href="/contact"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 transition-colors ${pathname === "/contact" ? "text-primary" : "text-on-surface-variant/60 hover:text-primary"}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Contact</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 transition-colors ${pathname === "/profile" ? "text-primary" : "text-on-surface-variant/60 hover:text-primary"}`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
