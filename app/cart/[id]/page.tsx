import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconMapPinRed, IconVerified, IconRuler, IconScale, IconFlameRed, IconWhatsApp, IconPhone } from "@/components/ui/icons";

export default function CartDetailPage() {
  return (
    <main className="min-h-screen bg-white pb-24 md:pb-20 relative">
      {/* Header */}
      <header className="sticky top-0 bg-white z-20 flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/explore" className="text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-sm font-bold text-gray-900">Standard MS Food Cart (3ft)</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <button><Share2 className="w-5 h-5" /></button>
          <button><MoreVertical className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="site-container max-w-md mx-auto px-0">
        {/* Image Slider Mock */}
        <div className="bg-[#eef5f0] w-full aspect-[4/3] relative flex items-center justify-center p-8">
          {/* Main Mock Image */}
          <svg viewBox="0 0 100 80" className="w-48 h-48 text-[#dc2626] drop-shadow-lg" fill="currentColor">
            <path d="M20 20 h60 v40 h-60 z M30 60 v10 M70 60 v10 M25 70 h50 M35 70 v5 M65 70 v5"/>
            <circle cx="35" cy="75" r="5" fill="#1f2937"/>
            <circle cx="65" cy="75" r="5" fill="#1f2937"/>
            <path d="M80 30 h10 M85 30 v-10 h-10" stroke="#dc2626" strokeWidth="2" fill="none"/>
          </svg>
          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
          </div>
        </div>

        <div className="px-4 py-5">
          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <span className="text-[9px] font-bold bg-[#fef08a] text-[#854d0e] px-2 py-0.5 rounded uppercase tracking-wider">USED</span>
            <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase tracking-wider">WITH STOVE</span>
          </div>

          {/* Title & Location */}
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">Standard MS Food Cart (3ft)</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <IconMapPinRed className="w-3.5 h-3.5" />
            <span>R.S. Puram, Coimbatore</span>
            <span className="w-px h-3 bg-gray-300 mx-1"></span>
            <span>2.4 km away</span>
          </div>

          {/* Price & Verified */}
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#16a34a]">₹12,000</span>
              <span className="text-[10px] text-gray-500 font-medium">Ex-Showroom</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a]">
              <IconVerified className="w-3.5 h-3.5" />
              Verified
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 w-full mb-6"></div>

          {/* Specs */}
          <div className="flex justify-between px-2 mb-6">
            <div className="flex flex-col items-center gap-2">
              <IconRuler className="w-6 h-6" />
              <div className="text-center">
                <p className="text-xs font-bold text-gray-900">3 ft</p>
                <p className="text-[10px] text-gray-500">Length</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconScale className="w-6 h-6 text-gray-500" />
              <div className="text-center">
                <p className="text-xs font-bold text-gray-900">45 kg</p>
                <p className="text-[10px] text-gray-500">Weight</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconFlameRed className="w-6 h-6" />
              <div className="text-center">
                <p className="text-xs font-bold text-gray-900">2 Burner</p>
                <p className="text-[10px] text-gray-500">Stove</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 w-full mb-6"></div>

          {/* About */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">About this Cart</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Heavy-duty mild steel construction with powder-coated finish. Ideal for street vendors and small café setups. Mobile for easy relocation. With gas stove, durable top platform, and storage box.
            </p>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0f5a34] text-white rounded-full flex items-center justify-center font-bold text-lg">
                R
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Rajaesh Kumar</h4>
                <p className="text-[10px] text-gray-500">Listed 3 days ago • 4 listings</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a]">
              <IconVerified className="w-3.5 h-3.5" />
              Verified
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-30">
        <div className="site-container max-w-md mx-auto flex gap-3 px-0">
          <Button className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl h-12 font-bold text-sm shadow-sm">
            <IconWhatsApp className="w-5 h-5 mr-2" />
            WhatsApp Seller
          </Button>
          <Button className="w-12 h-12 bg-[#dc2626] hover:bg-red-700 text-white rounded-xl shrink-0 p-0 flex items-center justify-center shadow-sm">
            <IconPhone className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}
