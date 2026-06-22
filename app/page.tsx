import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, PlusCircle, Flame, Tent, IceCream, Coffee, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface pb-20 md:pb-10 md:pt-20">
      {/* Header Section (Landing Page in Green) */}
      <section className="bg-primary pt-12 pb-8 md:pt-16 md:pb-12 text-on-primary rounded-b-3xl md:rounded-none shadow-md">
        <div className="site-container">
          <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-display tracking-tight">Thalluvandi</h1>
          <button suppressHydrationWarning className="text-xs font-medium bg-primary-container text-on-primary-container px-3 py-1 rounded-full border border-primary-container">
            EN / தமிழ்
          </button>
        </div>

        <h2 className="text-3xl font-display uppercase leading-tight mb-2">
          Find the Right Cart<br />for Your Business
        </h2>
        <p className="text-primary-fixed-dim mb-6 font-tamil">உங்கள் தொழிலுக்கு ஏற்ற வண்டியைத் தேடுங்கள்</p>

        {/* Location Bar */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="text-primary-fixed" size={20} />
            <div>
              <p className="text-[10px] text-primary-fixed-dim font-medium uppercase tracking-wider">Delivering to</p>
              <p className="font-semibold text-sm">Coimbatore, Tamil Nadu</p>
            </div>
          </div>
          <Link href="/explore" suppressHydrationWarning className="text-xs font-bold bg-error text-white px-4 py-2 rounded-lg shadow-sm">
            Change
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            suppressHydrationWarning
            placeholder="Search carts, types, or locations..." 
            className="w-full bg-white text-gray-900 rounded-xl py-3 pl-10 pr-4 shadow-sm outline-none placeholder:text-gray-400"
          />
        </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="site-container mt-8 md:mt-12">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-on-surface">Browse by Type</h3>
          <Link href="/explore" className="text-sm font-semibold text-error flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
          <Link href="/explore" className="bg-white border border-error shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-error hover:border-error transition">
            <Flame size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-error">With Stove</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-ink hover:border-error transition">
            <Tent size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">With Roof</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-ink hover:border-error transition">
            <IceCream size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">Ice Cream</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-ink hover:border-error transition">
            <Coffee size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">Tea / Coffee</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-ink hover:border-error transition">
            <MoreHorizontal size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">More Types</span>
          </Link>
        </div>
      </section>

      {/* Premium Models */}
      <section className="site-container mt-10 md:mt-16">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-on-surface">Premium Models</h3>
          <Link href="/explore" className="text-sm font-semibold text-error flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {[
            { tag: "BESTSELLER", tagColor: "bg-error", title: "Elite Stainless Pro V2", desc: "Dual burners & transport storage shelf", price: "₹24,500" },
            { tag: "NEW", tagColor: "bg-primary", title: "Classic TeaX V1", desc: "With partition & sink", price: "₹16,000" }
          ].map((item, i) => (
            <div key={i} className="min-w-[240px] w-[280px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-center flex flex-col">
              <div className="aspect-[16/10] bg-[#eef5f0] relative shrink-0">
                <span className={`absolute top-2 left-2 text-[9px] font-bold text-white px-2 py-0.5 rounded ${item.tagColor} z-10`}>
                  {item.tag}
                </span>
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Image src="/brand/full-logo-with-background.webp" alt="Premium Cart" fill className="object-cover opacity-50" />
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-bold text-on-surface line-clamp-1">{item.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{item.desc}</p>
                <div className="flex flex-wrap gap-2 justify-between items-end mt-auto pt-4">
                  <div>
                    <span className="font-bold text-primary whitespace-nowrap block text-lg">{item.price}</span>
                    <span className="text-[10px] text-on-surface-variant block">Ex-Showroom</span>
                  </div>
                  <Button suppressHydrationWarning asChild className="bg-error hover:bg-error/90 text-white rounded-full px-4 text-xs shrink-0">
                    <Link href="/book?cart=premium-fast-food-cart">Read More</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Thalluvandi? */}
      <section className="site-container mt-10 md:mt-16">
        <h3 className="text-lg font-bold text-on-surface mb-4">Why Thalluvandi?</h3>
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {[
            { title: "Verified Sellers", desc: "Every seller is personally checked for quality", icon: "✓", color: "text-[#15803d]" },
            { title: "Local Focus", desc: "Connect with sellers in your neighbourhood", icon: <MapPin size={20} />, color: "text-error" },
            { title: "Fair Pricing", desc: "Compare prices from multiple vendors easily", icon: "₹", color: "text-[#15803d]" }
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-[#f0f9f4] rounded-lg flex items-center justify-center text-xl font-bold">
                <span className={item.color}>{item.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-sm">{item.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace (Used Carts) */}
      <section className="site-container mt-10 mb-6 md:mt-16 md:mb-12">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-on-surface">Marketplace</h3>
          <Link href="/explore" className="text-sm font-semibold text-error flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { title: "Standard MS Food Cart (3ft)", price: "₹12,000" },
            { title: "Minimalist Tea Station", price: "₹15,000" }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="aspect-[4/3] bg-gray-100 relative flex items-center justify-center text-gray-400 shrink-0">
                <span className="text-xs font-bold">Image</span>
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-1 mb-2 shrink-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#fef08a] text-[#854d0e] rounded whitespace-nowrap">USED</span>
                </div>
                <p className="text-xs font-bold text-on-surface mb-2 line-clamp-2">{item.title}</p>
                <div className="mt-auto flex flex-col">
                  <div className="flex flex-wrap gap-1 justify-between items-center mt-1">
                    <span className="font-bold text-ink text-sm whitespace-nowrap">{item.price}</span>
                  </div>
                  <Button suppressHydrationWarning asChild className="w-full mt-2 text-xs py-1 h-8 shrink-0 bg-[#16a34a] hover:bg-[#15803d] text-white">
                    <Link href="/marketplace">
                      <span className="flex items-center justify-center gap-1">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
                        WhatsApp
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sell Banner */}
      <section className="site-container mb-8 md:mb-16">
        <div className="bg-tertiary-container border border-tertiary rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              Own a Food Cart?
            </h3>
            <p className="text-sm text-white/80 mb-4">List it in just a quick 2 min and reach local buyers faster!</p>
            <Button asChild className="bg-white hover:bg-gray-100 text-error shadow-md rounded-full font-bold">
              <Link href="/sell">
                Start Selling <ChevronRight size={16} className="ml-1" />
              </Link>
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 text-white">
            <PlusCircle size={120} />
          </div>
        </div>
      </section>

    </main>
  );
}
