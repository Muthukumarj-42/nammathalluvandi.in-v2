"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Search, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTent, IconIceCream, IconCoffee, IconRickshaw, IconMapPinRed, IconWhatsApp, IconSearchStove } from "@/components/ui/icons";
import { getLiveCartsAction } from "@/app/actions";

const SUGGESTIONS = [
  "stove",
  "roof",
  "ice cream",
  "tea stall",
  "coimbatore",
  "tiruppur",
  "double burner"
];

function getCartLocationName(cart: any): string {
  const lat = cart.latitude;
  const lng = cart.longitude;
  
  if (Math.abs(lat - 11.0028) < 0.005 && Math.abs(lng - 77.0347) < 0.005) {
    return "Ondipudur, Coimbatore";
  }
  if (Math.abs(lat - 11.0183) < 0.005 && Math.abs(lng - 76.9693) < 0.005) {
    return "Gandhipuram, Coimbatore";
  }
  if (Math.abs(lat - 11.0267) < 0.005 && Math.abs(lng - 77.0089) < 0.005) {
    return "Peelamedu, Coimbatore";
  }
  if (Math.abs(lat - 11.1085) < 0.005 && Math.abs(lng - 77.3411) < 0.005) {
    return "Tiruppur Junction";
  }
  if (Math.abs(lat - 11.0006) < 0.005 && Math.abs(lng - 77.0222) < 0.005) {
    return "Singanallur, Coimbatore";
  }

  return lat >= 11.08 ? "Tiruppur" : "Coimbatore";
}

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // Dynamic carts data from db
  const [dbCarts, setDbCarts] = useState<any[]>([]);

  // Autocomplete Location states
  const [locationSearch, setLocationSearch] = useState("All Locations");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(timer);
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

  // Extract unique locations dynamically
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    dbCarts.forEach(cart => {
      locSet.add(getCartLocationName(cart));
    });
    // Add city-level search targets if present in the data
    if (dbCarts.some(c => c.latitude < 11.08)) {
      locSet.add("Coimbatore");
    }
    if (dbCarts.some(c => c.latitude >= 11.08)) {
      locSet.add("Tiruppur");
    }
    
    const list = Array.from(locSet).map(name => ({
      id: name.toLowerCase(),
      label: name
    }));
    
    return [{ id: "all", label: "All Locations" }, ...list];
  }, [dbCarts]);

  // Sync input values when selected location or available list changes
  useEffect(() => {
    const found = availableLocations.find(l => l.id === selectedLocation);
    if (found) {
      setLocationSearch(found.label);
    } else {
      setLocationSearch("All Locations");
    }
  }, [selectedLocation, availableLocations]);

  const filteredLocations = useMemo(() => {
    if (!locationSearch || locationSearch === "All Locations") {
      return availableLocations;
    }
    return availableLocations.filter(l => 
      l.label.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locationSearch, availableLocations]);

  return (
    <main className="min-h-screen bg-[#0a0a08] pb-20 md:pb-10 pt-14 md:pt-20">
      {/* Hero Section */}
      <section className="relative border-b border-outline-variant/20 pt-6 pb-12 md:pt-10 md:pb-16 px-4 md:px-8">
        <div className="absolute inset-0 editorial-grid opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 cinematic-vignette pointer-events-none"></div>

        <div className="site-container max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Description & Search Form */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Saffron tag */}
            <span className="font-display text-xs tracking-[0.2em] text-[#f97316] bg-[#f97316]/10 px-4 py-1.5 uppercase mb-4 border border-[#f97316]/20 rounded-full">
              ★ FOOD CART MARKETPLACE ★
            </span>

            <h1 className="font-display text-4xl md:text-6xl text-[#fffdf7] uppercase tracking-wider leading-[1.1] mb-4">
              RENT PREMIUM <br className="hidden md:inline" />
              <span className="text-[#f97316]">FOOD CARTS</span>
            </h1>
            
            <p className="font-sans text-sm md:text-base text-[#f6ded3]/70 mb-8 max-w-xl leading-relaxed">
              Tamil Nadu&apos;s first verified rental network for street food vendors. Find fully-equipped tea kiosks, juice stalls, and fast food carts in Coimbatore & Tiruppur today.
            </p>

            {/* Search bar & Location bar in editorial style */}
            <form action="/explore" method="GET" className="w-full max-w-2xl bg-[#160c06] border border-[#ffb690]/25 p-2.5 flex flex-col md:flex-row gap-2.5 rounded-3xl shadow-premium">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-5 h-5 z-10" />
                <input 
                  type="text" 
                  name="search"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-[#0a0a08] text-on-surface border-none px-4 py-3 pl-10 text-sm outline-none placeholder:text-on-surface-variant/40 rounded-2xl z-0"
                />
                {/* Animated suggestion placeholder */}
                {!searchValue && !isFocused && (
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-on-surface-variant/40 flex items-center gap-1 select-none z-10">
                    <span>Search by</span>
                    <span className="relative overflow-hidden inline-block h-5 w-36">
                      {SUGGESTIONS.map((sug, idx) => (
                        <span
                          key={sug}
                          className={`absolute left-0 top-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                            idx === suggestionIndex 
                              ? "opacity-100 translate-y-0" 
                              : idx === (suggestionIndex - 1 + SUGGESTIONS.length) % SUGGESTIONS.length
                                ? "opacity-0 -translate-y-4"
                                : "opacity-0 translate-y-4"
                          }`}
                        >
                          &quot;{sug}&quot;...
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="relative flex items-center bg-[#251913] px-4 py-2 border border-outline-variant/10 shrink-0 md:w-60 rounded-2xl">
                <IconMapPinRed className="w-4 h-4 text-[#f97316] mr-2 shrink-0" />
                <div className="flex flex-col text-left flex-grow relative">
                  <input 
                    type="text" 
                    placeholder="Type city..."
                    value={locationSearch}
                    onChange={e => {
                      setLocationSearch(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => {
                      setLocationSearch(""); // Clear value on focus to let user type
                      setShowLocationDropdown(true);
                    }}
                    onBlur={() => {
                      // Delay to allow selecting a city option first
                      setTimeout(() => {
                        setShowLocationDropdown(false);
                        const found = availableLocations.find(l => l.id === selectedLocation);
                        if (found) {
                          setLocationSearch(found.label);
                        } else {
                          setLocationSearch("All Locations");
                        }
                      }, 200);
                    }}
                    className="bg-transparent text-xs font-display tracking-wider text-on-surface uppercase outline-none w-full cursor-pointer"
                  />
                  <input type="hidden" name="location" value={selectedLocation} />

                  {showLocationDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2.5 bg-[#1c110b] border border-[#ffb690]/25 rounded-xl overflow-hidden shadow-xl z-30 max-h-60 overflow-y-auto">
                      {filteredLocations.map(loc => (
                        <button
                          key={loc.id}
                          type="button"
                          onMouseDown={() => {
                            setSelectedLocation(loc.id);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] uppercase font-display tracking-wider hover:bg-[#ffb690]/10 text-[#f6ded3] transition-colors"
                        >
                          {loc.label}
                        </button>
                      ))}
                      {filteredLocations.length === 0 && (
                        <div className="px-4 py-2.5 text-[10px] text-[#f6ded3]/40 uppercase tracking-wider">
                          No locations found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-2xl font-display uppercase tracking-wider text-sm py-3 px-8">
                Search
              </Button>
            </form>
          </div>

          {/* Right Column: Hero Showcase Image */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#ffb690]/20 shadow-2xl bg-[#160c06]">
              <Image 
                src="/carts/premium-fast-food-cart-with-stove/photo-2.webp"
                alt="Elite Fast Food Cart Coimbatore"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a08]/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-display font-bold tracking-widest text-[#f97316] uppercase block mb-1">Featured Model</span>
                <span className="font-display text-lg text-[#fffdf7] uppercase tracking-wider block">Elite Fast Food Cart with Stove</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="site-container max-w-5xl mx-auto px-4 mt-6 md:mt-10">
        {/* Browse by Category */}
        <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
          <div>
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Categories</span>
            <h3 className="font-display text-3xl text-on-surface mt-1">BROWSE BY CATEGORY</h3>
          </div>
          <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {/* Compact, horizontally scrollable category cards in a single row */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory w-full">
          {[
            { href: "/explore?type=stove", label: "With Stove", icon: <IconSearchStove className="w-5 h-5 text-[#f97316]" /> },
            { href: "/explore?type=roof", label: "With Roof", icon: <IconTent className="w-5 h-5 text-[#f97316]" /> },
            { href: "/explore?type=icecream", label: "Ice Cream", icon: <IconIceCream className="w-5 h-5 text-[#f97316]" /> },
            { href: "/explore?type=coffee", label: "Tea / Coffee", icon: <IconCoffee className="w-5 h-5 text-[#f97316]" /> },
            { href: "/explore?type=erickshaw", label: "E-Rickshaw", icon: <IconRickshaw className="w-5 h-5 text-[#f97316]" /> },
            { href: "/explore", label: "Others", icon: <MoreHorizontal className="w-5 h-5 text-on-surface-variant/60" /> }
          ].map((item, idx) => (
            <Link 
              key={idx}
              href={item.href} 
              className="flex-shrink-0 w-28 md:w-32 snap-start bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl text-center"
            >
              {item.icon}
              <span className="font-display text-[10px] tracking-wider text-on-surface uppercase whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Popular Carts */}
        <div className="mt-10 md:mt-12">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Exclusive Fleet</span>
              <h3 className="font-display text-3xl text-on-surface mt-1">POPULAR CARTS</h3>
            </div>
            <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
            {[
              { tag: "BESTSELLER", tagColor: "bg-[#f97316] text-[#0a0a08]", title: "ELITE STAINLESS PRO V2", desc: "Dual integrated high-power burners, premium food-grade steel & display shelf.", price: "₹24,500", image: "/carts/premium-fast-food-cart-with-stove/photo-1.webp" },
              { tag: "NEW ARRIVAL", tagColor: "bg-[#ffca45] text-[#0a0a08]", title: "CLASSIC TEAX STATION V1", desc: "Equipped with wide partition counters, utility lock-box, and waste sink.", price: "₹16,000", image: "/carts/covered-premium-cart/photo-1.webp" }
            ].map((item, i) => (
              <div key={i} className="group bg-surface border border-[#f97316]/25 hover:border-[#f97316]/60 transition-all duration-300 flex flex-col rounded-3xl overflow-hidden shadow-premium p-3 md:p-6">
                <div className="aspect-[16/9] bg-[#251913] relative shrink-0 p-4 md:p-6 flex items-center justify-center rounded-2xl overflow-hidden">
                  <span className={`absolute top-2 left-2 md:top-4 md:left-4 z-10 text-[8px] md:text-[10px] font-display font-bold px-2 py-0.5 md:px-3 md:py-1 ${item.tagColor} tracking-wider rounded-full`}>
                    {item.tag}
                  </span>
                  
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl"
                    />
                  ) : (
                    <svg viewBox="0 0 100 80" className="w-12 h-12 md:w-24 md:h-24 text-on-surface-variant/20" fill="currentColor">
                      <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                    </svg>
                  )}
                </div>
                <div className="pt-4 flex flex-col flex-grow border-t border-outline-variant/20 mt-3 md:mt-4">
                  <h4 className="font-display text-xs md:text-xl text-on-surface tracking-wider line-clamp-1">{item.title}</h4>
                  <p className="font-body text-[10px] md:text-sm text-on-surface-variant mt-1.5 mb-3 md:mt-2 md:mb-6 flex-grow line-clamp-2">{item.desc}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                    <div>
                      <span className="font-display text-sm md:text-2xl text-[#ffca45] block">{item.price}</span>
                      <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-on-surface-variant/60 block line-clamp-1">Daily/Monthly Plans</span>
                    </div>
                    <Button asChild className="bg-transparent border border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10 rounded-xl px-2 py-1 md:px-6 md:py-2 h-7 md:h-auto font-display tracking-wider text-[9px] md:text-xs">
                      <Link href={`/explore`}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Sale */}
        <div className="mt-10 md:mt-12 mb-16">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Used & Affordable Fleet</span>
              <h3 className="font-display text-3xl text-on-surface mt-1">LIVE SALE</h3>
            </div>
            <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
            {[
              { title: "STANDARD MS PUSH FOOD CART (3FT)", price: "₹12,000", location: "Ondipudur, Coimbatore" },
              { title: "MINIMALIST FAST FOOD TEA STATION", price: "₹15,000", location: "Tiruppur Junction" }
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-outline-variant/30 flex flex-col p-3 md:p-4 rounded-3xl shadow-premium">
                <div className="aspect-[16/10] bg-[#251913] relative shrink-0 p-2 md:p-4 flex items-center justify-center mb-2 md:mb-4 rounded-2xl">
                  <span className="absolute top-1.5 left-1.5 text-[7px] md:text-[8px] font-display tracking-widest bg-[#ffca45] text-[#0a0a08] px-2 py-0.5 font-bold rounded-full">
                    PRE-OWNED
                  </span>
                  <svg viewBox="0 0 100 80" className="w-12 h-12 md:w-20 md:h-20 text-on-surface-variant/10" fill="currentColor">
                    <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="font-display text-xs md:text-lg text-on-surface tracking-wider line-clamp-1">{item.title}</h4>
                  <span className="font-display text-sm md:text-xl text-[#ffca45] mt-1 mb-1 block">{item.price}</span>
                  <p className="text-[10px] md:text-xs text-on-surface-variant mb-2 md:mb-4 flex items-center gap-1">
                    📍 {item.location}
                  </p>
                  
                  <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white border-none rounded-xl font-display uppercase tracking-widest text-[9px] md:text-xs py-1.5 md:py-2 h-8 md:h-10">
                    <Link href={`/explore`}>
                      <IconWhatsApp className="w-3.5 h-3.5 mr-1 inline-block align-middle" />
                      WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
