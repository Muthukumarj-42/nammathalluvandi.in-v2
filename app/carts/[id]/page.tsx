import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CheckCircle, Flame, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/carts";
import Image from "next/image";

export default async function CartDetail({ params }: { params: Promise<{ id: string }> }) {
  // Access params.id correctly in Next 15 by awaiting if needed or direct (Next 15 recommends awaiting params, but server component can receive it as promise or direct depending on setup. Let's assume it's direct or promise)
  // Actually Next.js 15 requires `await params` for dynamic routes
  const resolvedParams = await params;
  const cart = await getCart(resolvedParams.id);
  
  if (!cart) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Top Image & Back Button */}
      <div className="relative h-64 bg-gray-300 flex items-center justify-center">
        <Link href="/explore" className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm hover:bg-white transition">
          <ArrowLeft size={20} className="text-gray-900" />
        </Link>
        {cart.images && cart.images.length > 0 ? (
          <Image 
            src={cart.images[0]} 
            alt={cart.nameEn} 
            fill 
            className="object-cover" 
            priority
          />
        ) : (
          <span className="text-gray-500 font-bold text-xl">No Image</span>
        )}
      </div>

      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-4 pt-6 pb-4 shadow-sm border-b border-gray-100">
        <div className="flex gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-1 bg-[#fef08a] text-[#854d0e] rounded-md uppercase">USED</span>
          <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-800 rounded-md uppercase">WITH STOVE</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
          {cart.nameEn}
        </h1>
        <p className="text-md text-gray-600 font-tamil mb-2">
          {cart.nameTa}
        </p>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin size={16} /> {(cart.city && cart.city.length > 0) ? cart.city.join(", ") : "Coimbatore"}
        </div>

        <div className="flex justify-between items-center bg-surface p-3 rounded-xl">
          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold text-primary">₹ 12,000 <span className="text-sm font-normal text-on-surface-variant">Ex-Showroom</span></p>
          </div>
          <div className="flex items-center text-[#15803d] font-bold text-xs gap-1">
            <CheckCircle size={14} /> Verified
          </div>
        </div>
      </div>

      {/* Specifications / Features */}
      <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Features & Specifications</h3>
        <ul className="space-y-3">
           {cart.featuresEn.map((feature, idx) => (
             <li key={idx} className="flex gap-3 items-start text-sm text-gray-700">
                <CheckCircle size={18} className="text-[#15803d] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{feature}</p>
                  {cart.featuresTa[idx] && <p className="text-xs text-gray-500 mt-0.5 font-tamil">{cart.featuresTa[idx]}</p>}
                </div>
             </li>
           ))}
        </ul>
      </div>

      {/* About this Cart */}
      {(cart.descriptionEn || cart.descriptionTa) && (
        <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About this Cart</h3>
          {cart.descriptionEn && <p className="text-sm text-gray-600 leading-relaxed mb-2">{cart.descriptionEn}</p>}
          {cart.descriptionTa && <p className="text-sm text-gray-600 leading-relaxed font-tamil">{cart.descriptionTa}</p>}
        </div>
      )}

      {/* Owner Details / Support */}
      <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100 mb-8">
        <div className="flex items-center justify-between rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white font-bold text-xl rounded-full flex items-center justify-center shadow-sm">
              R
            </div>
            <div>
              <p className="font-bold text-gray-900">Rajaesh Kumar</p>
              <p className="text-xs text-gray-500 mb-0.5">Listed 3 days ago • 4 listings</p>
            </div>
          </div>
          <div className="flex items-center text-[#15803d] font-bold text-xs gap-1">
            <CheckCircle size={14} /> Verified
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex justify-center gap-3 z-50">
        <div className="w-full max-w-md flex gap-3">
          <Button size="lg" className="flex-1 text-lg font-bold h-14 bg-[#15803d] hover:bg-[#16a34a] text-white">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
            WhatsApp Seller
          </Button>
          <Button size="lg" className="w-16 h-14 bg-error hover:bg-error/90 text-white shrink-0">
            <Phone size={24} />
          </Button>
        </div>
      </div>
    </main>
  );
}
