import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, PlusCircle, Flame, Tent, IceCream, Coffee, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface pb-20">
      {/* Header Section (Landing Page in Green) */}
      <section className="bg-primary px-4 pt-12 pb-8 text-on-primary rounded-b-3xl shadow-md">
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
              <p className="text-[10px] text-primary-fixed-dim font-medium uppercase tracking-wider">Current Location</p>
              <p className="font-semibold text-sm">Ondipudur, Coimbatore</p>
            </div>
          </div>
          <Link href="/explore" suppressHydrationWarning className="text-xs font-bold bg-surface text-primary px-4 py-2 rounded-lg shadow-sm">
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
      </section>

      {/* Browse by Type */}
      <section className="px-4 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-on-surface">Browse by Type</h3>
          <Link href="/explore" className="text-sm font-semibold text-primary flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-primary hover:border-primary transition">
            <Flame size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">With Stove</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-primary hover:border-primary transition">
            <Tent size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">With Roof</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-primary hover:border-primary transition">
            <IceCream size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">Ice Cream</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-primary hover:border-primary transition">
            <Coffee size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">Tea Stall</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square text-primary hover:border-primary transition">
            <MoreHorizontal size={32} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-center text-gray-700">More Types</span>
          </Link>
        </div>
      </section>

      {/* Premium Models */}
      <section className="px-4 mt-10">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-on-surface">Premium Models</h3>
          <Link href="/explore" className="text-sm font-semibold text-primary flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {[1, 2].map((i) => (
            <div key={i} className="min-w-[240px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-center">
              <div className="h-32 bg-gray-200 relative">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Image src="/brand/full-logo-with-background.webp" alt="Premium Cart" fill className="object-cover opacity-50" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-on-surface">Elite Pro v2</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-primary">₹ 24,500</span>
                  <Button suppressHydrationWarning asChild className="bg-primary text-on-primary rounded-full px-4 text-xs">
                    <Link href="/book?cart=premium-fast-food-cart">Rent Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Thalluvandi? */}
      <section className="px-4 mt-10">
        <h3 className="text-lg font-bold text-on-surface mb-4">Why Thalluvandi?</h3>
        <div className="space-y-3">
          {[
            { title: "Distance-based Routing", desc: "Find carts near you easily" },
            { title: "Verified Owners", desc: "100% verified listings" },
            { title: "No Middlemen", desc: "Direct WhatsApp contact" }
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-12 bg-secondary-container rounded-lg flex items-center justify-center text-on-secondary-container font-bold">Img</div>
              <div>
                <h4 className="font-bold text-on-surface text-sm">{item.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace (Used Carts) */}
      <section className="px-4 mt-10 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-on-surface">Marketplace</h3>
          <Link href="/explore" className="text-sm font-semibold text-primary flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-24 bg-gray-200 relative flex items-center justify-center text-gray-400">
                <span className="text-xs font-bold">Image</span>
              </div>
              <div className="p-3">
                <div className="flex gap-1 mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-surface-container text-on-surface-variant rounded">USED</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary-fixed text-on-primary-fixed rounded">GOOD</span>
                </div>
                <p className="text-xs font-bold text-on-surface mb-2 truncate">Standard MS Cart</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-primary text-sm">₹ 12,000</span>
                </div>
                <Button suppressHydrationWarning asChild variant="outline" className="w-full mt-2 text-xs py-1 h-auto">
                  <Link href="/marketplace">View</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sell Banner */}
      <section className="px-4 mb-8">
        <div className="bg-tertiary-container border border-tertiary rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-on-tertiary-container mb-1 flex items-center gap-2">
              Own a Food Cart?
            </h3>
            <p className="text-sm text-on-tertiary-container/80 mb-4">List your cart and reach 5000+ active buyers.</p>
            <Button asChild className="bg-tertiary hover:bg-tertiary/90 text-on-tertiary shadow-md rounded-full">
              <Link href="/sell">
                Start Selling
              </Link>
            </Button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 text-on-tertiary-container">
            <PlusCircle size={120} />
          </div>
        </div>
      </section>

    </main>
  );
}
