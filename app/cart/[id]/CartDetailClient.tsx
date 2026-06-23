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
import { useCartStore } from "@/lib/store";
import { Cart } from "@/lib/carts";
import { WA_NUMBER, buildWAUrl } from "@/config/whatsapp";
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
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  const addItem = useCartStore((state) => state.addItem);

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

  const handleAddToCart = () => {
    addItem({
      id: cart.id,
      nameEn: cart.nameEn,
      nameTa: cart.nameTa,
      pricePerDay: cart.pricePerDay,
      depositAmount: cart.depositAmount,
      image: cart.images && cart.images.length > 0 ? cart.images[0] : "/placeholder-cart.png",
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      router.push("/cart");
    }, 800);
  };

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

  // Compile Direct Inquiry WhatsApp Message
  const waInquiryUrl = useMemo(() => {
    const cartName = lang === "ta" ? cart.nameTa : cart.nameEn;
    const message = `வணக்கம் தள்ளுவண்டி குழுவினரே,

நான் இந்த வண்டியை வாடகைக்கு எடுக்க விரும்புகிறேன்:
வண்டி பெயர்: ${cartName}
தினசரி வாடகை: ₹${cart.pricePerDay}
முன்பதிவு தொகை: ₹${cart.depositAmount}

வண்டி விவரங்கள் மற்றும் இருப்பு பற்றி அறிய விரும்புகிறேன்.`;
    return buildWAUrl(WA_NUMBER, message);
  }, [cart, lang]);

  return (
    <main className="bg-[#0a0a08] min-h-screen text-[#f6ded3] pb-24 pt-20">
      {/* Sticky Header */}
      <header className="sticky top-20 bg-[#0a0a08]/90 backdrop-blur-md z-40 border-b border-[#ffb690]/10 py-4">
        <div className="site-container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/explore" className="text-[#ffb690] hover:text-[#f6ded3] transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-display text-2xl uppercase tracking-wider text-ink truncate max-w-xs md:max-w-md">
              <Text en={cart.nameEn} ta={cart.nameTa} />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#ffb690]/10 text-[#ffb690] border border-[#ffb690]/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              <Text en={cart.available ? "AVAILABLE" : "RENTED"} ta={cart.available ? "வண்டி உண்டு" : "வாடகையில் உள்ளது"} />
            </span>
          </div>
        </div>
      </header>

      <div className="site-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#251913] border border-[#ffb690]/15 w-full aspect-[4/3] relative flex items-center justify-center p-8">
              {cart.images && cart.images.length > 0 ? (
                <Image
                  src={cart.images[selectedImageIndex]}
                  alt={cart.nameEn}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="text-[#ffb690] flex flex-col items-center gap-2">
                  <ShoppingBag size={48} className="opacity-50" />
                  <span className="text-sm font-bold uppercase tracking-wider">No Image Available</span>
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
                    className={`relative w-20 h-16 flex-shrink-0 bg-[#251913] border-2 transition-all ${
                      selectedImageIndex === idx ? "border-[#f97316]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${cart.nameEn} thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-6 space-y-8">
            {/* Title Block */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {cart.type.map((t, idx) => (
                  <span
                    key={idx}
                    className="border border-[#ffb690]/20 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#ffb690] uppercase"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h2 className="font-display text-4xl md:text-5xl uppercase tracking-wide leading-none text-ink">
                <Text en={cart.nameEn} ta={cart.nameTa} />
              </h2>

              <div className="flex items-center gap-2 text-xs text-[#e0c0b1]">
                <MapPin size={14} className="text-[#ffb690]" />
                <span>{(cart.city && cart.city.length > 0) ? cart.city.join(", ") : "Coimbatore"}</span>
                <span className="w-px h-3 bg-[#ffb690]/20"></span>
                <span className="text-[#ffb690] font-bold uppercase tracking-widest">
                  <Text en="Textile Heartland" ta="கொங்கு மண்டலம்" />
                </span>
              </div>
            </div>

            {/* Price & Deposit Panel */}
            <div className="bg-[#160c06] border border-[#ffb690]/15 p-6 space-y-4">
              <div className="flex justify-between items-baseline border-b border-[#ffb690]/10 pb-4">
                <div>
                  <span className="font-display text-4xl text-[#ffca45]">₹{cart.pricePerDay}</span>
                  <span className="font-display text-xl text-[#ffca45]"> / DAY</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#e0c0b1] uppercase tracking-wider block">
                    <Text en="Refundable Deposit" ta="முன்பதிவு தொகை" />
                  </span>
                  <span className="font-sans text-sm font-bold text-ink">₹{cart.depositAmount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#e0c0b1]/80">
                <ShieldCheck size={16} className="text-[#ffb690]" />
                <Text en="100% Refundable deposit returned on cart handover." ta="வண்டி ஒப்படைக்கப்படும் போது முன்பணம் முழுமையாகத் திருப்பித் தரப்படும்." />
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#ffb690]/15 py-6">
              <div className="text-center space-y-1">
                <Ruler className="w-6 h-6 mx-auto text-[#ffb690]" />
                <p className="text-xs font-bold text-ink uppercase tracking-wider">{specs.length}</p>
                <p className="text-[10px] text-[#e0c0b1]/70 uppercase">Length</p>
              </div>
              <div className="text-center space-y-1 border-x border-[#ffb690]/10">
                <ShieldCheck className="w-6 h-6 mx-auto text-[#ffb690]" />
                <p className="text-xs font-bold text-ink uppercase tracking-wider">{specs.material}</p>
                <p className="text-[10px] text-[#e0c0b1]/70 uppercase">Structure</p>
              </div>
              <div className="text-center space-y-1">
                <Flame className="w-6 h-6 mx-auto text-[#ffb690]" />
                <p className="text-xs font-bold text-ink uppercase tracking-wider">{specs.stove}</p>
                <p className="text-[10px] text-[#e0c0b1]/70 uppercase">Stove</p>
              </div>
            </div>

            {/* About / Features */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl uppercase tracking-wider text-ink border-b border-[#ffb690]/10 pb-2">
                <Text en="Features & Specifications" ta="அம்சங்கள் & விவரங்கள்" />
              </h3>

              {/* Description */}
              {(cart.descriptionEn || cart.descriptionTa) && (
                <div className="text-sm leading-6 text-[#e0c0b1] font-sans">
                  <div className="en">{cart.descriptionEn}</div>
                  <div className="ta tamil-text">{cart.descriptionTa}</div>
                </div>
              )}

              {/* Specs bullet points */}
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {/* Call to Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#f97316] hover:bg-[#e2640e] text-white py-4 font-display text-2xl tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <CheckCircle size={20} className="animate-bounce" />
                    <Text en="ADDED TO LIST!" ta="பட்டியலில் சேர்க்கப்பட்டது!" />
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <Text en="ADD TO RENTAL LIST" ta="வாடகை பட்டியலில் சேர்க்க" />
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={waInquiryUrl}
                  target="_blank"
                  className="bg-transparent hover:bg-[#ffb690]/5 border border-[#ffb690]/30 hover:border-[#ffb690] text-[#ffb690] hover:text-[#f6ded3] py-3 font-display text-xl tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <Text en="WHATSAPP INQUIRY" ta="வாட்ஸ்அப் விசாரணை" />
                </a>

                <a
                  href={`tel:${CALL_PHONE}`}
                  className="bg-transparent hover:bg-[#ffb690]/5 border border-[#ffb690]/30 hover:border-[#ffb690] text-[#ffb690] hover:text-[#f6ded3] py-3 font-display text-xl tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  <Text en="CALL OFFICE" ta="அலுவலகத்திற்கு அழைக்க" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
