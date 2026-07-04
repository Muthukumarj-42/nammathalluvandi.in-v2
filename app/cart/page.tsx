"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, Clock, Zap, MapPin, Calendar } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { saveBooking } from "@/app/actions";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const router = useRouter();
  
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalItems, 
    getTotalPrice, 
    getTotalDeposit, 
    clearCart 
  } = useCartStore();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
  });

  const [phoneError, setPhoneError] = useState("");

  // Sync language toggle dynamically
  useEffect(() => {
    setMounted(true);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, phone: val });

    const digits = val.replace(/\D/g, "");
    if (val && digits.length !== 10) {
      setPhoneError(
        lang === "ta"
          ? "தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்"
          : "Phone number must be exactly 10 digits"
      );
    } else {
      setPhoneError("");
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.phone.replace(/\D/g, "").length === 10 &&
    formData.date !== "" &&
    formData.location.trim() !== "" &&
    phoneError === "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !isFormValid) return;

    try {
      // Save each item as a booking
      for (const item of items) {
        await saveBooking({
          cartId: item.id,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          date: formData.date,
          location: formData.location.trim(),
          duration: "1 month",
          details: `Quantity: ${item.quantity}`,
        });
      }
      
      // Build WhatsApp Message (in Tamil for business operations clarity)
      const cartList = items.map(i => `${lang === "ta" ? i.nameTa : i.nameEn} (x${i.quantity})`).join(", ");
      const message = `வணக்கம் தள்ளுவண்டி குழுவினரே,

நான் பின்வரும் வண்டிகளை வாடகைக்கு எடுக்க விரும்புகிறேன்:

வண்டிகள்: ${cartList}
பெயர்: ${formData.name.trim()}
கைபேசி: ${formData.phone.trim()}
தேவைப்படும் தேதி: ${formData.date}
டெலிவரி இடம்: ${formData.location.trim()}

மொத்த வாடகை/நாள்: ₹${getTotalPrice()}
மொத்த முன்பணம்: ₹${getTotalDeposit()}`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/918838292849?text=${encodedMessage}`, "_blank");
      
      clearCart();
      router.push("/explore");
    } catch (err) {
      console.error("Booking submission error:", err);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="bg-[#0a0a08] min-h-[85vh] flex flex-col items-center justify-center py-20 px-6">
        <div className="bg-[#ffb690]/10 p-6 border border-[#ffb690]/20 mb-6 text-[#ffb690]">
          <ShoppingBag size={48} />
        </div>
        <h1 className="font-display text-4xl mb-3 text-ink uppercase tracking-wider">
          <Text en="Your Cart is Empty" ta="பட்டியல் காலியாக உள்ளது" />
        </h1>
        <p className="text-muted text-sm max-w-sm text-center mb-8 font-sans">
          <Text 
            en="Looks like you haven't added any premium food carts to your rental list yet." 
            ta="வாடகைக்கு எடுக்க தள்ளுவண்டிகள் எதையும் நீங்கள் இன்னும் தேர்ந்தெடுக்கவில்லை." 
          />
        </p>
        <Link 
          href="/explore" 
          className="inline-block bg-[#f97316] hover:bg-[#e2640e] text-white px-8 py-4 font-display text-lg tracking-wider uppercase active:scale-95 transition-all rounded-2xl"
        >
          <Text en="Explore Carts →" ta="வண்டிகளை ஆராய →" />
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#0a0a08] min-h-screen text-[#f6ded3] pb-24 pt-28 px-4 md:px-6">
      <div className="max-w-6xl mx-auto site-container">
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wider text-ink mb-8 border-b border-[#ffb690]/10 pb-4">
          <Text en="RENTAL BASKET" ta="வாடகை கூடை" />
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-[#291d16] border border-[#ffb690]/15 relative group rounded-3xl">
                {/* Product Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-[#251913] border border-[#ffb690]/10 rounded-2xl overflow-hidden">
                  <Image src={item.image} alt={item.nameEn} fill className="object-cover" />
                </div>
                
                {/* Product details and actions */}
                <div className="flex flex-col flex-grow justify-between py-1">
                  <div>
                    <h3 className="font-display text-2xl uppercase leading-tight text-ink">
                      <Text en={item.nameEn} ta={item.nameTa} />
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[9px] font-bold border border-[#ffb690]/20 px-2 py-0.5 text-[#ffb690] uppercase tracking-wider">
                        <Text en={`₹${item.pricePerDay}/day`} ta={`₹${item.pricePerDay}/நாள்`} />
                      </span>
                      <span className="text-[9px] font-bold border border-[#ffb690]/20 px-2 py-0.5 text-[#ffb690] uppercase tracking-wider">
                        <Text en={`Deposit: ₹${item.depositAmount}`} ta={`முன்பணம்: ₹${item.depositAmount}`} />
                      </span>
                    </div>
                  </div>
                  
                  {/* Quantity and Delete Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-[#ffb690]/20 bg-[#160c06]">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-[#ffb690] hover:text-[#f6ded3] transition"
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span className="w-8 text-center font-bold text-sm text-ink">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-[#ffb690] hover:text-[#f6ded3] transition"
                      >+</button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Subtotals (desktop only) */}
                <div className="hidden sm:flex flex-col items-end justify-between py-1 min-w-[120px] border-l border-[#ffb690]/10 pl-4">
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#e0c0b1]">Rent / Day</p>
                    <p className="font-display text-xl text-[#ffca45]">₹{item.pricePerDay * item.quantity}</p>
                  </div>
                  <div className="text-right mt-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#e0c0b1]">Deposit</p>
                    <p className="font-display text-lg text-ink">₹{item.depositAmount * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-5">
            <div className="bg-[#160c06] p-6 border border-[#ffb690]/15 sticky top-24 space-y-6 rounded-3xl">
              <h2 className="font-display text-3xl uppercase tracking-wider text-ink border-b border-[#ffb690]/10 pb-3">
                <Text en="RENTAL SUMMARY" ta="வாடகை விவரம்" />
              </h2>
              
              <div className="space-y-3 pb-6 border-b border-[#ffb690]/10 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-[#e0c0b1]">
                    <Text en="Total Items" ta="மொத்த வண்டிகள்" />
                  </span>
                  <span className="text-ink">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[#e0c0b1]">
                    <Text en="Total Rent / Day" ta="மொத்த வாடகை / நாள்" />
                  </span>
                  <span className="text-[#ffca45] font-display text-2xl">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[#e0c0b1]">
                    <Text en="Refundable Deposit" ta="மொத்த முன்பணம்" />
                  </span>
                  <span className="text-ink font-display text-xl">₹{getTotalDeposit()}</span>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-[#e0c0b1] uppercase block">
                      <Text en="Full Name *" ta="முழு பெயர் *" />
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ta" ? "உங்கள் பெயர்" : "Karthik Raja"}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#251913] border border-[#ffb690]/15 py-3 px-4 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none rounded-xl"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-[#e0c0b1] uppercase block">
                      <Text en="Phone Number *" ta="கைபேசி எண் *" />
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className={`w-full bg-[#251913] border py-3 px-4 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:ring-0 focus:outline-none transition-colors rounded-xl ${
                        phoneError
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#ffb690]/15 focus:border-[#f97316]"
                      }`}
                    />
                    {phoneError && (
                      <span className="text-xs text-red-400 mt-1 block font-semibold">
                        {phoneError}
                      </span>
                    )}
                  </div>

                  {/* Booking Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-[#e0c0b1] uppercase block">
                      <Text en="Rental Start Date *" ta="வாடகை தொடங்கும் நாள் *" />
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#251913] border border-[#ffb690]/15 py-3 px-4 text-[#f6ded3] focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none cursor-pointer rounded-xl"
                    />
                  </div>

                  {/* Delivery Location */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-[#e0c0b1] uppercase block">
                      <Text en="Delivery Location in Coimbatore *" ta="டெலிவரி இடம் (கோவையில்) *" />
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ta" ? "உங்கள் இடம்" : "e.g. Ondipudur"}
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#251913] border border-[#ffb690]/15 py-3 px-4 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none rounded-xl"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full bg-[#f97316] hover:bg-[#e2640e] text-white font-display text-2xl tracking-wider py-4 mt-6 uppercase active:scale-95 transition-all flex items-center justify-center gap-2 rounded-2xl ${
                    !isFormValid ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <Text en="CHECKOUT TO WHATSAPP" ta="வாட்ஸ்அப்பில் ஆர்டர் செய்க" />
                  <ArrowRight size={20} className="shrink-0" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
