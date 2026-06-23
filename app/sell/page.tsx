import Link from "next/link";
import { ChevronDown, Check, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconMapPinRed, IconStove } from "@/components/ui/icons";

export default function SellPage() {
  return (
    <main className="min-h-screen bg-white pb-24 md:pb-20">
      {/* Header Banner */}
      <section className="bg-[#dc2626] text-white pt-8 pb-10 px-4">
        <div className="site-container max-w-md mx-auto">
          <div className="flex items-center gap-1.5 mb-3 opacity-90">
            <IconStove className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">For Cart Owners</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            List Your Cart.<br />Reach More Buyers.
          </h1>
          <p className="text-xs text-white/90 leading-relaxed">
            Quick listing • Local reach • Genuine inquiries •<br />Higher visibility
          </p>
        </div>
      </section>

      <div className="site-container max-w-md mx-auto px-4">
        {/* Stats Row */}
        <div className="flex justify-between items-center py-5 border-b border-gray-100">
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="text-[#dc2626] font-bold text-sm">5,000+</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Active Buyers</p>
          </div>
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="text-[#dc2626] font-bold text-sm">Free</p>
            <p className="text-[10px] text-gray-500 mt-0.5">To List</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[#dc2626] font-bold text-sm">2 min</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Setup Time</p>
          </div>
        </div>

        {/* Form Title */}
        <div className="pt-6 pb-4">
          <h2 className="text-sm font-bold text-gray-900">Quick Listing Form</h2>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Cart Type */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cart Type</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 shadow-sm text-sm outline-none focus:border-[#dc2626]">
                <option value="" disabled selected>Select cart type...</option>
                <option value="ms">Standard MS Cart</option>
                <option value="ss">Stainless Steel Cart</option>
                <option value="erickshaw">E-Rickshaw Cart</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Condition</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 text-gray-900 rounded-xl py-3 px-4 shadow-sm text-sm outline-none focus:border-[#dc2626]">
                <option value="very_good" selected>Used - Very Good</option>
                <option value="good">Used - Good</option>
                <option value="fair">Used - Fair</option>
                <option value="new">Brand New</option>
              </select>
              <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16a34a] w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Asking Price */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Asking Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">₹</span>
              <input 
                type="number" 
                defaultValue="12000"
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 pl-8 pr-10 shadow-sm text-sm outline-none focus:border-[#dc2626]"
              />
              <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16a34a] w-5 h-5" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Your Location</label>
            <button className="w-full bg-white border border-gray-200 text-gray-500 rounded-xl py-3 px-4 shadow-sm text-sm outline-none focus:border-[#dc2626] flex items-center gap-2">
              <IconMapPinRed className="w-4 h-4" />
              Tap to set location
            </button>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cart Photos</label>
            <div className="w-full border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition">
              <div className="w-12 h-12 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#dc2626] mb-1">Tap to upload photos</p>
              <p className="text-[10px] text-gray-500">Add 1 to 5 photos - JPG or PNG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-30">
        <div className="site-container max-w-md mx-auto px-0">
          <Button className="w-full bg-[#dc2626] hover:bg-red-700 text-white rounded-xl h-12 font-bold text-sm shadow-sm flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Submit My Listing
          </Button>
        </div>
      </div>
    </main>
  );
}
