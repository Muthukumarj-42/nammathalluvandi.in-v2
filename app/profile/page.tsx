import Link from "next/link";
import { User, LogOut, Package, MapPin, Heart, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-surface pb-24 pt-20">
      {/* Header Profile Info */}
      <section className="bg-primary px-6 pt-12 pb-8 text-on-primary rounded-b-2xl shadow-sm">
        <h1 className="text-2xl font-bold font-display tracking-tight mb-6">Profile</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-sm">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Guest User</h2>
            <p className="text-on-primary/70 text-sm">Login to manage your carts</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1 bg-surface text-primary hover:bg-surface-dim font-bold rounded-lg border-none shadow-sm">
            <Link href="/contact">Login / Register</Link>
          </Button>
        </div>
      </section>

      {/* Menu Options */}
      <section className="px-4 mt-8 max-w-xl mx-auto">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Account Settings</h3>
        <div className="bg-surface-container rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <Link href="/cart" className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
            <div className="flex items-center gap-3 text-on-surface">
              <Package size={20} className="text-primary" />
              <span className="font-semibold text-sm">My Active Carts</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </Link>
          <Link href="/explore" className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
            <div className="flex items-center gap-3 text-on-surface">
              <Heart size={20} className="text-secondary" />
              <span className="font-semibold text-sm">Saved Listings</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </Link>
          <Link href="/contact" className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
            <div className="flex items-center gap-3 text-on-surface">
              <MapPin size={20} className="text-primary" />
              <span className="font-semibold text-sm">Saved Addresses</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </Link>
          <Link href="/contact" className="flex items-center justify-between p-4 hover:bg-surface-dim/40 transition">
            <div className="flex items-center gap-3 text-on-surface">
              <Settings size={20} className="text-on-surface-variant" />
              <span className="font-semibold text-sm">Settings</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </Link>
        </div>
      </section>

      {/* Support Options */}
      <section className="px-4 mt-8 max-w-xl mx-auto">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Support</h3>
        <div className="bg-surface-container rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <Link href="/contact#enquiry-form" scroll={false} className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
            <div className="flex items-center gap-3 text-on-surface">
              <span className="font-semibold text-sm">Help & Contact Us</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </Link>
          <Link href="/how-it-works" className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
            <div className="flex items-center gap-3 text-on-surface">
              <span className="font-semibold text-sm">How It Works</span>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant" />
          </Link>
        </div>
      </section>

      {/* Logout */}
      <section className="px-4 mt-8 mb-8 max-w-xl mx-auto text-center">
        <Button asChild variant="outline" className="w-full h-12 text-error border-error hover:bg-error/10 rounded-lg font-bold flex items-center justify-center gap-2">
          <Link href="/">
            <LogOut size={18} />
            Sign Out
          </Link>
        </Button>
      </section>
    </main>
  );
}
