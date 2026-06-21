import Link from "next/link";
import { Users, IndianRupee, Clock, Camera, FileText, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellLandingPage() {
  return (
    <main className="min-h-screen bg-surface pb-20">
      {/* Header Section */}
      <section className="bg-primary px-4 pt-12 pb-8 text-on-primary rounded-b-3xl shadow-md">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim mb-2">For Cart Owners</p>
        <h1 className="text-3xl font-display uppercase leading-tight mb-2">
          List Your Cart.<br />Reach More Buyers.
        </h1>
        <p className="text-primary-fixed-dim font-tamil">உங்கள் வண்டியை வாடகைக்கு விடுங்கள். அதிக வாடிக்கையாளர்களைப் பெறுங்கள்.</p>

        {/* Stats Box */}
        <div className="bg-surface text-on-surface rounded-xl p-4 mt-6 shadow-sm flex justify-between divide-x divide-outline-variant text-center">
          <div className="flex-1 px-2">
            <Users className="mx-auto mb-1 text-primary" size={20} />
            <p className="font-bold text-sm">5,000+</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Buyers</p>
          </div>
          <div className="flex-1 px-2">
            <IndianRupee className="mx-auto mb-1 text-secondary" size={20} />
            <p className="font-bold text-sm">Free</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">To List</p>
          </div>
          <div className="flex-1 px-2">
            <Clock className="mx-auto mb-1 text-tertiary" size={20} />
            <p className="font-bold text-sm">&lt; 2 min</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Setup Time</p>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="px-4 py-8">
        <h2 className="text-lg font-bold text-on-surface mb-6">How it works</h2>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent">
          
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-secondary-container bg-surface flex items-center justify-center z-10 shrink-0 text-secondary">
              <Camera size={20} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-on-surface text-base">1. Add Photos</h3>
              <p className="text-sm text-on-surface-variant mt-1">Take 2-5 clear pictures of your cart from different angles. Good photos attract more buyers.</p>
            </div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-secondary-container bg-surface flex items-center justify-center z-10 shrink-0 text-secondary">
              <FileText size={20} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-on-surface text-base">2. Fill Cart Details</h3>
              <p className="text-sm text-on-surface-variant mt-1">Enter the cart type, condition, size, and your asking price (rent or sale).</p>
            </div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center z-10 shrink-0 text-on-primary-container">
              <Send size={20} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-on-surface text-base">3. Go Live - Get Buyers</h3>
              <p className="text-sm text-on-surface-variant mt-1">Buyers will contact you directly on WhatsApp. No middleman, no hidden fees.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="px-4 mb-8">
        <div className="bg-tertiary-container text-on-tertiary-container rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-tertiary" size={20} />
            <h3 className="font-bold">Prices & Trust</h3>
          </div>
          <p className="text-sm text-on-tertiary-container/80 leading-relaxed">
            Namma Thalluvandi ensures that your listings are seen by genuine buyers. We verify all listings to keep the marketplace safe.
          </p>
        </div>
      </section>

      {/* CTA Button */}
      <section className="px-4 pb-8">
        <Button asChild size="lg" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full text-on-primary">
          <Link href="/publish">
            List Your Cart Now
          </Link>
        </Button>
      </section>

    </main>
  );
}
