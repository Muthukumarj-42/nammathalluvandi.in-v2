import Link from "next/link";
import Image from "next/image";
import { Search, ChevronRight, MoreHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconStove, IconTent, IconIceCream, IconCoffee, IconRickshaw, IconMapPinRed, IconRupee, IconWhatsApp, IconSearchStove } from "@/components/ui/icons";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a08] pb-20 md:pb-10 pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-outline-variant/20 pt-12 pb-16 px-4 md:px-8">
        <div className="absolute inset-0 editorial-grid opacity-30"></div>
        <div className="absolute inset-0 cinematic-vignette"></div>

        <div className="site-container max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
          {/* Saffron tag */}
          <span className="font-display text-sm tracking-[0.2em] text-[#f97316] bg-[#f97316]/10 px-4 py-1.5 uppercase mb-6 border border-[#f97316]/20">
            ★ FOOD CART MARKETPLACE ★
          </span>

          <h1 className="font-display text-5xl md:text-8xl tracking-tight text-on-surface leading-none mb-6">
            THALLUVANDI<br />
            <span className="text-[#f97316]">PREMIUM RENTAL</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-xl mb-8 leading-relaxed">
            Find the right cart for your street business. High quality, premium models, and verified vendors — active in Coimbatore and Tiruppur.
          </p>

          {/* Search bar & Location bar in editorial style */}
          <form action="/explore" method="GET" className="w-full max-w-2xl bg-surface border border-outline-variant/30 p-2 flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-5 h-5" />
              <input 
                type="text" 
                name="search"
                placeholder="Search by cart type, features, or size..." 
                className="w-full bg-[#160c06] text-on-surface border-none px-4 py-3 pl-10 text-sm outline-none placeholder:text-on-surface-variant/40"
              />
            </div>
            
            <div className="flex items-center bg-[#251913] px-4 py-2 border border-outline-variant/10 shrink-0 md:w-60">
              <IconMapPinRed className="w-4 h-4 text-[#f97316] mr-2 shrink-0" />
              <div className="flex flex-col text-left flex-grow">
                <select 
                  name="location"
                  className="bg-transparent text-xs font-display tracking-wider text-on-surface uppercase outline-none w-full cursor-pointer appearance-none pr-4"
                >
                  <option value="all" className="bg-[#1c110b] text-[#f6ded3]">Coimbatore / Tiruppur</option>
                  <option value="coimbatore" className="bg-[#1c110b] text-[#f6ded3]">Coimbatore</option>
                  <option value="tiruppur" className="bg-[#1c110b] text-[#f6ded3]">Tiruppur</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-none font-display uppercase tracking-wider text-sm py-3 px-8">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="bg-[#f97316] py-2 overflow-hidden whitespace-nowrap border-y border-[#f97316]/30">
        <div className="marquee-content flex">
          <div className="flex items-center gap-12 px-6">
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">WITH STOVE</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">WITH ROOF</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">TEA / COFFEE STATION</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">ICE CREAM CART</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">E-RICKSHAW CARTS</span>
            <span className="text-[#0a0a08]/40">●</span>
          </div>
          <div className="flex items-center gap-12 px-6">
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">WITH STOVE</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">WITH ROOF</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">TEA / COFFEE STATION</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">ICE CREAM CART</span>
            <span className="text-[#0a0a08]/40">●</span>
            <span className="font-display text-sm text-[#0a0a08] uppercase tracking-widest font-bold">E-RICKSHAW CARTS</span>
            <span className="text-[#0a0a08]/40">●</span>
          </div>
        </div>
      </div>

      <div className="site-container max-w-5xl mx-auto px-4 mt-16">
        {/* Browse by Type */}
        <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
          <div>
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Categories</span>
            <h3 className="font-display text-3xl text-on-surface mt-1">BROWSE BY CART TYPE</h3>
          </div>
          <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Link href="/explore?type=stove" className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 aspect-square text-center">
            <IconSearchStove className="w-8 h-8 text-[#f97316]" />
            <span className="font-display text-sm tracking-wider text-on-surface uppercase">With Stove</span>
          </Link>
          <Link href="/explore?type=roof" className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 aspect-square text-center">
            <IconTent className="w-8 h-8 text-[#f97316]" />
            <span className="font-display text-sm tracking-wider text-on-surface uppercase">With Roof</span>
          </Link>
          <Link href="/explore?type=icecream" className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 aspect-square text-center">
            <IconIceCream className="w-8 h-8 text-[#f97316]" />
            <span className="font-display text-sm tracking-wider text-on-surface uppercase">Ice Cream</span>
          </Link>
          <Link href="/explore?type=coffee" className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 aspect-square text-center">
            <IconCoffee className="w-8 h-8 text-[#f97316]" />
            <span className="font-display text-sm tracking-wider text-on-surface uppercase">Tea / Coffee</span>
          </Link>
          <Link href="/explore?type=erickshaw" className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 aspect-square text-center">
            <IconRickshaw className="w-8 h-8 text-[#f97316]" />
            <span className="font-display text-sm tracking-wider text-on-surface uppercase">E-Rickshaw</span>
          </Link>
          <Link href="/explore" className="bg-surface border border-outline-variant/30 hover:border-[#f97316]/50 transition-all duration-300 p-4 flex flex-col items-center justify-center gap-3 aspect-square text-center">
            <MoreHorizontal className="w-8 h-8 text-on-surface-variant/60" />
            <span className="font-display text-sm tracking-wider text-on-surface uppercase">Others</span>
          </Link>
        </div>

        {/* Premium Models */}
        <div className="mt-20">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Exclusive Fleet</span>
              <h3 className="font-display text-3xl text-on-surface mt-1">PREMIUM CART MODELS</h3>
            </div>
            <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { tag: "BESTSELLER", tagColor: "bg-[#f97316] text-[#0a0a08]", title: "ELITE STAINLESS PRO V2", desc: "Dual integrated high-power burners, premium food-grade steel & display shelf.", price: "₹24,500" },
              { tag: "NEW ARRIVAL", tagColor: "bg-[#ffca45] text-[#0a0a08]", title: "CLASSIC TEAX STATION V1", desc: "Equipped with wide partition counters, utility lock-box, and waste sink.", price: "₹16,000" }
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-[#f97316]/25 hover:border-[#f97316]/60 transition-all duration-300 flex flex-col">
                <div className="aspect-[16/9] bg-[#251913] relative shrink-0 p-6 flex items-center justify-center">
                  <span className={`absolute top-4 left-4 text-[10px] font-display font-bold px-3 py-1 ${item.tagColor} tracking-wider`}>
                    {item.tag}
                  </span>
                  
                  {/* Vector cart illustration */}
                  <svg viewBox="0 0 100 80" className="w-24 h-24 text-on-surface-variant/20" fill="currentColor">
                    <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                  </svg>
                </div>
                <div className="p-6 flex flex-col flex-grow border-t border-outline-variant/20">
                  <h4 className="font-display text-xl text-on-surface tracking-wider">{item.title}</h4>
                  <p className="font-body text-sm text-on-surface-variant mt-2 mb-6 flex-grow">{item.desc}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                    <div>
                      <span className="font-display text-2xl text-[#ffca45] block">{item.price}</span>
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 block">Daily/Monthly Plans</span>
                    </div>
                    <Button asChild className="bg-transparent border border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10 rounded-none px-6 py-2 h-auto font-display tracking-wider text-xs">
                      <Link href={`/cart/${i === 0 ? "1" : "2"}`}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Thalluvandi / Editorial Advantage */}
        <div className="mt-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Why Choose Us</span>
            <h3 className="font-display text-4xl text-on-surface mt-1 leading-none">BUILT FOR SCALE, PRICED FOR GROWTH</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-outline-variant/20 p-6 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]"></div>
              <h4 className="font-display text-lg text-on-surface tracking-wider uppercase mb-2">Verified Sellers</h4>
              <p className="font-body text-sm text-on-surface-variant">Every vendor is personally vetted for physical quality, stainless steel grades, and functional suitability.</p>
            </div>
            <div className="bg-surface border border-outline-variant/20 p-6 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]"></div>
              <h4 className="font-display text-lg text-on-surface tracking-wider uppercase mb-2">Local Focus</h4>
              <p className="font-body text-sm text-on-surface-variant">Distance-based routing algorithm matches you with available carts nearby, saving transport overhead.</p>
            </div>
            <div className="bg-surface border border-outline-variant/20 p-6 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]"></div>
              <h4 className="font-display text-lg text-on-surface tracking-wider uppercase mb-2">Fair Pricing</h4>
              <p className="font-body text-sm text-on-surface-variant">No hidden broker fees. Direct rentals from owners at standardized daily/monthly rates.</p>
            </div>
          </div>
        </div>

        {/* Territory / Active Regions */}
        <div className="mt-24 bg-[#160c06] border border-[#f97316]/20 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Our Territory</span>
              <h3 className="font-display text-4xl md:text-5xl text-on-surface mt-1 mb-4">WHERE WE OPERATE</h3>
              <p className="font-body text-sm text-on-surface-variant max-w-sm">
                Providing reliable food cart solutions across Western Tamil Nadu. Seamless onboarding and delivery setup.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-[#f97316]/30 bg-surface/50">
                <span className="font-display text-lg tracking-wider text-on-surface">COIMBATORE</span>
                <span className="text-[10px] font-display bg-[#f97316] text-[#0a0a08] px-3 py-1 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-[#f97316]/30 bg-surface/50">
                <span className="font-display text-lg tracking-wider text-on-surface">TIRUPPUR</span>
                <span className="text-[10px] font-display bg-[#f97316] text-[#0a0a08] px-3 py-1 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-outline-variant/20 bg-surface/20 opacity-40">
                <span className="font-display text-lg tracking-wider text-on-surface">ERODE & SALEM</span>
                <span className="text-[10px] font-display border border-[#f97316]/40 text-[#f97316] px-3 py-1">COMING 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Used Carts Marketplace */}
        <div className="mt-24">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-display text-xs tracking-widest text-[#f97316] uppercase">Used & Affordable Fleet</span>
              <h3 className="font-display text-3xl text-on-surface mt-1">MARKETPLACE LISTINGS</h3>
            </div>
            <Link href="/explore" className="font-display text-sm text-[#f97316] hover:underline flex items-center tracking-widest uppercase">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "STANDARD MS PUSH FOOD CART (3FT)", price: "₹12,000", location: "Ondipudur, Coimbatore" },
              { title: "MINIMALIST FAST FOOD TEA STATION", price: "₹15,000", location: "Tiruppur Junction" }
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-outline-variant/30 flex flex-col p-4">
                <div className="aspect-[16/10] bg-[#251913] relative shrink-0 p-4 flex items-center justify-center mb-4">
                  <span className="absolute top-2 left-2 text-[8px] font-display tracking-widest bg-[#ffca45] text-[#0a0a08] px-2 py-0.5 font-bold">
                    PRE-OWNED
                  </span>
                  <svg viewBox="0 0 100 80" className="w-20 h-20 text-on-surface-variant/10" fill="currentColor">
                    <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="font-display text-lg text-on-surface tracking-wider line-clamp-1">{item.title}</h4>
                  <span className="font-display text-xl text-[#ffca45] mt-1 mb-1 block">{item.price}</span>
                  <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
                    📍 {item.location}
                  </p>
                  
                  <Button asChild className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white border-none rounded-none font-display uppercase tracking-widest text-xs py-2">
                    <Link href={`/cart/${i+1}`}>
                      <IconWhatsApp className="w-4 h-4 mr-1.5 inline-block align-middle" />
                      WhatsApp Inquiry
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sell Banner */}
        <div className="mt-24 mb-16">
          <div className="bg-[#f97316] text-[#0a0a08] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative z-10 max-w-md">
              <span className="font-display text-xs tracking-widest text-[#0a0a08]/80 uppercase block mb-1">Earn From Your Idle Asset</span>
              <h3 className="font-display text-4xl tracking-tight text-[#0a0a08] mb-3">OWN A FOOD CART?</h3>
              <p className="font-body text-sm text-[#0a0a08]/80 leading-relaxed">
                List it on Namma Thalluvandi in less than 2 minutes. Reach verified buyers and vendors across the region.
              </p>
            </div>
            
            <Button asChild className="bg-[#0a0a08] text-[#f97316] hover:bg-[#0a0a08]/90 border-none rounded-none font-display uppercase tracking-widest text-sm py-4 px-8 shrink-0 relative z-10">
              <Link href="/sell">
                Start Selling <ChevronRight className="w-4 h-4 ml-1.5 inline-block" />
              </Link>
            </Button>

            {/* Decorative Vector */}
            <svg viewBox="0 0 100 80" className="absolute -right-12 -bottom-12 w-64 h-64 text-[#0a0a08]/5" fill="currentColor">
              <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
