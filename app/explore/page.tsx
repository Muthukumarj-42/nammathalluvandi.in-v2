"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, Filter, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_CARTS = [
  { id: 1, title: "ELITE STAINLESS PRO V2", type: "stove", condition: "new", price: 24500, location: "coimbatore", rating: 4.8, reviews: 32, desc: "Dual burners, heavy-duty build & partition shelves." },
  { id: 2, title: "CLASSIC TEAX STATION V1", type: "coffee", condition: "new", price: 16000, location: "coimbatore", rating: 4.5, reviews: 14, desc: "Utility drawers, waste sink, and stainless steel counter." },
  { id: 3, title: "STANDARD MS PUSH FOOD CART", type: "stove", condition: "used", price: 12000, location: "coimbatore", rating: 4.3, reviews: 21, desc: "Compact pushcart with integrated single stove setup." },
  { id: 4, title: "MINIMALIST TEA STATION", type: "coffee", condition: "used", price: 15000, location: "tiruppur", rating: 4.0, reviews: 5, desc: "Pre-owned iron frame, custom wooden boards & cup holders." },
  { id: 5, title: "PREMIUM ICE CREAM MOBILE", type: "icecream", condition: "new", price: 22000, location: "tiruppur", rating: 4.9, reviews: 18, desc: "Insulated freezer container, colorful roof structure." },
  { id: 6, title: "E-RICKSHAW FAST FOOD POD", type: "erickshaw", condition: "new", price: 35000, location: "coimbatore", rating: 4.7, reviews: 9, desc: "Heavy commercial mobile chassis designed for e-vehicles." },
  { id: 7, title: "HEAVY DUTY BIRYANI CART", type: "stove", condition: "used", price: 18500, location: "tiruppur", rating: 4.4, reviews: 27, desc: "Designed for large pots, dual stove burners & high capacity." },
  { id: 8, title: "COMPACT JUICE/SALAD BAR", type: "roof", condition: "new", price: 14000, location: "coimbatore", rating: 4.2, reviews: 8, desc: "Clear vinyl roof cover, layout partition for juice prep." }
];

function BrowseCartsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [maxPrice, setMaxPrice] = useState(40000);

  // Sync state with URL search params once on mount
  useEffect(() => {
    const qSearch = searchParams.get("search");
    const qType = searchParams.get("type");
    const qCondition = searchParams.get("condition");
    const qLocation = searchParams.get("location");
    const qPrice = searchParams.get("price");

    if (qSearch) setSearch(qSearch);
    if (qType) setSelectedTypes(qType.split(","));
    if (qCondition) setSelectedConditions(qCondition.split(","));
    if (qLocation) setSelectedLocation(qLocation);
    if (qPrice) setMaxPrice(Number(qPrice) || 40000);
  }, [searchParams]);

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

  const filteredCarts = useMemo(() => {
    return MOCK_CARTS.filter(cart => {
      const matchesSearch = cart.title.toLowerCase().includes(search.toLowerCase()) || 
                            cart.desc.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(cart.type);
      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(cart.condition);
      const matchesLocation = selectedLocation === "all" || cart.location === selectedLocation;
      const matchesPrice = cart.price <= maxPrice;

      return matchesSearch && matchesType && matchesCondition && matchesLocation && matchesPrice;
    });
  }, [search, selectedTypes, selectedConditions, selectedLocation, maxPrice]);

  return (
    <main className="min-h-screen bg-[#0a0a08] pb-20 md:pb-10 pt-20">
      <div className="noise-overlay"></div>
      
      {/* Editorial Header */}
      <section className="relative overflow-hidden border-b border-outline-variant/20 py-8 px-4 md:px-8">
        <div className="site-container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="text-[#f97316] hover:text-[#f97316]/80 flex items-center gap-1 text-xs uppercase tracking-widest font-display">
                <ArrowLeft className="w-4 h-4" /> Home
              </Link>
            </div>
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Fleet Directory</span>
            <h1 className="font-display text-4xl md:text-6xl text-on-surface mt-1 uppercase">BROWSE THE FLEET</h1>
          </div>
          
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search fleet by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1c110b] text-on-surface border border-outline-variant/30 px-4 py-3 pl-10 text-sm outline-none placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>
      </section>

      {/* Main Grid: Sidebar + Cards Grid */}
      <div className="site-container max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="bg-surface border border-outline-variant/20 p-6 self-start">
          <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20 mb-6">
            <h2 className="font-display text-lg tracking-wider text-on-surface uppercase flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#f97316]" /> Filters
            </h2>
            <button 
              onClick={() => {
                setSelectedTypes([]);
                setSelectedConditions([]);
                setSelectedLocation("all");
                setMaxPrice(40000);
                setSearch("");
              }}
              className="text-xs font-display text-[#f97316] uppercase tracking-wider hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Location Select */}
          <div className="mb-6">
            <label className="font-display text-xs tracking-widest text-on-surface-variant uppercase block mb-2">Location</label>
            <div className="relative">
              <select 
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full bg-[#160c06] text-on-surface border border-outline-variant/30 px-3 py-2 text-sm outline-none appearance-none"
              >
                <option value="all">All Regions</option>
                <option value="coimbatore">Coimbatore</option>
                <option value="tiruppur">Tiruppur</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Cart Type Filter */}
          <div className="mb-6">
            <label className="font-display text-xs tracking-widest text-on-surface-variant uppercase block mb-3">Cart Type</label>
            <div className="space-y-2">
              {[
                { id: "stove", label: "With Stove" },
                { id: "roof", label: "With Roof" },
                { id: "icecream", label: "Ice Cream" },
                { id: "coffee", label: "Tea / Coffee" },
                { id: "erickshaw", label: "E-Rickshaw" }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedTypes.includes(item.id)}
                    onChange={() => toggleType(item.id)}
                    className="w-4 h-4 bg-[#160c06] border border-outline-variant/30 checked:bg-[#f97316] text-[#f97316]"
                  />
                  <span className="text-sm font-body text-on-surface group-hover:text-[#f97316] transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-6">
            <label className="font-display text-xs tracking-widest text-on-surface-variant uppercase block mb-3">Condition</label>
            <div className="space-y-2">
              {[
                { id: "new", label: "New / Brand New" },
                { id: "used", label: "Pre-Owned" }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedConditions.includes(item.id)}
                    onChange={() => toggleCondition(item.id)}
                    className="w-4 h-4 bg-[#160c06] border border-outline-variant/30 checked:bg-[#f97316] text-[#f97316]"
                  />
                  <span className="text-sm font-body text-on-surface group-hover:text-[#f97316] transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="font-display text-xs tracking-widest text-on-surface-variant uppercase block mb-2">Max Price (₹{maxPrice.toLocaleString()})</label>
            <input 
              type="range"
              min="10000"
              max="40000"
              step="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#f97316] bg-[#160c06] h-1"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/40 mt-1">
              <span>₹10,000</span>
              <span>₹40,000</span>
            </div>
          </div>
        </aside>

        {/* Cards Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <span className="font-display text-xs tracking-wider text-on-surface-variant/60 uppercase">
              {filteredCarts.length} carts matching your query
            </span>
          </div>

          {filteredCarts.length === 0 ? (
            <div className="bg-surface border border-outline-variant/20 py-20 text-center text-on-surface-variant">
              <p className="text-base font-body">No food carts found matching your filter criteria.</p>
              <button 
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedConditions([]);
                  setSelectedLocation("all");
                  setMaxPrice(40000);
                  setSearch("");
                }}
                className="font-display text-xs text-[#f97316] tracking-wider uppercase mt-4 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCarts.map(cart => (
                <div key={cart.id} className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 flex flex-col p-4">
                  <div className="aspect-[16/10] bg-[#251913] relative shrink-0 p-4 flex items-center justify-center mb-4">
                    <span className={`absolute top-2 left-2 text-[8px] font-display tracking-widest px-2 py-0.5 font-bold ${cart.condition === "new" ? "bg-[#f97316] text-[#0a0a08]" : "bg-[#ffca45] text-[#0a0a08]"}`}>
                      {cart.condition.toUpperCase()}
                    </span>
                    <span className="absolute top-2 right-2 text-[8px] font-display tracking-widest bg-[#160c06] text-[#ffb690] px-2 py-0.5 border border-[#ffb690]/20">
                      {cart.type.toUpperCase()}
                    </span>
                    <svg viewBox="0 0 100 80" className="w-20 h-20 text-on-surface-variant/10" fill="currentColor">
                      <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                    </svg>
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-xs text-[#ffca45] mb-1">
                      <span>★</span>
                      <span className="font-display font-bold text-on-surface">{cart.rating}</span>
                      <span className="text-[10px] text-on-surface-variant/50">({cart.reviews} reviews)</span>
                    </div>

                    <h3 className="font-display text-xl text-on-surface tracking-wider uppercase mb-1 line-clamp-1">{cart.title}</h3>
                    <p className="font-body text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">{cart.desc}</p>
                    
                    <div className="mt-auto pt-4 border-t border-outline-variant/10 flex justify-between items-end">
                      <div>
                        <span className="font-display text-2xl text-[#ffca45] block">₹{cart.price.toLocaleString()}</span>
                        <span className="text-[9px] uppercase tracking-wider text-on-surface-variant/40 flex items-center gap-1">
                          📍 {cart.location.toUpperCase()}
                        </span>
                      </div>
                      <Button asChild className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-none font-display uppercase tracking-widest text-xs py-2 px-6">
                        <Link href={`/cart/${cart.id}`}>Select</Link>
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
