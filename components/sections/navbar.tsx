"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/sections/language-toggle";

const nav = [
  ["Home", "முகப்பு", "/"],
  ["Explore", "வண்டிகள்", "/explore"],
  ["List", "என் வண்டி சேர்க்க", "/publish"],
  ["Contact", "தொடர்பு", "/contact"]
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        {/* Right: Controls (Notifications, Language Toggle) */}
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
            {nav.map(([label, tamil, href]) => (
              <Link key={href} href={href} className={`font-display text-xs lg:text-sm tracking-[0.08em] lg:tracking-[0.12em] uppercase transition hover:text-primary-container whitespace-nowrap ${pathname === href ? "text-primary-container" : "text-on-surface-variant"}`}>
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
            <Button asChild className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-xl font-display text-xs lg:text-sm tracking-[0.08em] lg:tracking-[0.12em] uppercase shrink-0 h-9 lg:h-11 px-3 lg:px-6">
              <Link href="/contact#enquiry-form" className="flex items-center gap-1 lg:gap-1.5 whitespace-nowrap">
                <MessageCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                <span className="en">Chat</span>
                <span className="ta tamil-text">💬 WhatsApp</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
