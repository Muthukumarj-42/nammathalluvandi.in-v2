"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, SlidersHorizontal, ArrowLeft, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLiveCartsAction } from "@/app/actions";
import { calculateHaversineDistance } from "@/lib/routing";
import { mapDbCartToCart } from "@/lib/carts";
import { isDbConfigured } from "@/lib/supabase";
import { IconSearchStove, IconTent, IconIceCream, IconCoffee } from "@/components/ui/icons";
import { reverseGeocode, getLocalFallbackLocationName } from "@/lib/geocoding";

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

function BrowseCartsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(200); // daily rent (up to ₹200/day)
  const [dbCarts, setDbCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [activeTypeFilter, setActiveTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("nearest");

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
  
  // Geolocation sorting state
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoSorting, setGeoSorting] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCoords = window.localStorage.getItem("thalluvandi-user-coords");
    const savedName = window.localStorage.getItem("thalluvandi-detected-location-name");
    if (savedCoords) {
      try {
        const parsed = JSON.parse(savedCoords);
        if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
          setUserCoords(parsed);
          if (savedName) setDetectedLocationName(savedName);
        }
      } catch (err) {
        console.error("Error reading location from localStorage:", err);
      }
    }
  }, []);

  // Search filter and suggestion states
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with URL search params once on mount and fetch carts
  useEffect(() => {
    async function loadData() {
      try {
        console.log("[DIAGNOSTIC] isDbConfigured:", isDbConfigured);
        const res = await getLiveCartsAction();
        console.log("[DIAGNOSTIC] getLiveCartsAction response:", res);
        if (res.success && res.data) {
          const mapped = res.data.map((item: any) => ({
            ...mapDbCartToCart(item),
            createdAt: item.created_at || item.createdAt || null,
          }));
          setDbCarts(mapped);
        }
      } catch (err) {
        console.error("Failed to load live carts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const qSearch = searchParams.get("search");
    const qType = searchParams.get("type");
    const qCondition = searchParams.get("condition");
    const qPrice = searchParams.get("price");

    if (qSearch) setSearch(qSearch);
    if (qType) setSelectedTypes(qType.split(","));
    if (qCondition) setSelectedConditions(qCondition.split(","));
    if (qPrice) setMaxPrice(Number(qPrice) || 200);
  }, [searchParams]);

  // Request browser geolocation to sort carts by closest distance
  const handleEnableLocationSort = (forceReDetect = false) => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    if (!forceReDetect) {
      const savedCoords = window.localStorage.getItem("thalluvandi-user-coords");
      const savedName = window.localStorage.getItem("thalluvandi-detected-location-name");
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
            setUserCoords(parsed);
            if (savedName) setDetectedLocationName(savedName);
            setLocationErrorMsg(null);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    setGeoSorting(true);
    setLocationErrorMsg(null);
    setDetectedLocationName(null);

    const onSuccess = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const coords = { latitude: lat, longitude: lng };
      setUserCoords(coords);
      window.localStorage.setItem("thalluvandi-user-coords", JSON.stringify(coords));
      
      // Fetch human-readable location name
      reverseGeocode(lat, lng)
        .then((locationName) => {
          setDetectedLocationName(locationName);
          window.localStorage.setItem("thalluvandi-detected-location-name", locationName);
          setGeoSorting(false);
        })
        .catch((err) => {
          console.error("Geocoding failed:", err);
          setDetectedLocationName("your location");
          window.localStorage.setItem("thalluvandi-detected-location-name", "your location");
          setGeoSorting(false);
        });
    };

    const onError = (error: GeolocationPositionError) => {
      console.warn("High accuracy geolocation failed or timed out, trying fallback...", error);
      // Fallback with enableHighAccuracy: false
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (fallbackError) => {
          console.error("Fallback geolocation error:", fallbackError);
          setGeoSorting(false);
          if (fallbackError.code === fallbackError.PERMISSION_DENIED) {
            setLocationErrorMsg("Location access denied. Please enable location permissions in browser settings.");
          } else if (fallbackError.code === fallbackError.POSITION_UNAVAILABLE) {
            setLocationErrorMsg("Location unavailable. Please check if GPS/location services are enabled on your device.");
          } else if (fallbackError.code === fallbackError.TIMEOUT) {
            setLocationErrorMsg("Location request timed out. Please check location permissions or reload.");
          } else {
            setLocationErrorMsg("Could not determine your location. Showing all carts.");
          }
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  // Filter and sort carts
  const filteredCarts = useMemo(() => {
    const qLocation = searchParams.get("location");
    const list = dbCarts.filter(cart => {
      const cartTypeStr = Array.isArray(cart.type) ? cart.type.join(", ") : (cart.type || "");
      const matchesSearch = 
        cartTypeStr.toLowerCase().includes(search.toLowerCase()) || 
        (cart.nameEn && cart.nameEn.toLowerCase().includes(search.toLowerCase())) ||
        (cart.descriptionEn && cart.descriptionEn.toLowerCase().includes(search.toLowerCase())) ||
        (cart.descriptionTa && cart.descriptionTa.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = selectedTypes.length === 0 || selectedTypes.some(selected => {
        const keyword = 
          selected === "With Store" ? "stove" :
          selected === "With Roof" ? "roof" :
          selected === "Ice Cream" ? "ice cream" :
          selected === "Tea Stall" ? "tea" : selected.toLowerCase();

        return cartTypeStr.toLowerCase().includes(keyword.toLowerCase()) || 
               (cart.nameEn && cart.nameEn.toLowerCase().includes(keyword.toLowerCase()));
      });

      const matchesCondition = selectedConditions.length === 0 || selectedConditions.some(cond =>
        (cart.condition || "").toLowerCase().includes(cond.toLowerCase())
      );

      const chipKeywordMap: Record<string, string> = {
        "With Store": "stove",
        "With Roof": "roof",
        "Ice Cream": "ice cream",
        "Tea & Coffee": "tea",
        "E-Rickshaw": "rickshaw",
      };
      const matchesActiveTypeFilter = activeTypeFilter === "All" || (() => {
        const keyword = chipKeywordMap[activeTypeFilter] || activeTypeFilter.toLowerCase();
        return cartTypeStr.toLowerCase().includes(keyword) ||
               (cart.nameEn && cart.nameEn.toLowerCase().includes(keyword));
      })();

      const dailyPrice = cart.pricePerDay;
      const matchesPrice = dailyPrice <= maxPrice;

      // Handle location query filter
      let matchesLocation = true;
      if (qLocation && qLocation !== "all") {
        const cartLoc = getCartLocationName(cart).toLowerCase();
        const queryLoc = qLocation.toLowerCase();
        
        if (queryLoc === "coimbatore") {
          matchesLocation = (cart.latitude || 0) < 11.08;
        } else if (queryLoc === "tiruppur") {
          matchesLocation = (cart.latitude || 0) >= 11.08;
        } else {
          matchesLocation = cartLoc.includes(queryLoc);
        }
      }

      return matchesSearch && matchesType && matchesCondition && matchesPrice && matchesLocation && matchesActiveTypeFilter;
    });

    // Attach distance when geolocation is available
    let result = userCoords
      ? list.map(cart => {
          const dist = calculateHaversineDistance(userCoords, {
            latitude: cart.latitude || 11.0168,
            longitude: cart.longitude || 76.9558
          });
          return { ...cart, distanceKm: Number(dist.toFixed(2)) };
        })
      : list;

    // Client-side sort of the already-fetched data (no new API calls)
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "newest":
        result = [...result].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        break;
      case "nearest":
      default:
        if (userCoords) {
          result = [...result].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        }
        break;
    }

    return result;
  }, [dbCarts, search, selectedTypes, selectedConditions, maxPrice, userCoords, searchParams, activeTypeFilter, sortBy]);

  return (
    <main className="min-h-screen bg-[#0a0a08] pb-20 md:pb-10 pt-14 md:pt-20 text-[#f6ded3]">
      <div className="noise-overlay"></div>
      
      {/* Editorial Header */}
      <section className="relative overflow-hidden border-b border-[#ffb690]/10 pt-3 pb-6 md:py-8 px-4 md:px-8">
        <div className="site-container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">
              <Text en="Fleet Directory" ta="வண்டிகளின் பட்டியல்" />
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-[#fffdf7] mt-1 uppercase">
              <Text en="BROWSE THE FLEET" ta="வண்டிகளைத் தேடுங்கள்" />
            </h1>
          </div>
          
          <div className="w-full md:w-96 relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f6ded3]/60 w-4 h-4 z-10" />
            <input 
              type="text" 
              placeholder="" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-[#1c110b] text-[#fffdf7] border border-[#ffb690]/25 px-4 py-2.5 pl-9 pr-24 text-xs outline-none placeholder:text-[#f6ded3]/40 focus:border-[#f97316] rounded-xl z-0"
            />
            {/* Animated suggestion placeholder */}
            {!search && !isFocused && (
              <div className="absolute left-9 pointer-events-none text-xs text-[#f6ded3]/40 flex items-center gap-1 select-none z-10">
                <span>
                  <Text en="Search by" ta="தேடுக: " />
                </span>
                <span className="relative overflow-hidden inline-block h-4 w-28">
                  {SUGGESTIONS.map((sug, idx) => {
                    const sugTa = 
                      sug === "stove" ? "அடுப்பு" :
                      sug === "roof" ? "மேற்கூரை" :
                      sug === "ice cream" ? "ஐஸ் கிரீம்" :
                      sug === "tea stall" ? "டீ கடை" :
                      sug === "coimbatore" ? "கோவை" :
                      sug === "tiruppur" ? "திருப்பூர்" :
                      sug === "double burner" ? "இரட்டை அடுப்பு" : sug;
                    return (
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
                        &quot;<Text en={sug} ta={sugTa} />&quot;...
                      </span>
                    );
                  })}
                </span>
              </div>
            )}
            <button 
              onClick={() => setShowFilterPanel(prev => !prev)}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider font-bold flex items-center gap-1 transition-all z-10 ${
                showFilterPanel 
                  ? "bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/90" 
                  : "bg-[#251913] text-[#ffb690] border border-[#ffb690]/25 hover:bg-[#ffb690]/10"
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>
                <Text en="Filter" ta="வடிகட்டி" />
              </span>
            </button>
          </div>
        </div>
      </section>


      {/* Main Grid: Sidebar + Cards Grid */}
      <div className={`site-container max-w-7xl mx-auto px-4 pt-8 pb-4 md:pt-12 md:pb-8 grid grid-cols-1 ${showFilterPanel ? "lg:grid-cols-[280px_1fr]" : "lg:grid-cols-1"} gap-8`}>
        {/* Sidebar Filters */}
        {showFilterPanel && (
          <aside className="bg-[#160c06] border border-[#ffb690]/15 p-6 self-start rounded-xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#ffb690]/10 mb-6">
              <h2 className="font-display text-lg tracking-wider text-[#fffdf7] uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#f97316]" /> <Text en="Filters" ta="வடிகட்டிகள்" />
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedConditions([]);
                    setMaxPrice(200);
                    setSearch("");
                    setUserCoords(null);
                    setDetectedLocationName(null);
                    setLocationErrorMsg(null);
                  }}
                  className="text-xs font-display text-[#f97316] uppercase tracking-wider hover:underline"
                >
                  <Text en="Reset" ta="மீட்டமை" />
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="lg:hidden text-xs font-display text-[#f6ded3]/60 uppercase tracking-wider hover:underline"
                >
                  <Text en="Close" ta="மூடு" />
                </button>
              </div>
            </div>

            {/* Location Sorting */}
            <div className="mb-6 border-b border-[#ffb690]/10 pb-4">
              <label className="font-display text-xs tracking-widest text-[#f97316] uppercase block mb-2">
                <Text en="Distance Sort" ta="தொலைவு வாரியாக" />
              </label>
              {userCoords ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-green-500 font-bold">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>
                      {detectedLocationName ? (
                        <Text 
                          en={`Showing carts near ${detectedLocationName}`} 
                          ta={`${detectedLocationName} அருகே உள்ள வண்டிகள்`} 
                        />
                      ) : (
                        <Text en="Nearest Carts Shown First" ta="அருகிலுள்ள வண்டிகள் முதலில்" />
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={() => {
                        setUserCoords(null);
                        setDetectedLocationName(null);
                        setLocationErrorMsg(null);
                        window.localStorage.removeItem("thalluvandi-user-coords");
                        window.localStorage.removeItem("thalluvandi-detected-location-name");
                      }}
                      className="text-[10px] text-[#f97316] hover:underline text-left font-bold"
                    >
                      <Text en="Clear location sort" ta="இருப்பிட வரிசையை நீக்கு" />
                    </button>
                    <button 
                      onClick={() => handleEnableLocationSort(true)}
                      className="text-[10px] text-[#f6ded3]/60 hover:text-[#f97316] hover:underline text-left font-bold"
                    >
                      <Text en="Update / Re-detect location" ta="இருப்பிடத்தை புதுப்பிக்கவும்" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={() => handleEnableLocationSort(false)}
                    disabled={geoSorting}
                    className="w-full h-10 bg-transparent hover:bg-[#ffb690]/5 border border-[#ffb690]/35 text-[#ffb690] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-xl"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {geoSorting ? (
                      <Text en="Finding GPS..." ta="GPS தேடப்படுகிறது..." />
                    ) : (
                      <Text en="Show Carts Near Me" ta="எனக்கு அருகிலுள்ள வண்டிகள்" />
                    )}
                  </Button>
                  {locationErrorMsg && (
                    <div className="mt-2 text-[10px] text-red-400 font-semibold bg-red-950/20 border border-red-500/20 p-2 rounded-lg leading-relaxed">
                      {locationErrorMsg}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cart Type Filter */}
            <div className="mb-6">
              <label className="font-display text-xs tracking-widest text-[#f6ded3]/70 uppercase block mb-3">
                <Text en="Cart Type" ta="வண்டி வகை" />
              </label>
              <div className="space-y-2">
                {[
                  { id: "With Store", label: "With Store / Stove", labelTa: "அடுப்புடன் கூடிய வண்டி" },
                  { id: "With Roof", label: "With Roof / Covered", labelTa: "மேற்கூரையுடன் கூடிய வண்டி" },
                  { id: "Ice Cream", label: "Ice Cream Cart", labelTa: "ஐஸ் கிரீம் வண்டி" },
                  { id: "Tea Stall", label: "Tea Stall Station", labelTa: "தேநீர் கடை வண்டி" }
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedTypes.includes(item.id)}
                      onChange={() => toggleType(item.id)}
                      className="w-4 h-4 bg-[#0a0a08] border border-[#ffb690]/30 checked:bg-[#f97316] text-[#f97316] rounded"
                    />
                    <span className="text-sm text-[#f6ded3] group-hover:text-[#f97316] transition-colors">
                      <Text en={item.label} ta={item.labelTa} />
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div className="mb-6">
              <label className="font-display text-xs tracking-widest text-[#f6ded3]/70 uppercase block mb-3">
                <Text en="Condition" ta="வண்டியின் நிலை" />
              </label>
              <div className="space-y-2">
                {[
                  { id: "New", label: "Brand New", labelTa: "புதிய வண்டி" },
                  { id: "Used - Very Good", label: "Used - Very Good", labelTa: "மிகவும் நல்ல நிலை" },
                  { id: "Used - Good", label: "Used - Good", labelTa: "நல்ல நிலை" }
                ].map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedConditions.includes(item.id)}
                      onChange={() => toggleCondition(item.id)}
                      className="w-4 h-4 bg-[#0a0a08] border border-[#ffb690]/30 checked:bg-[#f97316] text-[#f97316] rounded"
                    />
                    <span className="text-sm text-[#f6ded3] group-hover:text-[#f97316] transition-colors">
                      <Text en={item.label} ta={item.labelTa} />
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="font-display text-xs tracking-widest text-[#f6ded3]/70 uppercase block mb-2">
                <Text en={`Max Daily Rent (₹${maxPrice}/day)`} ta={`அதிகபட்ச ஒரு நாள் வாடகை (₹${maxPrice}/நாள்)`} />
              </label>
              <input 
                type="range"
                min="50"
                max="200"
                step="5"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#f97316] bg-[#0a0a08] h-1"
              />
              <div className="flex justify-between text-[10px] text-[#f6ded3]/40 mt-1">
                <span>
                  <Text en="₹50/day" ta="₹50/நாள்" />
                </span>
                <span>
                  <Text en="₹200/day" ta="₹200/நாள்" />
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* Cards Grid */}
        <section>
          {/* Type filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
            {["All", "With Store", "With Roof", "Ice Cream", "Tea & Coffee", "E-Rickshaw"].map(chip => {
              const isActive = activeTypeFilter === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setActiveTypeFilter(chip)}
                  className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "bg-green-800 text-white border border-green-800"
                      : "bg-white text-green-800 border border-green-800 hover:bg-green-50"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-xs tracking-wider text-[#f6ded3]/60 uppercase">
                <Text
                  en={`${filteredCarts.length} carts matching your query`}
                  ta={`உங்கள் தேடலுக்கு ${filteredCarts.length} வண்டிகள் உள்ளன`}
                />
              </span>

              {/* Location chip (kept separate from type filter chips) */}
              {userCoords ? (
                <div className="flex items-center gap-2 text-xs text-green-500 font-bold bg-[#160c06] border border-green-500/20 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {detectedLocationName ? (
                      <Text
                        en={`Near ${detectedLocationName}`}
                        ta={`${detectedLocationName} அருகே`}
                      />
                    ) : (
                      <Text en="Nearest first" ta="அருகிலுள்ளவை முதலில்" />
                    )}
                  </span>
                  <button
                    onClick={() => {
                      setUserCoords(null);
                      setDetectedLocationName(null);
                      setLocationErrorMsg(null);
                    }}
                    className="text-[10px] text-[#f97316] hover:underline ml-1 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => handleEnableLocationSort(false)}
                  disabled={geoSorting}
                  className="h-8 bg-[#251913] hover:bg-[#ffb690]/10 border border-[#ffb690]/25 text-[#ffb690] text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg px-3"
                >
                  <Navigation className="w-3 h-3" />
                  {geoSorting ? (
                    <Text en="Finding GPS..." ta="தேடப்படுகிறது..." />
                  ) : (
                    <Text en="Carts Near Me" ta="அருகிலுள்ள வண்டிகள்" />
                  )}
                </Button>
              )}
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-8 bg-[#251913] border border-[#ffb690]/25 text-[#ffb690] text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 outline-none focus:border-[#f97316]"
            >
              <option value="nearest">Nearest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316] mx-auto mb-4"></div>
              <p className="text-sm text-[#f6ded3]/70">
                <Text en="Loading fleet directory..." ta="பட்டியல் ஏற்றப்படுகிறது..." />
              </p>
            </div>
          ) : filteredCarts.length === 0 ? (
            <div className="bg-[#160c06] border border-[#ffb690]/15 py-20 text-center rounded-xl">
              <p className="text-base">
                <Text en="No food carts found matching your filter criteria." ta="உங்கள் தேடலுக்கு தகுந்த தள்ளுவண்டிகள் எதுவும் இல்லை." />
              </p>
              <button 
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedConditions([]);
                  setMaxPrice(5000);
                  setSearch("");
                  setUserCoords(null);
                }}
                className="font-display text-xs text-[#f97316] tracking-wider uppercase mt-4 hover:underline"
              >
                <Text en="Clear all filters" ta="வடிகட்டிகளை நீக்கு" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredCarts.map(cart => {
                const conditionLabel = (cart.condition || "Used - Good").toUpperCase();
                const conditionClasses =
                  conditionLabel === "NEW"
                    ? "bg-green-500 text-white"
                    : conditionLabel === "USED - VERY GOOD"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-orange-400 text-white";

                const typeLabel = ((Array.isArray(cart.type) ? cart.type[0] : cart.type) || "Cart");

                const descriptionText = lang === "ta" ? (cart.descriptionTa || cart.descriptionEn) : cart.descriptionEn;
                const showDescription = !!descriptionText && descriptionText.trim().toLowerCase() !== "self-listed cart";

                return (
                  <div key={cart.id} className="group bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col rounded-xl overflow-hidden relative h-full">

                    {/* Photo section */}
                    <div className="relative w-full h-[200px] bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                      <span className={`absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${conditionClasses}`}>
                        {conditionLabel}
                      </span>
                      {cart.distanceKm !== undefined && (
                        <span className="absolute bottom-2 left-2 z-10 bg-green-800 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                          📍 {cart.distanceKm.toFixed(2)} km
                        </span>
                      )}
                      {cart.images && cart.images[0] ? (
                        <img
                          src={cart.images[0]}
                          alt={cart.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg viewBox="0 0 100 80" className="w-16 h-16 text-gray-300" fill="currentColor">
                          <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                        </svg>
                      )}
                    </div>

                    {/* Card content */}
                    <div className="flex flex-col flex-grow p-2 md:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide border border-green-700 text-green-700 px-2 py-0.5 rounded-full">
                          {typeLabel}
                        </span>
                        {cart.verified && (
                          <span className="text-xs text-green-600 font-bold">✓ Verified</span>
                        )}
                      </div>

                      {showDescription && (
                        <p
                          className="text-xs md:text-sm text-gray-500 mb-2"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {descriptionText}
                        </p>
                      )}

                      <div className="mt-auto">
                        <span className="text-lg md:text-2xl font-bold text-green-800 block mb-3">
                          ₹{cart.pricePerDay}/day
                        </span>
                        <Button asChild className="w-full bg-green-800 hover:bg-green-900 text-white font-bold rounded-lg h-10 text-xs md:text-sm">
                          <Link href={`/carts/${cart.id}`} className="after:absolute after:inset-0 after:z-10">VIEW DETAILS</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Browse by Cart Type Section */}
          <div className="border-t border-[#ffb690]/10 mt-16 pt-8">
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">
              <Text en="Categories" ta="வகைகள்" />
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-[#fffdf7] mt-1 mb-6 uppercase">
              <Text en="Browse by Cart Type" ta="வண்டி வகை வாரியாக" />
            </h2>
            {/* Mobile layout: 1 x 4 swipeable cards. Desktop layout: responsive */}
            <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-4 md:pb-0">
              {[
                { id: "With Store", label: "With Store / Stove", labelTa: "அடுப்புடன் கூடிய வண்டி", icon: <IconSearchStove className="w-8 h-8 text-[#f97316]" />, desc: "Integrated burners & shelves", descTa: "அடுப்புகள் & அலமாரிகளுடன்" },
                { id: "With Roof", label: "With Roof / Covered", labelTa: "மேற்கூரையுடன் கூடிய வண்டி", icon: <IconTent className="w-8 h-8 text-[#f97316]" />, desc: "Heavy-duty metal canopy", descTa: "உறுதியான உலோக மேற்கூரையுடன்" },
                { id: "Ice Cream", label: "Ice Cream Cart", labelTa: "ஐஸ் கிரீம் வண்டி", icon: <IconIceCream className="w-8 h-8 text-[#f97316]" />, desc: "Insulated cold box & dome", descTa: "குளிரூட்டப்பட்ட பெட்டியுடன்" },
                { id: "Tea Stall", label: "Tea Stall Station", labelTa: "தேநீர் கடை வண்டி", icon: <IconCoffee className="w-8 h-8 text-[#f97316]" />, desc: "Full stainless steel setup", descTa: "முழு எஃகு அமைப்பில்" }
              ].map(item => {
                const isSelected = selectedTypes.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleType(item.id)}
                    className={`flex-shrink-0 w-[240px] md:w-auto snap-start p-4 bg-[#160c06] border hover:border-[#f97316]/50 transition-all duration-300 rounded-xl text-left flex flex-col justify-between aspect-[16/10] ${
                      isSelected ? "border-[#f97316] bg-[#251913]" : "border-[#ffb690]/15"
                    }`}
                  >
                    <div>
                      <div className="mb-2">{item.icon}</div>
                      <h3 className="font-display text-sm md:text-base text-[#fffdf7] tracking-wider uppercase">
                        <Text en={item.label} ta={item.labelTa} />
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#f6ded3]/60 font-sans">
                      <Text en={item.desc} ta={item.descTa} />
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function BrowseCartsPage() {
  return (
    <Suspense fallback={
      <main className="bg-[#0a0a08] min-h-screen pt-20 text-[#f6ded3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316] mx-auto mb-4"></div>
          <p className="font-semibold text-sm">
            <Text en="Loading fleet directory..." ta="பட்டியல் ஏற்றப்படுகிறது..." />
          </p>
        </div>
      </main>
    }>
      <BrowseCartsPageContent />
    </Suspense>
  );
}
