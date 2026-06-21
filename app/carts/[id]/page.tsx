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
          {cart.type.map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md uppercase">
              {t}
            </span>
          ))}
          {cart.availableCount >= 1 ? (
             <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md uppercase">AVAILABLE</span>
          ) : (
             <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 rounded-md uppercase">BOOKED</span>
          )}
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

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <p className="text-2xl font-bold text-[#f97316]">₹ {cart.pricePerDay} <span className="text-sm font-normal text-gray-500">/ day</span></p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-500 uppercase font-bold">Deposit</p>
            <p className="font-bold text-gray-900">₹ {cart.depositAmount}</p>
          </div>
        </div>
      </div>

      {/* Specifications / Features */}
      <div className="px-4 py-6 bg-white mt-2 shadow-sm border-y border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Features & Specifications</h3>
        <ul className="space-y-3">
           {cart.featuresEn.map((feature, idx) => (
             <li key={idx} className="flex gap-3 items-start text-sm text-gray-700">
                <CheckCircle size={18} className="text-[#f97316] shrink-0 mt-0.5" />
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
        <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#fff7ed] text-[#f97316] font-bold text-xl rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              N
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Platform</p>
              <p className="font-bold text-gray-900">Namma Thalluvandi</p>
            </div>
          </div>
          <a href="tel:+918838292849" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:text-green-600 transition">
            <Phone size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex justify-center z-50">
        <div className="w-full max-w-md">
          {cart.availableCount >= 1 ? (
            <Link href={`/book?cart=${cart.id}`}>
              <Button size="lg" className="w-full text-lg font-bold h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white">
                Book Now
              </Button>
            </Link>
          ) : (
            <Button size="lg" disabled className="w-full text-lg font-bold h-14 bg-gray-300 text-gray-500">
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
