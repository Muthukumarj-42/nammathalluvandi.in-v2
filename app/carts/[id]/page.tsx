import Link from "next/link";
import { ArrowLeft, MapPin, CheckCircle, Ruler, Scale, Flame, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartDetail() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Top Image & Back Button */}
      <div className="relative h-64 bg-gray-300 flex items-center justify-center">
        <Link href="/search" className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm">
          <ArrowLeft size={20} className="text-gray-900" />
        </Link>
        <span className="text-gray-500 font-bold text-xl">Image Placeholder</span>
      </div>

      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-4 pt-6 pb-4 shadow-sm border-b border-gray-100">
        <div className="flex gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">USED</span>
          <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">VERY GOOD</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
          Standard MS Food Cart (3ft)
        </h1>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin size={16} /> Ondipudur, Coimbatore
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-green-700">₹ 12,000 <span className="text-sm font-normal text-gray-500">/ month</span></p>
          </div>
          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-100">
            <CheckCircle size={14} /> Verified
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Ruler className="text-gray-400 mb-2" size={24} />
            <span className="text-sm font-bold text-gray-900">3 ft</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Size</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Scale className="text-gray-400 mb-2" size={24} />
            <span className="text-sm font-bold text-gray-900">45 kg</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Weight</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Flame className="text-gray-400 mb-2" size={24} />
            <span className="text-sm font-bold text-gray-900">2 Burner</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Stove</span>
          </div>
        </div>
      </div>

      {/* About this Cart */}
      <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">About this Cart</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Well maintained MS food cart used for 6 months. Freshly painted and comes with a built-in 2-burner commercial stove setup. The wheels are heavy-duty and roll smoothly. Perfect for fast food or tea stall setup. Includes a small storage compartment with lock.
        </p>
      </div>

      {/* Owner Details */}
      <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100 mb-8">
        <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 text-green-700 font-bold text-xl rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              N
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Owner</p>
              <p className="font-bold text-gray-900">Nagaraj</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm">
            <Phone size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex justify-center z-50">
        <div className="w-full max-w-md">
          <Button size="lg" className="w-full text-lg font-bold h-14 bg-green-700 hover:bg-green-800">
            PAY NOW
          </Button>
        </div>
      </div>
    </main>
  );
}
