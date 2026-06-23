import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronRight, PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconStove, IconTent, IconIceCream, IconCoffee, IconRickshaw, IconCheckCircle, IconMapPinRed, IconRupee, IconWhatsApp, IconSearchStove } from "@/components/ui/icons";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white pb-20 md:pb-10">
      {/* Header Section */}
      <section className="bg-[#0f5a34] pt-8 pb-6 px-4 rounded-b-[2rem] text-white">
        <div className="site-container max-w-md mx-auto">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold tracking-tight">Thallivandi</h1>
            <button suppressHydrationWarning className="text-[10px] font-bold bg-[#e8f5e9] text-[#16a34a] px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[8px]">EN</span>
              EN / தமிழ்
            </button>
          </div>

          <p className="text-[10px] font-bold tracking-widest text-white/80 uppercase mb-2 flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/></svg>
            FOOD CART MARKETPLACE
          </p>
          <h2 className="text-[28px] font-bold leading-[1.1] mb-3">
            Find the Right Cart<br />for Your Business
          </h2>
          <p className="text-sm text-white/80 mb-6">
            A wide range of food carts, premium models,<br />and verified sellers — all in one place.
          </p>

          {/* Location Bar */}
          <div className="bg-[#1b6b40] rounded-xl p-3 flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-1.5 rounded-full">
                <IconMapPinRed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-white/70">Delivering to</p>
                <p className="font-semibold text-sm">Coimbatore, Tamil Nadu</p>
              </div>
            </div>
            <Link href="/explore" suppressHydrationWarning className="text-xs font-bold bg-[#dc2626] hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm">
              Change
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              suppressHydrationWarning
              placeholder="Search carts, type, or location..." 
              className="w-full bg-white text-gray-900 rounded-xl py-3 pl-10 pr-4 shadow-sm outline-none placeholder:text-gray-400 text-sm"
            />
          </div>
        </div>
      </section>

      <div className="site-container max-w-md mx-auto px-4 mt-6">
        {/* Browse by Type */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">Browse by Type</h3>
          <Link href="/explore" className="text-xs font-bold text-[#dc2626] flex items-center">
            See all <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Link href="/explore" className="bg-white border-2 border-[#dc2626] shadow-sm rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3]">
            <IconSearchStove className="w-7 h-7 text-gray-800" />
            <span className="text-[10px] font-bold text-[#dc2626]">With Stove</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3]">
            <IconTent className="w-7 h-7" />
            <span className="text-[10px] font-semibold text-gray-700">With Roof</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3]">
            <IconIceCream className="w-7 h-7" />
            <span className="text-[10px] font-semibold text-gray-700">Ice Cream</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3]">
            <IconCoffee className="w-7 h-7" />
            <span className="text-[10px] font-semibold text-gray-700">Tea / Coffee</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3]">
            <IconRickshaw className="w-7 h-7" />
            <span className="text-[10px] font-semibold text-gray-700">E-Rickshaw</span>
          </Link>
          <Link href="/explore" className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3]">
            <MoreHorizontal className="w-7 h-7 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-700">More Types</span>
          </Link>
        </div>

        {/* Premium Models */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900">Premium Models</h3>
            <Link href="/explore" className="text-xs font-bold text-[#dc2626] flex items-center">
              See all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x hide-scrollbar pb-2">
            {[
              { tag: "BESTSELLER", tagColor: "bg-[#dc2626]", title: "Elite Stainless Pro V2", desc: "Dual burners & transport storage shelf", price: "₹24,500" },
              { tag: "NEW", tagColor: "bg-[#16a34a]", title: "Classic TeaX V1", desc: "With partition & sink", price: "₹16,000" }
            ].map((item, i) => (
              <div key={i} className="min-w-[220px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden snap-center flex flex-col">
                <div className="aspect-[16/10] bg-[#eef5f0] relative shrink-0 p-4 flex items-center justify-center">
                  <span className={`absolute top-2 left-2 text-[8px] font-bold text-white px-1.5 py-0.5 rounded ${item.tagColor} z-10`}>
                    {item.tag}
                  </span>
                  <Image src="/brand/full-logo-with-background.webp" alt="Premium Cart" fill className="object-cover opacity-20" />
                  {/* Mock cart illustration */}
                  <svg viewBox="0 0 100 80" className="w-20 h-20 text-gray-400 z-10" fill="currentColor">
                    <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
                  </svg>
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.desc}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <span className="font-bold text-[#16a34a] block">{item.price}</span>
                      <span className="text-[8px] text-gray-500 block">Ex-Showroom</span>
                    </div>
                    <Button suppressHydrationWarning asChild className="bg-[#dc2626] hover:bg-red-700 text-white rounded-lg px-3 py-1 h-auto text-[10px] font-bold">
                      <Link href="/book">Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Thallivandi? */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">Why Thallivandi?</h3>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#dcfce7] rounded-md flex items-center justify-center shrink-0 mt-0.5">
                <IconCheckCircle className="w-4 h-4 text-[#16a34a]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">Verified Sellers</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Every seller is personally checked for quality</p>
              </div>
            </div>
            <div className="h-px bg-gray-100 w-full" />
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#fee2e2] rounded-md flex items-center justify-center shrink-0 mt-0.5">
                <IconMapPinRed className="w-4 h-4 text-[#dc2626]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">Local Focus</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Connect with sellers in your neighbourhood</p>
              </div>
            </div>
            <div className="h-px bg-gray-100 w-full" />
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#dcfce7] rounded-md flex items-center justify-center shrink-0 mt-0.5">
                <IconRupee className="w-4 h-4 text-[#16a34a]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">Fair Pricing</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Compare prices from multiple vendors easily</p>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900">Marketplace</h3>
            <Link href="/explore" className="text-xs font-bold text-[#dc2626] flex items-center">
              See all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Standard MS Food Cart (3ft)", price: "₹12,000" },
              { title: "Minimalist Tea Station", price: "₹15,000" }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-gray-100 relative shrink-0 p-2">
                  <span className="absolute top-2 left-2 text-[8px] font-bold bg-[#fef08a] text-[#854d0e] px-1.5 py-0.5 rounded z-10">
                    USED
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image src="/brand/full-logo-with-background.webp" alt="Cart" fill className="object-cover opacity-20" />
                  </div>
                </div>
                <div className="p-2 flex flex-col flex-grow">
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-2 h-8">{item.title}</h4>
                  <span className="font-bold text-[#111827] text-sm mt-1 mb-2">{item.price}</span>
                  <Button suppressHydrationWarning asChild className="w-full h-8 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-[10px] font-bold">
                    <Link href="/cart/1">
                      <IconWhatsApp className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sell Banner */}
        <div className="mt-8 mb-6">
          <div className="bg-[#dc2626] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-white/90 mb-2">
                <IconStove className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Own a Food Cart?</span>
              </div>
              <p className="text-xs text-white/90 mb-4 max-w-[200px] leading-tight">
                List it in just a quick 2 min and reach local buyers faster!
              </p>
              <Button asChild className="bg-white hover:bg-gray-100 text-[#dc2626] rounded-full h-8 px-4 text-xs font-bold inline-flex w-auto">
                <Link href="/sell">
                  Start Selling <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
            {/* Watermark icon on the right */}
            <IconStove className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
          </div>
        </div>
      </div>
    </main>
  );
}
