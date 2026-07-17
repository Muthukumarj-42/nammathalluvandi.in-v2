"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Bell, User, Store, Shield, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/sections/language-toggle";
import { useAuth, USE_TEMPORARY_PHONE_LOGIN } from "@/context/auth-context";

const nav = [
  ["Home", "முகப்பு", "/"],
  ["Explore", "வண்டிகள்", "/explore"],
  ["List", "என் வண்டி சேர்க்க", "/publish"],
  ["Contact", "தொடர்பு", "/contact#enquiry-form"]
];

// ─── User avatar menu ─────────────────────────────────────────────────────────
function UserMenu() {
  const { user, profile, roles, isAdmin, isVendor, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || !(isVendor || isAdmin)) {
    return null;
  }

  const initials = (profile?.name ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        id="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition"
        aria-expanded={open}
      >
        {profile?.avatar ? (
          <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#dc2626] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-3 border-b border-outline-variant/20">
              <p className="font-semibold text-sm text-on-surface truncate">{profile?.name ?? "User"}</p>
              <p className="text-xs text-on-surface-variant truncate">{profile?.email}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {roles.map((r) => (
                  <span key={r} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    r === "ADMIN" || r === "SUPER_ADMIN" ? "bg-purple-900/40 text-purple-300" :
                    r === "VENDOR" ? "bg-amber-900/40 text-amber-300" :
                    "bg-blue-900/40 text-blue-300"
                  }`}>{r}</span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="py-1.5">
              {!USE_TEMPORARY_PHONE_LOGIN && (
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-dim/50 transition"
                >
                  <User size={15} className="text-on-surface-variant" />
                  <span className="en">My Profile</span>
                  <span className="ta tamil-text">சுயவிவரம்</span>
                </Link>
              )}

              {isVendor && (
                <Link
                  href="/vendor/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-dim/50 transition"
                >
                  <Store size={15} className="text-amber-400" />
                  <span className="en">Vendor Dashboard</span>
                  <span className="ta tamil-text">விற்பனையாளர்</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-dim/50 transition"
                >
                  <Shield size={15} className="text-purple-400" />
                  <span className="en">Admin Panel</span>
                  <span className="ta tamil-text">நிர்வாகம்</span>
                </Link>
              )}
            </div>

            {/* Sign out */}
            <div className="border-t border-outline-variant/20 py-1.5">
              <button
                id="navbar-signout-btn"
                onClick={() => { setOpen(false); signOut(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/10 transition"
              >
                <LogOut size={15} />
                <span className="en">Sign Out</span>
                <span className="ta tamil-text">வெளியேறு</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isVendor, isAdmin } = useAuth();
  const showVendorActions = isVendor || isAdmin;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleNav = nav.filter(([label, tamil, href]) => {
    if (href === "/publish") return showVendorActions;
    return true;
  });

  return (
    <>
      {/* Mobile Header (below 768px) */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-outline-variant/20 bg-surface/95 backdrop-blur-sm px-4 md:hidden">
        {/* Left: Brand Logo & Text */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0" aria-label="Thalluvandi home">
          <span className="font-display text-lg font-black uppercase tracking-[0.08em] text-on-surface">
            THALLUVANDI
          </span>
        </Link>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          <Link href="/notifications" className="relative p-1.5 text-on-surface-variant hover:text-primary transition shrink-0" aria-label="Notifications">
            <Bell size={18} />
          </Link>
          <LanguageToggle compact={true} />
        </div>
      </header>

      {/* Desktop Header (768px+) */}
      <header className={`fixed inset-x-0 top-0 z-50 hidden border-b border-outline-variant/20 bg-surface/95 text-on-surface transition-all duration-300 md:block ${scrolled ? "shadow-sm backdrop-blur-xl" : ""}`}>
        <div className="w-full px-6 xl:px-12 flex h-20 items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2 shrink-0" aria-label="Thalluvandi home">
            <span className="font-display text-lg lg:text-2xl xl:text-3xl font-black uppercase tracking-[0.1em] lg:tracking-[0.15em] text-on-surface transition-transform duration-300 group-hover:scale-105">
              THALLUVANDI
            </span>
          </Link>

          <nav className="hidden items-center gap-3 lg:gap-5 xl:gap-8 md:flex shrink-0">
            {visibleNav.map(([label, tamil, href]) => (
              <Link key={href} href={href} scroll={!href.includes("#")} className={`font-display text-xs lg:text-sm tracking-[0.08em] lg:tracking-[0.12em] uppercase transition hover:text-primary-container whitespace-nowrap ${pathname === href ? "text-primary-container" : "text-on-surface-variant"}`}>
                <span className="en">{label}</span>
                <span className="ta tamil-text">{tamil}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1.5 lg:gap-3 xl:gap-4 md:flex shrink-0">
            <Link href="/notifications" className="relative p-1.5 lg:p-2 text-on-surface-variant hover:text-primary-container transition shrink-0" aria-label="Notifications">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            <LanguageToggle />
            {/* Chat CTA — only for guests */}
            <Button asChild className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-xl font-display text-xs lg:text-sm tracking-[0.08em] lg:tracking-[0.12em] uppercase shrink-0 h-9 lg:h-11 px-3 lg:px-6">
              <Link href="/contact#enquiry-form" scroll={false} className="flex items-center gap-1 lg:gap-1.5 whitespace-nowrap">
                <MessageCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                <span className="en">Chat</span>
                <span className="ta tamil-text">CHAT</span>
              </Link>
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
