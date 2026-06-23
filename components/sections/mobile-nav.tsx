"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-[60px] items-stretch justify-around max-w-md mx-auto relative">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 ${pathname === "/" ? "text-[#dc2626]" : "text-gray-500"}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/explore"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 ${pathname === "/explore" ? "text-[#dc2626]" : "text-gray-500"}`}
        >
          {/* Using a generic box/browse icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Browse</span>
        </Link>

        {/* Sell Button - Elevated Circular */}
        <div className="flex flex-col items-center justify-start w-16 relative">
          <Link
            href="/sell"
            className="absolute -top-5 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-[#dc2626] text-white rounded-full flex items-center justify-center shadow-md border-4 border-white">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </div>
            <span className={`text-[10px] font-bold mt-1 ${pathname === "/sell" ? "text-[#dc2626]" : "text-gray-500"}`}>
              Sell
            </span>
          </Link>
        </div>

        <Link
          href="/chats"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 ${pathname === "/chats" ? "text-[#dc2626]" : "text-gray-500"}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chats</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold w-16 ${pathname === "/profile" ? "text-[#dc2626]" : "text-gray-500"}`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
