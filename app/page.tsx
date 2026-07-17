"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Search, ChevronRight, MoreHorizontal, ChevronDown, PenTool, Wrench, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTent, IconIceCream, IconCoffee, IconRickshaw, IconSearchStove } from "@/components/ui/icons";
import { getLiveCartsAction } from "@/app/actions";
import { getLocalFallbackLocationName } from "@/lib/geocoding";
import { mapDbCartToCart } from "@/lib/carts";

function getCartLocationName(cart: any): string {
  return getLocalFallbackLocationName(cart.latitude || 11.0168, cart.longitude || 76.9558);
}

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

export default function HomePage() {
  // Dynamic carts data from db
  const [dbCarts, setDbCarts] = useState<any[]>([]);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  // Sync language toggle dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentLang = document.documentElement.dataset.lang === "ta" ? "ta" : "en";
    setLang(currentLang);

    const observer = new MutationObserver(() => {
      const updatedLang = document.documentElement.dataset.lang === "ta" ? "ta" : "en";
      setLang(updatedLang);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang"],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch live carts on mount to extract real locations
  useEffect(() => {
    async function loadCarts() {
      try {
        const res = await getLiveCartsAction();
        if (res.success && res.data) {
          setDbCarts(res.data);
        }
      } catch (e) {
        console.error("Error loading carts on home page:", e);
      }
    }
    loadCarts();
  }, []);

  // 5 seconds autoscroll timer (fires only when page remains idle)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);

      // Verify if target section is already reached/passed
      const element = document.getElementById("categories-section");
      if (element) {
        const headerHeight = window.innerWidth >= 768 ? 80 : 56;
        if (element.getBoundingClientRect().top <= headerHeight + 10) {
          // User already reached or passed it, clear the timers forever
          return;
        }
      }

      timer = setTimeout(() => {
        const element = document.getElementById("categories-section");
        if (element) {
          const headerHeight = window.innerWidth >= 768 ? 80 : 56;
          const elementPosition = element.getBoundingClientRect().top;
          if (elementPosition <= headerHeight + 10) {
            // Already reached, skip
            return;
          }
          const offsetPosition = elementPosition + window.scrollY - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 5000);
    };

    // Initial run
    resetTimer();

    // Listen to user activity to reset the inactivity timer
    const activityEvents = ["scroll", "mousedown", "touchstart", "keydown"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimeout(timer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a08] pb-20 md:pb-10 pt-14 md:pt-20">
      {/* Hero Section */}
      <section className="relative border-b border-outline-variant/20 pt-6 pb-6 md:pt-10 md:pb-10 px-4 md:px-8">
        <div className="absolute inset-0 editorial-grid opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 cinematic-vignette pointer-events-none"></div>

        <div className="site-container max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Description & Search Form */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Saffron tag */}
            <span className="font-display text-xs tracking-[0.2em] text-[#f97316] bg-[#f97316]/10 px-4 py-1.5 uppercase mb-4 border border-[#f97316]/20 rounded-full">
              ★ <Text en="FOOD CART MARKETPLACE" ta="உணவு வண்டி சந்தை" /> ★
            </span>

            <h1 className="font-display text-4xl md:text-6xl text-[#fffdf7] uppercase tracking-wider leading-[1.1] mb-4">
              <span className="en">
                RENT PREMIUM <br className="hidden md:inline" />
                <span className="text-[#f97316]">FOOD CARTS</span>
              </span>
              <span className="ta tamil-text text-3xl md:text-5xl leading-tight">
                பிரீமியம் <br className="hidden md:inline" />
                <span className="text-[#f97316]">உணவு வண்டிகள் வாடகைக்கு</span>
              </span>
            </h1>
            
            <p className="font-sans text-sm md:text-base text-[#f6ded3]/70 mb-8 max-w-xl leading-relaxed">
              <Text
                en="Tamil Nadu's first verified rental network for street food vendors. Find fully-equipped tea kiosks, juice stalls, and fast food carts in Coimbatore & Tiruppur today."
                ta="தெரு உணவு வியாபாரிகளுக்கான தமிழ்நாட்டின் முதல் சரிபார்க்கப்பட்ட வாடகை நெெட்டிவார்க். கோயம்புத்தூர் & திருப்பூரில் முழுமையாக பொருத்தப்பட்ட டீ கடைகள், ஜூஸ் வண்டிகள் மற்றும் ஃபாஸ்ட் ஃபுட் வண்டிகளை இன்றே கண்டறியுங்கள்."
              />
            </p>

            {/* Primary Browse Carts CTA */}
            <Button asChild className="w-full max-w-md h-14 bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-2xl font-display uppercase tracking-widest text-sm md:text-base transition-all active:scale-[0.98]">
              <Link href="/explore" className="flex items-center justify-center gap-3">
                <Search className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                <Text en="Browse Carts" ta="வண்டிகளைப் பார்க்கவும்" />
              </Link>
            </Button>
          </div>

          {/* Right Column: Hero Showcase Image */}
          <div className="hidden lg:flex flex-col gap-3 lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#ffb690]/20 shadow-2xl bg-[#160c06]">
              <Image 
                src="/carts/premium-fast-food-cart-with-stove/photo-2.webp"
                alt="Elite Fast Food Cart Coimbatore"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
            <div className="text-left px-2">
              <span className="text-[10px] font-display font-bold tracking-widest text-[#f97316] uppercase block mb-1">
                <Text en="Featured Model" ta="சிறப்பு மாடல்" />
              </span>
              <span className="font-display text-lg text-[#fffdf7] uppercase tracking-wider block">
                <Text en="Elite Fast Food Cart with Stove" ta="அடுப்புடன் கூடிய எலைட் ஃபாஸ்ட் ஃபுட் வண்டி" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div id="categories-section" className="site-container max-w-5xl mx-auto px-4 mt-4 md:mt-6">
        {/* Browse by Category */}
        <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
          <button
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            className="flex items-center gap-2 text-left group"
            aria-label={categoriesExpanded ? "Collapse categories" : "Expand categories"}
          >
            <h3 className="font-display text-3xl text-on-surface uppercase group-hover:text-[#f97316] transition-colors mt-1">
              <Text en="BROWSE BY CATEGORY" ta="வகை வாரியாகப் பாருங்கள்" />
            </h3>
            <ChevronDown className={`w-5 h-5 text-[#f97316] transition-transform duration-300 ${categoriesExpanded ? "rotate-180" : ""} mt-1 shrink-0`} />
          </button>
        </div>
        
        {/* Smooth collapsible drawer container for categories */}
        <div 
          className={`grid transition-all duration-300 ease-in-out ${
            categoriesExpanded 
              ? "grid-rows-[1fr] opacity-100 mb-6" 
              : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            {/* Compact, horizontally scrollable category cards in a single row */}
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory w-full">
              {[
                { href: "/explore?type=stove", label: "With Stove", tamilLabel: "அடுப்புடன்", icon: <IconSearchStove className="w-5 h-5 text-[#f97316]" /> },
                { href: "/explore?type=roof", label: "With Roof", tamilLabel: "மேற்கூரையுடன்", icon: <IconTent className="w-5 h-5 text-[#f97316]" /> },
                { href: "/explore?type=icecream", label: "Ice Cream", tamilLabel: "ஐஸ் கிரீம்", icon: <IconIceCream className="w-5 h-5 text-[#f97316]" /> },
                { href: "/explore?type=coffee", label: "Tea / Coffee", tamilLabel: "டீ / காபி", icon: <IconCoffee className="w-5 h-5 text-[#f97316]" /> },
                { href: "/explore?type=erickshaw", label: "E-Rickshaw", tamilLabel: "இ-ரிக்ஷா", icon: <IconRickshaw className="w-5 h-5 text-[#f97316]" /> },
                { href: "/explore", label: "Others", tamilLabel: "மற்றவை", icon: <MoreHorizontal className="w-5 h-5 text-on-surface-variant/60" /> }
              ].map((item, idx) => (
                <Link 
                  key={idx}
                  href={item.href} 
                  className="flex-shrink-0 w-28 md:w-32 snap-start bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl text-center"
                >
                  {item.icon}
                  <span className="font-display text-[10px] tracking-wider text-on-surface uppercase whitespace-nowrap">
                    <Text en={item.label} ta={item.tamilLabel} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Carts */}
        <div className="mt-2 md:mt-3">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">
                <Text en="Exclusive Fleet" ta="பிரதியேக வண்டிகள்" />
              </span>
              <h3 className="font-display text-3xl text-on-surface mt-1">
                <Text en="POPULAR CARTS" ta="பிரபலமான வண்டிகள்" />
              </h3>
            </div>
            <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
              <Text en="See all" ta="அனைத்தும் பார்க்க" /> <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {dbCarts.length === 0 ? (
            <div className="py-12 text-center text-[#f6ded3]/40 text-sm font-display uppercase tracking-widest">
              <Text en="No carts available yet — check back soon." ta="வண்டிகள் ஏதும் இல்லை — விரைவில் எதிர்பார்க்கலாம்." />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
              {dbCarts.slice(0, 2).map((dbCart, i) => {
                const cart = mapDbCartToCart(dbCart);
                const image = Array.isArray(cart.images) && cart.images.length > 0 ? cart.images[0] : null;
                const typeArr = cart.type;
                const tagLabel = i === 0 ? "BESTSELLER" : "POPULAR";
                const tagColor = i === 0 ? "bg-[#f97316] text-[#0a0a08]" : "bg-[#ffca45] text-[#0a0a08]";
                const pricePerDay = cart.pricePerDay;
                return (
                  <div key={cart.id} className="group bg-surface border border-[#f97316]/25 hover:border-[#f97316]/60 transition-all duration-300 flex flex-col rounded-3xl overflow-hidden shadow-premium p-3 md:p-6 relative">
                    <div className="aspect-[16/9] bg-[#251913] relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden">
                      <span className={`absolute top-2 left-2 md:top-4 md:left-4 z-10 text-[8px] md:text-[10px] font-display font-bold px-2 py-0.5 md:px-3 md:py-1 ${tagColor} tracking-wider rounded-full`}>
                        {tagLabel}
                      </span>
                      {image ? (
                        <img
                          src={image}
                          alt={cart.nameEn}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 rounded-xl"
                        />
                      ) : (
                        <svg viewBox="0 0 100 80" className="w-12 h-12 md:w-24 md:h-24 text-on-surface-variant/20" fill="currentColor">
                          <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                        </svg>
                      )}
                    </div>
                    <div className="pt-4 flex flex-col flex-grow border-t border-outline-variant/20 mt-3 md:mt-4">
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {typeArr.map((t, idx) => (
                          <span key={idx} className="text-[8px] font-bold bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 px-1.5 py-0.5 rounded uppercase tracking-wide">{t}</span>
                        ))}
                      </div>
                      <h4 className="font-display text-xs md:text-xl text-on-surface tracking-wider line-clamp-1">
                        <Text en={cart.nameEn} ta={cart.nameTa} />
                      </h4>
                      <p className="font-body text-[10px] md:text-sm text-on-surface-variant mt-1.5 mb-3 md:mt-2 md:mb-6 flex-grow line-clamp-2">
                        <Text en={cart.descriptionEn || "Premium quality food cart available for rent."} ta={cart.descriptionTa || "உயர்தர உணவு வண்டி வாடகைக்கு கிடைக்கிறது."} />
                      </p>

                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                        <div>
                          <span className="font-display text-sm md:text-2xl text-[#ffca45] block">₹{pricePerDay}/day</span>
                          <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-on-surface-variant/60 block line-clamp-1">
                            {getCartLocationName(dbCart)}
                          </span>
                        </div>
                        <Button asChild className="bg-transparent border border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10 rounded-xl px-2 py-1 md:px-6 md:py-2 h-7 md:h-auto font-display tracking-wider text-[9px] md:text-xs shrink-0 whitespace-nowrap">
                          <Link href={`/cart/${cart.id}`} className="after:absolute after:inset-0 after:z-10 whitespace-nowrap">
                            <Text en="Details" ta="விவரங்கள்" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Sale */}
        <div className="mt-10 md:mt-12 mb-16">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">
                <Text en="Used & Affordable Fleet" ta="பயன்படுத்திய & குறைந்த விலை வண்டிகள்" />
              </span>
              <h3 className="font-display text-3xl text-on-surface mt-1">
                <Text en="LIVE SALE" ta="விற்பனைக்கு உள்ளவை" />
              </h3>
            </div>
            <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
              <Text en="See all" ta="அனைத்தும் பார்க்க" /> <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {dbCarts.length === 0 ? (
            <div className="py-12 text-center text-[#f6ded3]/40 text-sm font-display uppercase tracking-widest">
              <Text en="No sale listings at this time." ta="விற்பனைக்கு வண்டிகள் ஏதும் இல்லை." />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
              {dbCarts.slice(2, 4).map((dbCart, i) => {
                const cart = mapDbCartToCart(dbCart);
                const image = Array.isArray(cart.images) && cart.images.length > 0 ? cart.images[0] : null;
                const pricePerDay = cart.pricePerDay;
                return (
                  <div key={cart.id} className="bg-surface border border-outline-variant/30 flex flex-col p-3 md:p-4 rounded-3xl shadow-premium relative">
                    <div className="aspect-[16/10] bg-[#251913] relative shrink-0 flex items-center justify-center mb-2 md:mb-4 rounded-2xl overflow-hidden">
                      <span className="absolute top-1.5 left-1.5 text-[7px] md:text-[8px] font-display tracking-widest bg-[#ffca45] text-[#0a0a08] px-2 py-0.5 font-bold rounded-full z-10">
                        {cart.condition?.includes("New") ? "NEW" : "PRE-OWNED"}
                      </span>
                      {image ? (
                        <img src={image} alt={cart.nameEn} className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <svg viewBox="0 0 100 80" className="w-12 h-12 md:w-20 md:h-20 text-on-surface-variant/10" fill="currentColor">
                          <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h4 className="font-display text-xs md:text-lg text-on-surface tracking-wider line-clamp-1">
                        <Text en={cart.nameEn} ta={cart.nameTa} />
                      </h4>
                      <span className="font-display text-sm md:text-xl text-[#ffca45] mt-1 mb-1 block">₹{pricePerDay}/day</span>
                      <p className="text-[10px] md:text-xs text-on-surface-variant mb-2 md:mb-4 flex items-center gap-1">
                        📍 {getCartLocationName(dbCart)}
                      </p>

                      <Button asChild className="w-full bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] border-none rounded-xl font-display uppercase tracking-widest text-[9px] md:text-xs py-1.5 md:py-2 h-8 md:h-10">
                        <Link href={`/contact?cart=${cart.id}&name=${encodeURIComponent(cart.nameEn)}&ref=sale#enquiry-form`} scroll={false} className="after:absolute after:inset-0 after:z-10">
                          <Text en="Enquire Now" ta="இப்போதே விசாரிக்கவும்" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Manufacturing Section */}
      <section className="py-12 md:py-16 bg-surface border-t border-outline-variant/20">
        <div className="site-container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Box */}
            <div className="md:col-span-4 flex flex-col gap-4 justify-between h-auto">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">
                  <Text en="CUSTOM MANUFACTURING" ta="தனிப்பயன் தயாரிப்பு" />
                </p>
                <h2 className="font-display text-3xl md:text-4xl uppercase leading-none text-on-surface">
                  <Text en="CUSTOMIZE YOUR CART & OWN IT" ta="உங்களுக்கே ஒரு வண்டி — நீங்களே வடிவமையுங்கள்!" />
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-on-surface-variant">
                  <Text en="Build your own customized food cart based on your business needs. Delivery in 2–4 weeks." ta="உங்கள் தேவைக்கேற்ப தனிப்பட்ட உணவு வண்டி. 2-4 வாரங்களில் டெலிவரி." />
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f97316]">
                  <Text en="ESTIMATED RANGE" ta="மதிப்பிடப்பட்ட விலை" />
                </p>
                <p className="mt-1 font-display text-xl sm:text-2xl md:text-3xl font-bold text-on-surface">₹30,000 – ₹70,000+</p>
              </div>
              <Button asChild className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white border-none rounded-xl font-display uppercase tracking-widest text-xs h-11 flex items-center justify-center gap-2">
                <a href="https://wa.me/918838292849?text=%E0%AE%B5%E0%AE%A3%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%AE%E0%AF%8D%2C%20%E0%AE%A8%E0%AE%BE%E0%AE%A9%E0%AF%8D%20%E0%AE%A4%E0%AE%A9%E0%AE%BF%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AE%9F%E0%AF%8D%E0%AE%9F%20%E0%AE%89%E0%AE%A3%E0%AE%B5%E0%AF%81%20%E0%AE%B5%E0%AE%A3%E0%AF%8D%E0%AE%9F%E0%AE%BF%20%E0%AE%B5%E0%AE%BE%E0%AE%99%E0%AF%8D%E0%AE%95%20%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%AE%E0%AF%8D%E0%AE%AA%E0%AF%81%E0%AE%95%E0%AE%BF%E0%AE%B1%E0%AF%87%E0%AE%A9%E0%AF%8D.%0A%E0%AE%AA%E0%AF%86%E0%AE%AF%E0%AE%B0%E0%AF%8D%3A%0A%E0%AE%A4%E0%AF%8A%E0%AE%B2%E0%AF%88%E0%AE%AA%E0%AF%87%E0%AE%9A%E0%AE%BF%3A%0A%E0%AE%B5%E0%AE%A3%E0%AF%8D%E0%AE%9F%E0%AE%BF%20%E0%AE%85%E0%AE%B3%E0%AE%B5%E0%AF%81%3A%0A%E0%AE%B5%E0%AE%9F%E0%AE%BF%E0%AE%B5%E0%AE%AE%E0%AF%88%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AF%81%20%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AE%AE%E0%AF%8D%3A%0A%E0%AE%AA%E0%AE%9F%E0%AF%8D%E0%AE%9C%E0%AF%86%E0%AE%9F%E0%AF%8D%3A" target="_blank">
                  <MessageCircle size={18} />
                  <Text en="REQUEST CUSTOM CART" ta="🔧 தனிப்பயன் வண்டிக்கு கேட்க" />
                </a>
              </Button>
            </div>

            {/* Right Cards */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              {/* Card 1 */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col justify-between h-full">
                <div>
                  <PenTool className="text-[#f97316] mb-3" size={20} />
                  <h3 className="font-display text-lg uppercase font-bold text-on-surface">
                    <Text en="DESIGN" ta="வடிவமைப்பு" />
                  </h3>
                </div>
                <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Tell us the size you need" ta="தேவையான அளவு சொல்லுங்கள்" /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Choose counter layout" ta="கவுண்டர் வடிவமைப்பு தேர்வு" /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Plan your branding space" ta="உங்கள் பிராண்ட் இடம் திட்டமிடுங்கள்" /></span>
                  </li>
                </ul>
              </div>

              {/* Card 2 */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col justify-between h-full">
                <div>
                  <Wrench className="text-[#f97316] mb-3" size={20} />
                  <h3 className="font-display text-lg uppercase font-bold text-on-surface">
                    <Text en="BUILD" ta="கட்டுமானம்" />
                  </h3>
                </div>
                <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Quality steel material" ta="தரமான ஸ்டீல் பொருள்" /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Stove setup (optional)" ta="அடுப்பு அமைப்பு (விருப்பம்)" /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Storage & cover options" ta="சேமிப்பு மற்றும் மூடி விருப்பங்கள்" /></span>
                  </li>
                </ul>
              </div>

              {/* Card 3 */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col justify-between h-full">
                <div>
                  <Truck className="text-[#f97316] mb-3" size={20} />
                  <h3 className="font-display text-lg uppercase font-bold text-on-surface">
                    <Text en="DELIVER" ta="டெலிவரி" />
                  </h3>
                </div>
                <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Ready in 2-4 weeks" ta="2-4 வாரங்களில் தயார்" /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Direct delivery in Coimbatore" ta="கோயம்புத்தூரில் நேரடி டெலிவரி" /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span><Text en="Fully checked before handover" ta="கையளிப்பதற்கு முன் முழு சரிபார்ப்பு" /></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#1c120c] via-[#120b07] to-[#0c0704] text-white border-t border-[#f97316]/10 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#f97316] rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
        </div>

        <div className="site-container max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="bg-[#1f1510] border border-[#f97316]/15 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-2xl">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] font-bold text-xs uppercase tracking-widest mb-4">
                <Text en="For Cart Owners" ta="வண்டி உரிமையாளர்களுக்கு" />
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-black uppercase leading-tight text-white tracking-wide">
                <Text
                  en="Do you have carts? List them on Namma Thalluvandi!"
                  ta="உங்களிடம் வண்டிகள் உள்ளதா? நம்ம தள்ளுவண்டியில் பதிவிடுங்கள்!"
                />
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-300 leading-relaxed">
                <Text
                  en="Reach thousands of local vendors looking for push carts and modern food carts. Create your vendor profile today and start listing your carts to boost your rental business."
                  ta="வாடகைக்கு வண்டிகள் தேடும் ஆயிரக்கணக்கான வியாபாரிகளை சென்றடையுங்கள். இன்றே உங்கள் விற்பனையாளர் சுயவிவரத்தை உருவாக்கி, உங்கள் வண்டிகளைப் பதிவிட்டு வாடகை வருவாயை அதிகரிக்கவும்."
                />
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button asChild className="w-full md:w-auto bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] border-none font-display font-black text-sm uppercase tracking-widest px-8 py-6 rounded-2xl transition duration-300 active:scale-95 shadow-lg shadow-[#f97316]/20">
                <Link href="/login?redirect=/vendor/register">
                  <Text en="Create Vendor Profile" ta="சுயவிவரம் உருவாக்கவும்" />
                  <ChevronRight className="ml-2 w-5 h-5 animate-pulse" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 border-t border-outline-variant/20">
        <div className="site-container max-w-[1000px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">
            <Text en="FAQ" ta="கேள்விகள்" />
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl uppercase leading-none text-on-surface">
            <Text en="How It Works" ta="வாடகை பற்றி கேள்விகள்" />
          </h2>
          <div className="mt-8 divide-y divide-outline-variant/20 rounded-2xl border border-outline-variant/20 bg-surface overflow-hidden">
            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="What is Thalluvandi?" ta="தள்ளுவண்டி என்றால் என்ன?" />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="Namma Thalluvandi is D. Nagaraj's thallu vandi rental service — Coimbatore's most trusted food cart rental with 30+ years of experience at Ondipudur. We offer food carts for daily and monthly rental to help vendors start their business with minimal investment. Our fleet includes both traditional old-style push carts and new modern model carts to suit every type of street food business."
                  ta="நம்ம தளவண்டி என்பது D. நாகராஜ் அவர்களின் தளவண்டி வாடகை சேவை. 30+ ஆண்டுகளாக ஒண்டிப்புதூர், கோயம்பத்தூரில் நம்பகமான உணவு வண்டி வாடகை. வண்டிகள் தினசரி மற்றும் மாதாந்திர வாடகைக்கு தயாராக உள்ளன. எங்கள் வண்டிகளில் பாரம்பரிய தளவண்டிகளும் புதிய நவீன மாடல் வண்டிகளும் இரண்டும் உள்ளன."
                />
              </p>
            </details>

            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="Where is your branch located?" ta="உங்கள் கிளை எங்குள்ளது?" />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="D. Nagaraj Thalluvandi is located at Ondipudur, Coimbatore. Our yard has served Coimbatore vendors for 30+ years. Cart pickup, returns, and inspection all happen at our Ondipudur location."
                  ta="D. நாகராஜ் தளவண்டி ஒண்டிப்புதூர், கோயம்புத்தூரில் அமைந்துள்ளது. 30+ ஆண்டுகளாக இங்கிருந்து கோவை வியாபாரிகளுக்கு சேவை. வண்டி எடுக்கவும் திரும்ப கொடுக்கவும் நேரடியாக ஒண்டிப்புதூர் வரலாம்."
                />
              </p>
            </details>

            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="How do I book a food cart?" ta="வண்டியை புக் செய்வது எப்படி?" />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="Browse through our premium food cart variants on the Explore page, fill out your booking details on our dedicated `/book` page, and continue to WhatsApp to finalize your booking with our team."
                  ta="எங்கள் வண்டி வகைகள் பக்கத்தில் உங்களுக்கு தேவையான வண்டியைத் தேர்ந்தெடுத்து, உங்கள் விவரங்களை முன்பதிவு பக்கத்தில் பூர்த்தி செய்து, வாட்ஸ்அப் வழியாக எங்களுடன் தொடர்புகொண்டு முன்பதிவை உறுதி செய்யலாம்."
                />
              </p>
            </details>

            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="What documents are required for booking?" ta="என்னென்ன ஆவணங்கள் தேவை?" />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="Please bring any one of Aadhaar Card, Ration Card, or PAN Card along with 1 Passport Size Photo. Any one of these primary proofs is sufficient."
                  ta="கொண்டுவர வேண்டியது: ஆதார் கார்டு, ரேஷன் கார்டு அல்லது பான் கார்டு (இதில் ஏதேனும் ஒரு ஆதாரம்) மற்றும் 1 பாஸ்போர்ட் அளவு போட்டோ போதுமானது."
                />
              </p>
            </details>

            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="What are the key rental rules?" ta="முக்கிய வாடகை விதிகள் என்னென்ன? " />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="Key terms include: 1. Cart must be rented in the active operator's name. 2. Renter handles transport (pickup/return). 3. Damages are checked and charged. 4. Minimum rental period is 1 month; early returns are still billed for 1 full month."
                  ta="முக்கிய விதிகள்: 1. தொழில் செய்பவர் பெயரிலேயே வண்டி எடுக்க வேண்டும். 2. போக்குவரத்து தங்கள் பொறுப்பு. 3. சேதங்களுக்கு தகுந்த கட்டணம் வசூலிக்கப்படும். 4. குறைந்தபட்ச வாடகை காலம் 1 மாதம் (ஒரு மாதத்திற்குள் வண்டியைத் திரும்பக் கொடுத்தாலும் 1 மாத வாடகை வசூலிக்கப்படும்)."
                />
              </p>
            </details>

            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="What is the minimum rental period for a thallu vandi in Coimbatore?" ta="கோவையில் தளவண்டி வாடகைக்கு குறைந்தபட்ச காலம் என்ன?" />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="The minimum rental period at Namma Thalluvandi is 1 month. If you return the cart before completing one month the full one month rent will still be charged. This ensures fair pricing for both parties."
                  ta="குறைந்தபட்சம் 1 மாதம் வாடகை வைத்திருக்க வேண்டும். முன்னதாக திரும்பினாலும் 1 மாத வாடகை வசூலிக்கப்படும்."
                />
              </p>
            </details>

            <details className="group p-6 open:bg-surface-container-low transition duration-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-on-surface">
                <span className="font-display text-base md:text-lg uppercase tracking-wider text-on-surface faq-question-title">
                  <Text en="Do you deliver the cart to my location in Coimbatore?" ta="கோவையில் என் இடத்திற்கு வண்டி கொண்டு வருவீர்களா?" />
                </span>
                <span className="text-xl text-primary group-open:hidden">+</span>
                <span className="hidden text-xl text-primary group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-on-surface-variant max-w-3xl">
                <Text
                  en="Cart pickup and return from our yard at Ondipudur Coimbatore is the renter's responsibility. You will need to arrange your own transport to collect and return the cart. Our address is 6A Aruljothipuram Jallimedu Ondipudur Coimbatore."
                  ta="வண்டியை எங்கள் ஒண்டிப்புதூர் கிளையிலிருந்து எடுத்துச் செல்வதும் திரும்ப ஒப்படைப்பதும் வாடகைதாரரின் பொறுப்பு."
                />
              </p>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}

