"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, SlidersHorizontal, ArrowLeft, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLiveCartsAction } from "@/app/actions";
import { calculateHaversineDistance } from "@/lib/routing";

function BrowseCartsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000); // V2 uses monthly rent (up to 5000/month)
  const [dbCarts, setDbCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Geolocation sorting state
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoSorting, setGeoSorting] = useState(false);

  // Sync state with URL search params once on mount and fetch carts
  useEffect(() => {
    async function loadData() {
      try {
        const res = await getLiveCartsAction();
        if (res.success && res.data) {
          setDbCarts(res.data);
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
    if (qPrice) setMaxPrice(Number(qPrice) || 5000);
  }, [searchParams]);

  // Request browser geolocation to sort carts by closest distance
  const handleEnableLocationSort = () => {
    if (!navigator.geolocation) return;
    setGeoSorting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoSorting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeoSorting(false);
      }
    );
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
    const list = dbCarts.filter(cart => {
      const matchesSearch = 
        cart.type.toLowerCase().includes(search.toLowerCase()) || 
        (cart.description && cart.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(cart.type);
      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(cart.condition);
      const matchesPrice = cart.price_per_month <= maxPrice;

      return matchesSearch && matchesType && matchesCondition && matchesPrice;
    });

    // If geolocation is available, sort list by distance (nearest first)
    if (userCoords) {
      return list.map(cart => {
        const dist = calculateHaversineDistance(userCoords, {
          latitude: cart.latitude,
          longitude: cart.longitude
        });
        return { ...cart, distanceKm: Number(dist.toFixed(2)) };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list;
  }, [dbCarts, search, selectedTypes, selectedConditions, maxPrice, userCoords]);

  return (
    <main className="min-h-screen bg-[#0a0a08] pb-20 md:pb-10 pt-20 text-[#f6ded3]">
      <div className="noise-overlay"></div>
      
      {/* Editorial Header */}
      <section className="relative overflow-hidden border-b border-[#ffb690]/10 py-8 px-4 md:px-8">
        <div className="site-container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="text-[#f97316] hover:text-[#f97316]/80 flex items-center gap-1 text-xs uppercase tracking-widest font-display">
                <ArrowLeft className="w-4 h-4" /> Home
              </Link>
            </div>
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Fleet Directory [V2]</span>
            <h1 className="font-display text-4xl md:text-6xl text-[#fffdf7] mt-1 uppercase">BROWSE THE FLEET</h1>
          </div>
          
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f6ded3]/60 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search fleet by type or info..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1c110b] text-[#fffdf7] border border-[#ffb690]/25 px-4 py-3 pl-10 text-sm outline-none placeholder:text-[#f6ded3]/40 focus:border-[#f97316]"
            />
          </div>
        </div>
      </section>

      {/* Main Grid: Sidebar + Cards Grid */}
      <div className="site-container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="bg-[#160c06] border border-[#ffb690]/15 p-6 self-start rounded-xl">
          <div className="flex justify-between items-center pb-4 border-b border-[#ffb690]/10 mb-6">
            <h2 className="font-display text-lg tracking-wider text-[#fffdf7] uppercase flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#f97316]" /> Filters
            </h2>
            <button 
              onClick={() => {
                setSelectedTypes([]);
                setSelectedConditions([]);
                setMaxPrice(5000);
                setSearch("");
                setUserCoords(null);
              }}
              className="text-xs font-display text-[#f97316] uppercase tracking-wider hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Location Sorting */}
          <div className="mb-6 border-b border-[#ffb690]/10 pb-4">
            <label className="font-display text-xs tracking-widest text-[#f97316] uppercase block mb-2">Distance Sort</label>
            {userCoords ? (
              <div className="flex items-center gap-2 text-xs text-green-500 font-bold">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Nearest Carts Shown First</span>
              </div>
            ) : (
              <Button 
                onClick={handleEnableLocationSort}
                disabled={geoSorting}
                className="w-full h-10 bg-transparent hover:bg-[#ffb690]/5 border border-[#ffb690]/35 text-[#ffb690] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                {geoSorting ? "Finding GPS..." : "Show Carts Near Me"}
              </Button>
            )}
          </div>

          {/* Cart Type Filter */}
          <div className="mb-6">
            <label className="font-display text-xs tracking-widest text-[#f6ded3]/70 uppercase block mb-3">Cart Type</label>
            <div className="space-y-2">
              {[
                { id: "With Store", label: "With Store / Stove" },
                { id: "With Roof", label: "With Roof / Covered" },
                { id: "Ice Cream", label: "Ice Cream Cart" },
                { id: "Tea Stall", label: "Tea Stall Station" }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedTypes.includes(item.id)}
                    onChange={() => toggleType(item.id)}
                    className="w-4 h-4 bg-[#0a0a08] border border-[#ffb690]/30 checked:bg-[#f97316] text-[#f97316]"
                  />
                  <span className="text-sm text-[#f6ded3] group-hover:text-[#f97316] transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-6">
            <label className="font-display text-xs tracking-widest text-[#f6ded3]/70 uppercase block mb-3">Condition</label>
            <div className="space-y-2">
              {[
                { id: "New", label: "Brand New" },
                { id: "Used - Very Good", label: "Used - Very Good" },
                { id: "Used - Good", label: "Used - Good" }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedConditions.includes(item.id)}
                    onChange={() => toggleCondition(item.id)}
                    className="w-4 h-4 bg-[#0a0a08] border border-[#ffb690]/30 checked:bg-[#f97316] text-[#f97316]"
                  />
                  <span className="text-sm text-[#f6ded3] group-hover:text-[#f97316] transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="font-display text-xs tracking-widest text-[#f6ded3]/70 uppercase block mb-2">Max Monthly Rent (₹{maxPrice.toLocaleString()})</label>
            <input 
              type="range"
              min="1500"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#f97316] bg-[#0a0a08] h-1"
            />
            <div className="flex justify-between text-[10px] text-[#f6ded3]/40 mt-1">
              <span>₹1,500</span>
              <span>₹5,000</span>
            </div>
          </div>
        </aside>

        {/* Cards Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <span className="font-display text-xs tracking-wider text-[#f6ded3]/60 uppercase">
              {filteredCarts.length} carts matching your query
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316] mx-auto mb-4"></div>
              <p className="text-sm text-[#f6ded3]/70">Loading fleet directory...</p>
            </div>
          ) : filteredCarts.length === 0 ? (
            <div className="bg-[#160c06] border border-[#ffb690]/15 py-20 text-center rounded-xl">
              <p className="text-base">No food carts found matching your filter criteria.</p>
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
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCarts.map(cart => (
                <div key={cart.id} className="bg-[#160c06] border border-[#ffb690]/15 hover:border-[#f97316]/50 transition-all duration-300 flex flex-col p-4 rounded-xl relative">
                  {cart.distanceKm !== undefined && (
                    <div className="absolute top-2 left-2 z-20 bg-[#f97316] text-[#0a0a08] font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                      📍 {cart.distanceKm} km away
                    </div>
                  )}
                  
                  <div className="aspect-[16/10] bg-[#251913] relative shrink-0 p-4 flex items-center justify-center mb-4 rounded-lg overflow-hidden">
                    <span className={`absolute top-2 right-2 text-[8px] font-display tracking-widest px-2 py-0.5 font-bold ${cart.condition === "New" ? "bg-[#f97316] text-[#0a0a08]" : "bg-[#ffca45] text-[#0a0a08]"}`}>
                      {cart.condition.toUpperCase()}
                    </span>
                    <svg viewBox="0 0 100 80" className="w-20 h-20 text-[#ffb690]/10" fill="currentColor">
                      <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                    </svg>
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase tracking-widest bg-[#0a0a08] text-[#ffb690] px-2 py-0.5 border border-[#ffb690]/20 rounded">
                        {cart.type.toUpperCase()}
                      </span>
                      {cart.verified && (
                        <span className="text-[9px] text-[#25D366] font-bold uppercase tracking-wider">✓ Verified</span>
                      )}
                    </div>

                    <h3 className="font-display text-xl text-[#fffdf7] tracking-wider uppercase mb-1 line-clamp-1 mt-1">{cart.type}</h3>
                    <p className="text-xs text-[#f6ded3]/70 mb-4 line-clamp-2 leading-relaxed h-10">{cart.description || "Premium rental food cart option."}</p>
                    
                    <div className="mt-auto pt-4 border-t border-[#ffb690]/10 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#f6ded3]/40 block">Monthly Rent</span>
                        <span className="font-display text-2xl text-[#ffca45] block">₹{cart.price_per_month.toLocaleString()}</span>
                      </div>
                      <Button asChild className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-lg font-display uppercase tracking-widest text-xs py-2 px-6">
                        <Link href={`/carts/${cart.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <p className="font-semibold text-sm">Loading fleet directory...</p>
        </div>
      </main>
    }>
      <BrowseCartsPageContent />
    </Suspense>
  );
}
