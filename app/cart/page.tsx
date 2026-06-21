"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { saveBooking } from "@/app/actions";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, getTotalDeposit, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    try {
      // Save each item as a booking (or group them depending on DB schema)
      for (const item of items) {
        await saveBooking({
          cartId: item.id,
          name: formData.name,
          phone: formData.phone,
          date: formData.date,
          location: formData.location,
          duration: "1 month",
          details: `Quantity: ${item.quantity}`,
        });
      }
      
      // Build WhatsApp Message
      const cartList = items.map(i => `${i.nameEn} (x${i.quantity})`).join(", ");
      const message = `Hello, I want to rent the following carts:\n\nCarts: ${cartList}\nName: ${formData.name}\nPhone: ${formData.phone}\nDate: ${formData.date}\nLocation: ${formData.location}\n\nTotal Rent/Day: ₹${getTotalPrice()}\nTotal Deposit: ₹${getTotalDeposit()}`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/918838292849?text=${encodedMessage}`, "_blank");
      
      clearCart();
      router.push("/explore");
    } catch (err) {
      console.error(err);
    }
  };

  if (items.length === 0) {
    return (
      <main className="bg-[#fffdf7] min-h-[80vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-surface/50 p-6 rounded-full mb-6 text-primary">
          <ShoppingBag size={48} />
        </div>
        <h1 className="font-display text-3xl mb-2 text-ink uppercase">Your Cart is Empty</h1>
        <p className="text-ink/60 mb-8">Looks like you haven't added any food carts yet.</p>
        <Button asChild className="bg-primary text-on-primary hover:bg-primary/90 font-bold rounded-full px-8">
          <Link href="/explore">Explore Carts</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="bg-[#fffdf7] min-h-screen text-[#1a1208] pb-16 pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-4xl uppercase tracking-wide text-ink mb-8 border-b border-[#e5e0d8] pb-4">
          Shopping Cart
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white border border-[#e5e0d8] rounded-2xl shadow-sm">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-[#fff7ed] rounded-xl overflow-hidden">
                  <Image src={item.image} alt={item.nameEn} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-grow justify-between py-1">
                  <div>
                    <h3 className="font-display text-xl uppercase leading-tight">{item.nameEn}</h3>
                    <p className="text-sm text-[#78716c] font-tamil">{item.nameTa}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 border border-[#e5e0d8] rounded-lg bg-surface px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-ink hover:text-primary transition"
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-ink hover:text-primary transition"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end py-1 min-w-[100px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716c]">Rent</p>
                  <p className="font-bold text-primary mb-2">₹{item.pricePerDay * item.quantity}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716c]">Deposit</p>
                  <p className="font-bold text-ink">₹{item.depositAmount * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-[#f97316]/10 shadow-premium-dark sticky top-24">
              <h2 className="font-display text-2xl uppercase tracking-wide border-b border-[#e5e0d8] pb-3 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-[#e5e0d8]">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#78716c]">Total Items</span>
                  <span>{getTotalItems()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#78716c]">Total Rent/Day</span>
                  <span className="text-primary font-bold">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#78716c]">Total Deposit (Refundable)</span>
                  <span className="text-ink font-bold">₹{getTotalDeposit()}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 border border-[#e5e0d8] focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-sm outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (10 digits)"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 border border-[#e5e0d8] focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-sm outline-none"
                  />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-11 border border-[#e5e0d8] focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-sm outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Delivery Location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-11 border border-[#e5e0d8] focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-sm outline-none"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl mt-4 text-base"
                >
                  Checkout via WhatsApp <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
