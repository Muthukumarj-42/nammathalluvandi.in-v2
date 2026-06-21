"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, PhoneCall, ShoppingCart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CALL_PHONE, rentalTamilMessage } from "@/lib/utils";
import { LanguageToggle } from "@/components/sections/language-toggle";
import { WA_NUMBER, buildWAUrl } from "@/config/whatsapp";
import { useCartStore } from "@/lib/store";

const nav = [
  ["Home", "முகப்பு", "/"],
  ["Explore", "வண்டிகள்", "/explore"],
  ["How It Works", "எப்படி?", "/how-it-works"],
  ["Publish Cart", "என் வண்டி சேர்க்க", "/publish"],
  ["Contact", "தொடர்பு", "/contact"]
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Mobile Header (below 768px) */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-outline-variant bg-surface/90 backdrop-blur-md px-4 md:hidden">
        {/* Left Placeholder for symmetry */}
        <div className="w-8"></div>

        {/* Center: Brand Logo & Text */}
        <Link href="/" className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2" aria-label="Thalluvandi home">
          <Image 
            src="/brand/full-logo.webp" 
            alt="Thalluvandi food cart rental Tamil Nadu logo" 
            width={48} 
            height={48} 
            sizes="48px"
            className="h-6 w-auto shrink-0" 
            priority={true}
          />
          <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-[0.12em] text-ink always-bebas whitespace-nowrap">
            THALLUVANDI
          </span>
        </Link>

        {/* Right: Cart Button */}
        <div className="flex items-center gap-1">
          <Link href="/notifications" className="relative p-2 text-ink/78 hover:text-primary transition" aria-label="Notifications">
            <Bell size={20} />
          </Link>
          <Link href="/cart" className="relative p-2 text-ink/78 hover:text-primary transition" aria-label="Cart">
            <ShoppingCart size={20} />
            {mounted && cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Desktop Header (768px+) */}
      <header className={`fixed inset-x-0 top-0 z-50 hidden border-b border-outline-variant bg-surface text-ink transition-all duration-300 md:block ${scrolled ? "shadow-sm backdrop-blur-xl" : ""}`}>
        <div className="site-container flex h-20 items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3 shrink-0" aria-label="Thalluvandi home">
            <Image src="/brand/text-logo.webp" alt="Thalluvandi food cart rental Tamil Nadu logo" width={230} height={88} priority sizes="230px" className="h-12 lg:h-14 w-auto transition-transform duration-300 group-hover:scale-105" />
          </Link>

          <nav className="hidden items-center gap-3 lg:gap-6 md:flex overflow-hidden">
            {nav.map(([label, tamil, href]) => (
              <Link key={href} href={href} className={`text-[10px] lg:text-xs font-bold uppercase tracking-[0.14em] transition hover:text-primary whitespace-nowrap ${pathname === href ? "text-primary" : "text-ink/78"}`}>
                <span className="en">{label}</span>
                <span className="ta tamil-text">{tamil}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:gap-3 md:flex shrink-0">
            <LanguageToggle />
            <Link href="/notifications" className="relative p-2 text-ink/78 hover:text-primary transition shrink-0" aria-label="Notifications">
              <Bell size={20} />
            </Link>
            <Link href="/cart" className="relative p-2 text-ink/78 hover:text-primary transition shrink-0" aria-label="Cart">
              <ShoppingCart size={20} />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <Button asChild size="default" className="bg-primary text-on-primary rounded-full hover:bg-primary/90 shrink-0">
              <Link href="/contact#enquiry-form" className="flex items-center gap-1.5 whitespace-nowrap">
                <MessageCircle size={18} className="shrink-0" />
                <span className="en">💬 Chat</span>
                <span className="ta tamil-text">💬 WhatsApp</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
