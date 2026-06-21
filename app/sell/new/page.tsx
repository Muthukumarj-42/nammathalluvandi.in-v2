"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickListingForm() {
  return (
    <main className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-surface-container-lowest px-4 py-4 sticky top-0 z-10 shadow-sm border-b border-outline-variant flex items-center gap-3">
        <Link href="/sell">
          <ArrowLeft className="text-on-surface" size={24} />
        </Link>
        <h1 className="text-xl font-bold text-on-surface">Quick Listing Form</h1>
      </div>

      <div className="p-4 space-y-5">
        
        {/* Cart Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Cart Type</label>
          <select className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 outline-none">
            <option>Select Cart Type</option>
            <option>Standard MS Cart</option>
            <option>Premium Cart with Roof</option>
            <option>Tea Stall Cart</option>
            <option>Ice Cream Cart</option>
          </select>
        </div>

        {/* Condition */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Condition</label>
          <select className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 outline-none">
            <option>Used - Very Good</option>
            <option>Used - Good</option>
            <option>Used - Fair</option>
            <option>New / Custom Built</option>
          </select>
        </div>

        {/* Asking Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Asking Price (₹)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
              ₹
            </div>
            <input 
              type="number" 
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pl-8 outline-none" 
              placeholder="12,000" 
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Your Location</label>
          <button className="w-full flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-sm rounded-lg focus:ring-primary focus:border-primary p-3 outline-none hover:bg-surface-container transition">
            <MapPin size={18} className="text-primary" />
            <span className="font-semibold">Tap to set location</span>
          </button>
        </div>

        {/* Photos */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Cart Photos</label>
          <div className="border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container transition">
            <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mb-2">
              <Camera size={24} />
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">Upload Images</p>
            <p className="text-xs text-on-surface-variant">Add 2-5 photos from different angles</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 pb-8">
          <Button size="lg" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-on-primary rounded-full shadow-md">
            Submit My Listing
          </Button>
        </div>

      </div>
    </main>
  );
}
