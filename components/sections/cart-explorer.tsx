"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  MessageCircle,
  Sparkles,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { filters, type Cart } from "@/lib/carts";
import { getLocalFallbackLocationName } from "@/lib/geocoding";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

function CartImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="relative w-full h-full bg-[#1a1208] flex items-center justify-center overflow-hidden z-0">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <Image
          src="/brand/full-logo-with-background.webp"
          alt="Thalluvandi fallback logo"
          fill
          sizes={sizes}
          className="object-contain p-6 opacity-40 z-0"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className="object-contain transition duration-500 group-hover:scale-[1.04] z-0"
      onError={() => {
        setError(true);
      }}
    />
  );
}

export function CartExplorer({
  compact = false,
  initialCarts,
}: {
  compact?: boolean;
  initialCarts?: Cart[];
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState<"en" | "ta">("en");
  
  const activeCarts = initialCarts ?? [];

  // Sync React language state dynamically with DOM mutations (data-lang toggle) - FIX 4
  useEffect(() => {
    const currentLang =
      document.documentElement.dataset.lang === "ta" ? "ta" : "en";
    setLang(currentLang);

    const observer = new MutationObserver(() => {
      const updatedLang =
        document.documentElement.dataset.lang === "ta" ? "ta" : "en";
      setLang(updatedLang);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang"],
    });

    return () => observer.disconnect();
  }, []);

  // Sort carts:
  // 1st: available && availableCount === 1 (LIMITED)
  // 2nd: available && availableCount >= 2 (AVAILABLE)
  // 3rd: available && availableCount === 0 (BOOKED)
  // 4th: !available (completely hidden, pushed to end)
  const sortedCarts = useMemo(() => {
    return [...activeCarts].sort((a, b) => {
      if (!a.available && b.available) return 1;
      if (a.available && !b.available) return -1;
      if (!a.available && !b.available) return 0;

      const getCat = (c: Cart) => {
        if (c.availableCount === 1) return 1; // LIMITED first
        if (c.availableCount >= 2) return 2;  // AVAILABLE second
        return 3;                              // BOOKED last
      };
      return getCat(a) - getCat(b);
    });
  }, []);

  // Filter carts in combination with search & filter pills
  const filteredCarts = useMemo(() => {
    return sortedCarts.filter((cart) => {
      // 1. Filter pill match
      const matchesFilter =
        activeFilter === "All" ||
        cart.type.some((t: string) => t.toLowerCase() === activeFilter.toLowerCase());

      // 2. Search query match
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesFilter;

      // Price match: if input is a number, show carts at or below that price
      const priceMatch = !isNaN(Number(q)) && Number(q) > 0 && cart.pricePerDay <= Number(q);

      // Split search into individual keywords (all must match)
      const keywords = q.split(/\s+/);

      const textMatch = keywords.every((keyword) => {
        // Exact type-tag match: e.g. "stove" matches "Has Stove" but NOT "No Stove"
        // We check if any type tag's words include the keyword as a whole word
        const typeTagMatch = cart.type.some((tag: string) => {
          const tagWords = tag.toLowerCase().split(/\s+/);
          return tagWords.includes(keyword);
        });

        // Substring match only on name, id, and feature fields (not type tags)
        const nameAndFeatureFields = [
          cart.nameEn,
          cart.nameTa,
          cart.id,
          ...(cart.featuresEn || []),
          ...(cart.featuresTa || []),
        ];
        const nameFeatureMatch = nameAndFeatureFields.some(
          (field) => field && String(field).toLowerCase().includes(keyword)
        );

        return typeTagMatch || nameFeatureMatch;
      });

      return matchesFilter && (priceMatch || textMatch);
    });
  }, [sortedCarts, activeFilter, searchQuery]);

  // Mobile slideshow variables (only those with available === true)
  const slideshowCarts = useMemo(() => {
    const list = filteredCarts.filter((cart) => cart.available !== false);
    return compact ? list.slice(0, 3) : list;
  }, [filteredCarts, compact]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const timeSinceLastAction = Date.now() - lastActiveRef.current;
      if (timeSinceLastAction < 6000) return; // delay after manual swipes

      setCurrentIndex((prev) =>
        slideshowCarts.length > 0 ? (prev + 1) % slideshowCarts.length : 0,
      );
    }, 4000);
  }, [slideshowCarts.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoplay, slideshowCarts]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    touchStartRef.current = null;

    if (Math.abs(diff) > 50 && slideshowCarts.length > 0) {
      lastActiveRef.current = Date.now();
      if (diff > 0) {
        // swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % slideshowCarts.length);
      } else {
        // swipe right -> prev
        setCurrentIndex(
          (prev) => (prev - 1 + slideshowCarts.length) % slideshowCarts.length,
        );
      }
    }
  };

  const placeholderText =
    lang === "ta"
      ? "வாடகை, வண்டி வகை தேடுங்கள்... (எ.கா: stove, 200, juice)"
      : "Search by cart type, rent (eg: stove, 200, juice)...";

  return (
    <section id="explore" className="bg-[#F8F6F2] py-16 md:py-24">
      <div className="site-container">
        {/* Title area */}
        <div className="grid gap-4 md:grid-cols-[1fr_420px] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Text en="Explore Carts" ta="வண்டிகளை பாருங்க" />
            </p>
            {compact ? (
              <h2 className="mt-3 font-display text-5xl uppercase leading-none text-ink md:text-7xl">
                <Text en="Our Cart Variants" ta="எங்கள் வண்டி வகைகள்" />
              </h2>
            ) : (
              <h1 className="mt-3 font-display text-5xl uppercase leading-none text-ink md:text-7xl">
                <Text
                  en="Food Carts for Rent in Coimbatore"
                  ta="கோவையில் உணவு வண்டி வாடகை"
                />
              </h1>
            )}
          </div>
          <p className="text-sm leading-7 text-muted">
            <Text
              en="Daily rental food carts for tea, juice, snacks, and fast food businesses in Coimbatore."
              ta="டீ, ஜூஸ், ஸ்நாக்ஸ், ஃபாஸ்ட் ஃபுட் — கோவையில் தொழில் ஆரம்பிக்க சிறந்த தினசரி வாடகை வண்டிகள்."
            />
          </p>
        </div>

        {/* Real-time Search Bar (Explore page only) */}
        {!compact && (
          <div className="mt-8 relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted">
              <SearchIcon size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setActiveFilter("All"); // Reset active filter pill to "All" when searching
                }
              }}
              placeholder={placeholderText}
              suppressHydrationWarning
              className="w-full h-12 pl-12 pr-10 border border-black/10 focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl bg-white text-sm outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-4 flex items-center text-muted hover:text-primary transition"
                aria-label="Clear search query"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Filter Pills */}
        <div className="hide-scrollbar mt-6 flex gap-3 overflow-x-auto whitespace-nowrap pb-3">
          {filters.map((filter) => (
            <button
              key={filter.en}
              onClick={() => setActiveFilter(filter.en)}
              suppressHydrationWarning
              className={`min-h-11 shrink-0 rounded-full border px-5 text-xs font-bold uppercase tracking-[0.12em] transition ${
                activeFilter === filter.en
                  ? "border-primary bg-primary text-white"
                  : "border-outline bg-white text-muted hover:border-primary hover:text-primary"
              }`}
            >
              <Text en={filter.en} ta={filter.ta} />
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Slideshow (compact is false or slideshow rendered on mobile) */}
        {slideshowCarts.length > 0 && (
          <div className="mt-8 block md:hidden relative overflow-hidden w-full">
            {/* Top right counter */}
            <div className="absolute top-2 right-4 z-20 text-[10px] font-bold text-ink bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
              {currentIndex + 1} / {slideshowCarts.length}
            </div>

            <div
              className="flex transition-transform duration-350 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {slideshowCarts.map((cart, index) => (
                <div key={cart.id} className="w-full shrink-0 px-4">
                  <article className="relative overflow-hidden rounded-xl bg-white border border-black/10 shadow-lg">
                    {/* Aspect Ratio 16:9 Image Area - FIX 8 */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      <CartImage src={cart.images[0]} alt={cart.nameEn} priority={index === 0} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />

                      {/* Availability badge - z-10 */}
                      <span
                        className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          cart.availableCount >= 2
                            ? "bg-green-500 text-white"
                            : cart.availableCount === 1
                              ? "bg-amber-400 text-black"
                              : "bg-red-500 text-white"
                        }`}
                      >
                        {cart.availableCount >= 2
                          ? "AVAILABLE"
                          : cart.availableCount === 1
                            ? "LIMITED"
                            : "BOOKED"}
                      </span>

                      {/* Count text below badge - z-10 top-9 */}
                      <span className="absolute top-9 left-2 z-10 bg-white/95 px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-ink">
                        {cart.availableCount >= 2 ? (
                          <>
                            <span className="en">
                              {cart.availableCount} Carts
                            </span>
                            <span className="ta tamil-text">
                              {cart.availableCount} வண்டிகள் உள்ளன
                            </span>
                          </>
                        ) : cart.availableCount === 1 ? (
                          <>
                            <span className="en">Last 1 Cart</span>
                            <span className="ta tamil-text">கடைசி 1 வண்டி</span>
                          </>
                        ) : (
                          <>
                            <span className="en">Sold Out</span>
                            <span className="ta tamil-text">தற்போது இல்லை</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-2xl uppercase leading-tight text-ink">
                        <span className="en">{cart.nameEn}</span>
                        <span
                          className="ta tamil-text line-clamp-2 overflow-hidden text-ellipsis normal-case whitespace-normal leading-tight"
                          title={cart.nameTa}
                        >
                          {cart.nameTa}
                        </span>
                      </h3>

                      {/* Features wrapper truncation */}
                      <div className="mt-2 flex flex-wrap gap-1 max-w-full">
                        {cart.type.map((tag: string) => (
                          <span
                            key={tag}
                            title={tag}
                            className="truncate max-w-[140px] rounded-full bg-[#F8F6F2] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Price Grid */}
                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <div className="bg-orange-50/50 border border-orange-500/10 rounded-lg p-2.5">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                            <span className="en">RENT</span>
                            <span className="ta tamil-text">வாடகை</span>
                          </p>
                          <p className="font-display text-xl font-bold text-foreground">
                            ₹{cart.pricePerDay}/DAY
                          </p>
                        </div>
                        <div className="bg-orange-50/50 border border-orange-500/10 rounded-lg p-2.5">
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                            <span className="en">DEPOSIT</span>
                            <span className="ta tamil-text">முன்பணம்</span>
                          </p>
                          <p className="font-display text-xl font-bold text-foreground">
                            ₹{cart.depositAmount}
                          </p>
                        </div>
                      </div>

                      {/* Details & WhatsApp buttons */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="border-black/20 text-ink text-xs h-10"
                        >
                          <Link href={`/carts/${cart.id}`} className="after:absolute after:inset-0 after:z-10">
                            <Text en="DETAILS" ta="விவரங்கள்" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs h-10 relative z-20"
                        >
                          <Link href={`/book?cart=${cart.id}`}>
                            <Text en="BOOK CART" ta="முன்பதிவு செய்க" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>

            {/* Dots navigation indicator */}
            <div className="flex justify-center gap-1.5 mt-4">
              {slideshowCarts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    lastActiveRef.current = Date.now();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-6 bg-primary" : "w-2 bg-black/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Desktop Grid Layout (768px+) & Mobile (if homepage teaser compact) */}
        <div className="mt-8 hidden md:grid items-stretch gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {filteredCarts
            .slice(0, compact ? 3 : filteredCarts.length)
            .map((cart, index) => {
              const isHidden = !cart.available;

              return (
                <motion.article
                  layout
                  key={cart.id}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                  className={`relative grain group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium min-w-[280px] ${
                    isHidden ? "hidden" : "flex"
                  }`}
                >
                  {/* 16:9 Aspect Video Area - FIX 8 */}
                  <Link
                    href={`/carts/${cart.id}`}
                    className="block relative aspect-video overflow-hidden bg-[#fff7ed] z-0"
                  >
                    <CartImage
                      src={cart.images[0]}
                      alt={cart.nameEn}
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Absolute badges - z-10 */}
                    <span
                      className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        cart.availableCount >= 2
                          ? "bg-green-500 text-white"
                          : cart.availableCount === 1
                            ? "bg-amber-400 text-black"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {cart.availableCount >= 2
                        ? "AVAILABLE"
                        : cart.availableCount === 1
                          ? "LIMITED"
                          : "BOOKED"}
                    </span>

                    {/* Count text absolute positioned below badge - z-10 top-9 */}
                    <span className="absolute top-9 left-2 z-10 bg-white/95 px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-ink">
                      {cart.availableCount >= 2 ? (
                        `${cart.availableCount} Carts`
                      ) : cart.availableCount === 1 ? (
                        "Last 1 Cart"
                      ) : (
                        "Sold Out"
                      )}
                    </span>

                    {/* Location badge bottom-2 left-2 - z-10 */}
                    <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-sm">
                      <MapPin size={13} /> {getLocalFallbackLocationName(cart.latitude || 11.0168, cart.longitude || 76.9558)}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-3xl uppercase leading-tight text-ink">
                          <Text en={cart.nameEn} ta={cart.nameTa} />
                        </h3>
                      </div>
                      <Sparkles className="shrink-0 text-primary" size={20} />
                    </div>

                    {/* Tag wrapper constraints - flex-wrap gap-1 max-w-full - FIX 3 */}
                    <div className="mt-4 flex flex-wrap gap-1 max-w-full">
                      {cart.type.map((tag: string) => (
                        <span
                          key={tag}
                          title={tag}
                          className="truncate max-w-[140px] rounded-full bg-[#F8F6F2] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price info card container */}
                    <div className="mt-5 rounded-lg border border-black/10 bg-[#F8F6F2] p-4 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                          <Text en="Daily Price" ta="தினசரி வாடகை" />
                        </p>
                        <p className="mt-1 font-display text-3xl text-ink">
                          ₹{cart.pricePerDay}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                          <Text en="Deposit" ta="முன்பணம்" />
                        </p>
                        <p className="mt-1 font-display text-3xl text-ink">
                          ₹{cart.depositAmount}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-muted flex-1">
                      <span className="en">
                        {cart.featuresEn
                          .slice(0, 3)
                          .map((feature: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                      </span>
                      <span className="ta tamil-text">
                        {cart.featuresTa
                          .slice(0, 3)
                          .map((feature: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                      </span>
                    </ul>

                    <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-black/5">
                      <Button asChild variant="dark">
                        <Link href={`/carts/${cart.id}`} className="after:absolute after:inset-0 after:z-10">
                          <Text en="Details" ta="விவரங்கள்" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-[#25D366] hover:bg-[#20ba5a] text-white relative z-20"
                      >
                        <Link href={`/book?cart=${cart.id}`}>
                          <MessageCircle size={16} />{" "}
                          <Text en="Book" ta="முன்பதிவு" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
        </div>

        {compact && (
          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="outline" className="text-ink">
              <Link href="/explore">
                <Text en="Explore Carts" ta="🔍 வண்டிகளை பாருங்க" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
