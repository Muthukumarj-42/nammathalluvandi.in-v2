"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle,
  MessageCircle, 
  Phone, 
  MapPin, 
  Ruler, 
  Flame, 
  ShieldCheck, 
  ShoppingBag,
  Plus
} from "lucide-react";
import { Cart } from "@/lib/carts";
import { CALL_PHONE } from "@/lib/utils";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

interface CartDetailClientProps {
  cart: Cart;
}

export default function CartDetailClient({ cart }: CartDetailClientProps) {
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const router = useRouter();

  // Sync language toggle dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentLang = document.documentElement.dataset.lang === "ta" ? "ta" : "en";
    setLang(currentLang);

    const observer = new MutationObserver(() => {
      const updatedLang = document.documentElement.dataset.lang === "ta" ? "ta" : "en";
      setLang(updatedLang);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang"],
    });

    return () => observer.disconnect();
  }, []);

  // Determine Specs
  const specs = useMemo(() => {
    const nameLower = cart.nameEn.toLowerCase();
    const featuresLower = cart.featuresEn.map(f => f.toLowerCase()).join(" ");

    // Length spec
    let length = "Standard";
    if (nameLower.includes("3ft") || nameLower.includes("3 ft") || featuresLower.includes("3ft") || featuresLower.includes("3 ft")) {
      length = "3 Feet";
    } else if (nameLower.includes("4ft") || nameLower.includes("4 ft") || featuresLower.includes("4ft") || featuresLower.includes("4 ft")) {
      length = "4 Feet";
    } else if (nameLower.includes("5ft") || nameLower.includes("5 ft") || featuresLower.includes("5ft") || featuresLower.includes("5 ft")) {
      length = "5 Feet";
    }

    // Material spec
    let material = "Mild Steel";
    if (nameLower.includes("stainless") || nameLower.includes("steel") || featuresLower.includes("stainless") || featuresLower.includes("steel")) {
      material = "Stainless Steel";
    } else if (nameLower.includes("wood") || featuresLower.includes("wood")) {
      material = "Wood Frame";
    } else if (nameLower.includes("aluminium") || featuresLower.includes("aluminium")) {
      material = "Aluminium";
    }

    // Stove spec
    let stove = "No Stove";
    const typeJoined = cart.type.map(t => t.toLowerCase()).join(" ");
    if (typeJoined.includes("stove") || nameLower.includes("stove") || featuresLower.includes("stove") || featuresLower.includes("burner")) {
      stove = "Built-in Stove";
    }

    return { length, material, stove };
  }, [cart]);

  // Build contact form URL with cart pre-filled
  const contactInquiryUrl = useMemo(() => {
    const slug = encodeURIComponent(cart.nameEn);
    return `/contact?cart=${cart.id}&name=${slug}&ref=inquiry#enquiry-form`;
  }, [cart]);

  return (
    <main className="bg-[#0a0a08] min-h-screen text-[#f6ded3] pb-44 pt-24 md:pt-32 relative">
      <div className="noise-overlay"></div>

      <div className="site-container max-w-7xl mx-auto px-4 md:px-8">
        {/* Dynamic Grid: Left (Images) and Right (Specs & Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery (Sticky on Desktop) */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 self-start space-y-4">
            {/* Desktop View: Main Image + Thumbnails */}
            <div className="hidden lg:block space-y-4">
              <div className="bg-[#251913] border border-[#ffb690]/15 w-full aspect-[4/3] relative flex items-center justify-center p-8 rounded-2xl overflow-hidden">
                {cart.images && cart.images.length > 0 ? (
                  <Image
                    src={cart.images[selectedImageIndex]}
                    alt={cart.nameEn}
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                ) : (
                  <div className="text-[#ffb690] flex flex-col items-center gap-2">
                    <ShoppingBag size={48} className="opacity-50" />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      <Text en="No Image Available" ta="படம் இல்லை" />
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {cart.images && cart.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-1 hide-scrollbar">
                  {cart.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-16 flex-shrink-0 bg-[#251913] border-2 rounded-xl overflow-hidden transition-all ${
                        selectedImageIndex === idx ? "border-[#f97316] scale-[1.02] shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`${cart.nameEn} thumbnail ${idx}`} fill className="object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile View: Horizontal Scroll Photos */}
            <div className="flex lg:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar -mx-4 px-4">
              {cart.images && cart.images.length > 0 ? (
                cart.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-[85vw] aspect-[4/3] snap-center shrink-0 bg-[#251913] border border-[#ffb690]/15 rounded-2xl overflow-hidden"
                  >
                    <Image src={img} alt={`${cart.nameEn} ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))
              ) : (
                <div className="relative w-full aspect-[4/3] bg-[#251913] border border-[#ffb690]/15 rounded-2xl flex flex-col items-center justify-center p-8">
                  <ShoppingBag size={48} className="opacity-50 text-[#ffb690]" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#ffb690]">
                    <Text en="No Image Available" ta="படம் இல்லை" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8">
            
            {/* Title Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  {cart.type.map((t, idx) => (
                    <span
                      key={idx}
                      className="border border-[#ffb690]/25 bg-[#251913] px-2.5 py-1 text-[9px] font-bold tracking-widest text-[#ffb690] uppercase rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="bg-[#ffb690]/10 text-[#ffb690] border border-[#ffb690]/20 px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded-lg">
                  <Text en={cart.available ? "AVAILABLE" : "RENTED"} ta={cart.available ? "வண்டி உண்டு" : "வாடகையில் உள்ளது"} />
                </span>
              </div>

              <h2 className="font-display text-4xl md:text-5xl uppercase tracking-wider leading-tight text-[#fffdf7]">
                <Text en={cart.nameEn} ta={cart.nameTa} />
              </h2>

              <div className="flex items-center gap-2 text-xs text-[#e0c0b1]">
                <MapPin size={14} className="text-[#ffb690] shrink-0" />
                <span>{(cart.city && cart.city.length > 0) ? cart.city.join(", ") : "Coimbatore"}</span>
                <span className="w-px h-3.5 bg-[#ffb690]/20"></span>
                <span className="text-[#ffb690] font-bold uppercase tracking-widest text-[10px]">
                  <Text en="Textile Heartland" ta="கொங்கு மண்டலம்" />
                </span>
              </div>
            </div>

            {/* Price & Deposit Panel */}
            <div className="bg-[#160c06] border border-[#ffb690]/15 p-6 space-y-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center border-b border-[#ffb690]/10 pb-4">
                <div>
                  <span className="font-display text-4xl text-[#ffca45] tracking-wide">₹{cart.pricePerDay}</span>
                  <span className="font-display text-lg text-[#ffca45] opacity-80"> / DAY</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#e0c0b1] uppercase tracking-wider block mb-0.5">
                    <Text en="Refundable Deposit" ta="முன்பதிவு தொகை" />
                  </span>
                  <span className="font-sans text-base font-bold text-ink">₹{cart.depositAmount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#e0c0b1]/80">
                <ShieldCheck size={16} className="text-[#ffb690] shrink-0" />
                <span>
                  <Text en="100% Refundable deposit returned on cart handover." ta="வண்டி ஒப்படைக்கப்படும் போது முன்பணம் முழுமையாகத் திருப்பித் தரப்படும்." />
                </span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 border-y border-[#ffb690]/15 py-6">
              <div className="flex flex-col items-center text-center px-2">
                <Ruler className="w-6 h-6 text-[#ffb690] mb-2" />
                <span className="text-xs font-bold text-[#fffdf7] uppercase tracking-wider mb-1">
                  <Text 
                    en={specs.length} 
                    ta={
                      specs.length === "3 Feet" ? "3 அடி" : 
                      specs.length === "4 Feet" ? "4 அடி" : 
                      specs.length === "5 Feet" ? "5 அடி" : 
                      "சாதாரண அளவு"
                    } 
                  />
                </span>
                <span className="text-[9px] text-[#e0c0b1]/70 uppercase tracking-widest">
                  <Text en="Length" ta="நீளம்" />
                </span>
              </div>

              <div className="flex flex-col items-center text-center px-2 border-x border-[#ffb690]/10">
                <ShieldCheck className="w-6 h-6 text-[#ffb690] mb-2" />
                <span className="text-xs font-bold text-[#fffdf7] uppercase tracking-wider mb-1">
                  <Text 
                    en={specs.material} 
                    ta={
                      specs.material === "Stainless Steel" ? "துருப்பிடிக்காத எஃகு" : 
                      specs.material === "Mild Steel" ? "இரும்பு (Mild Steel)" : 
                      specs.material === "Wood Frame" ? "மரச்சட்டம்" : 
                      specs.material === "Aluminium" ? "அலுமினியம்" : 
                      specs.material
                    } 
                  />
                </span>
                <span className="text-[9px] text-[#e0c0b1]/70 uppercase tracking-widest">
                  <Text en="Structure" ta="வடிவமைப்பு" />
                </span>
              </div>

              <div className="flex flex-col items-center text-center px-2">
                <Flame className="w-6 h-6 text-[#ffb690] mb-2" />
                <span className="text-xs font-bold text-[#fffdf7] uppercase tracking-wider mb-1">
                  <Text 
                    en={specs.stove} 
                    ta={
                      specs.stove === "Built-in Stove" ? "அடுப்புடன்" : 
                      "அடுப்பு இல்லை"
                    } 
                  />
                </span>
                <span className="text-[9px] text-[#e0c0b1]/70 uppercase tracking-widest">
                  <Text en="Stove" ta="அடுப்பு" />
                </span>
              </div>
            </div>

            {/* About / Features */}
            <div className="space-y-4 pt-2">
              <h3 className="font-display text-2xl uppercase tracking-wider text-[#fffdf7] border-b border-[#ffb690]/10 pb-2">
                <Text en="Features & Specifications" ta="அம்சங்கள் & விவரங்கள்" />
              </h3>

              {/* Description */}
              {(cart.descriptionEn || cart.descriptionTa) && (
                <div className="text-sm leading-relaxed text-[#e0c0b1] font-sans space-y-1">
                  <p className="en">{cart.descriptionEn}</p>
                  <p className="ta tamil-text">{cart.descriptionTa}</p>
                </div>
              )}

              {/* Specs bullet points */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {cart.featuresEn.map((feat, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-[#e0c0b1]">
                    <CheckCircle size={14} className="text-[#ffb690] shrink-0 mt-0.5" />
                    <div>
                      <span className="en">{feat}</span>
                      {cart.featuresTa[idx] && <span className="ta tamil-text">{cart.featuresTa[idx]}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inquiry & Direct Action Row */}
            <div className="pt-4 border-t border-[#ffb690]/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={contactInquiryUrl}
                  scroll={false}
                  className="bg-[#251913] hover:bg-[#ffb690]/5 border border-[#ffb690]/25 text-[#ffb690] hover:text-[#fffdf7] py-3.5 font-display text-lg tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2 rounded-xl"
                >
                  <MessageCircle size={18} />
                  <Text en="INQUIRY" ta="விசாரணை" />
                </Link>

                <a
                  href={`tel:${CALL_PHONE}`}
                  className="bg-[#251913] hover:bg-[#ffb690]/5 border border-[#ffb690]/25 text-[#ffb690] hover:text-[#fffdf7] py-3.5 font-display text-lg tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2 rounded-xl"
                >
                  <Phone size={18} />
                  <Text en="CALL OFFICE" ta="அழைக்கவும்" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky/Fixed Bottom Action Bar */}
      <div className="fixed left-0 right-0 z-40 bg-transparent py-4 bottom-[calc(60px+env(safe-area-inset-bottom))] md:bottom-4 pointer-events-none">
        <div className="site-container max-w-7xl mx-auto px-4 md:px-8 flex justify-center">
          <Link
            href={`/book?cart=${cart.id}`}
            className="w-full max-w-md h-12 bg-[#f97316] hover:bg-[#e2640e] text-[#0a0a08] font-bold font-display text-xs md:text-sm tracking-widest uppercase active:scale-95 transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg pointer-events-auto"
          >
            <Plus size={18} className="stroke-[3]" />
            <Text en="BOOK NOW" ta="இப்போதே முன்பதிவு செய்க" />
          </Link>
        </div>
      </div>
    </main>
  );
}
