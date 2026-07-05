"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2,
  Settings, Plus, ChevronRight, Clock, CheckCircle,
  XCircle, Store, TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-4 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-on-surface-variant font-medium mt-1">{label}</p>
      <p className="text-2xl font-bold font-display text-on-surface">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant">{sub}</p>}
    </div>
  );
}


export default function VendorDashboardPage() {
  const router = useRouter();
  const { user, profile, vendorProfile, isVendor, loading } = useAuth();
  const [myCarts, setMyCarts] = useState<any[]>([]);
  const [cartsLoading, setCartsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/vendor/dashboard");
    }
    if (!loading && user && !isVendor) {
      router.push("/vendor/register");
    }
  }, [loading, user, isVendor, router]);

  useEffect(() => {
    if (!user || !isVendor) return;
    supabase
      .from("carts")
      .select("id, name, status, price_per_day, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setMyCarts(data ?? []);
        setCartsLoading(false);
      });
  }, [user, isVendor]);

  if (loading || cartsLoading) {
    return (
      <main className="min-h-screen bg-surface pb-24 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !isVendor) return null;

  const shopName = vendorProfile?.shop_name ?? profile?.name ?? "My Shop";

  return (
    <main className="min-h-screen bg-surface pb-24 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#251913] to-[#1a1008] px-6 pt-12 pb-8 rounded-b-2xl shadow-sm border-b border-white/5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store size={18} className="text-primary" />
              <p className="text-xs text-on-surface-variant font-medium">
                <T en="Vendor Dashboard" ta="விற்பனையாளர் டாஷ்போர்டு" />
              </p>
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-on-surface">
              {shopName}
            </h1>
          </div>
          <Link
            href="/publish"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition active:scale-95"
          >
            <Plus size={15} />
            <T en="List Cart" ta="வண்டி சேர்" />
          </Link>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Package size={18} />}
            label={<T en="Total Listings" ta="மொத்த பட்டியல்கள்" />}
            value={myCarts.length}
            color="text-primary"
          />
          <StatCard
            icon={<ShoppingBag size={18} />}
            label={<T en="Active Bookings" ta="செயலில் உள்ள பதிவுகள்" />}
            value="—"
            sub={<T en="Coming soon" ta="விரைவில்" /> as unknown as string}
            color="text-secondary"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label={<T en="Total Revenue" ta="மொத்த வருமானம்" />}
            value="₹—"
            sub={<T en="Coming soon" ta="விரைவில்" /> as unknown as string}
            color="text-green-400"
          />
          <StatCard
            icon={<BarChart2 size={18} />}
            label={<T en="Profile Views" ta="சுயவிவர பார்வைகள்" />}
            value="—"
            sub={<T en="Coming soon" ta="விரைவில்" /> as unknown as string}
            color="text-blue-400"
          />
        </div>

        {/* My Carts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-on-surface">
              <T en="My Carts" ta="என் வண்டிகள்" />
            </h2>
            <Link href="/publish" className="text-xs text-primary font-semibold hover:underline">
              <T en="+ Add New" ta="+ புதிது சேர்" />
            </Link>
          </div>

          <div className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
            {myCarts.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={32} className="text-on-surface-variant/40 mx-auto mb-3" />
                <p className="text-sm text-on-surface-variant">
                  <T en="No carts listed yet." ta="இன்னும் வண்டிகள் பதிவிடப்படவில்லை." />
                </p>
                <Link
                  href="/publish"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition"
                >
                  <Plus size={14} />
                  <T en="List Your First Cart" ta="முதல் வண்டியை சேர்" />
                </Link>
              </div>
            ) : (
              myCarts.map((cart, i) => (
                <Link
                  key={cart.id}
                  href={`/carts/${cart.id}`}
                  className={`flex items-center justify-between p-4 hover:bg-surface-dim/40 transition ${
                    i < myCarts.length - 1 ? "border-b border-outline-variant/20" : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm text-on-surface">{cart.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {cart.price_per_day ? `₹${cart.price_per_day}/day` : "Price not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      cart.status === "active"
                        ? "bg-green-900/30 text-green-400"
                        : cart.status === "pending"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}>
                      {cart.status}
                    </span>
                    <ChevronRight size={16} className="text-on-surface-variant" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-bold text-on-surface mb-3">
            <T en="Quick Actions" ta="விரைவு செயல்கள்" />
          </h2>
          <div className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <Link href="/publish" className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
              <div className="flex items-center gap-3 text-on-surface">
                <Plus size={20} className="text-primary" />
                <span className="font-semibold text-sm"><T en="List a New Cart" ta="புதிய வண்டி சேர்" /></span>
              </div>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </Link>
            <Link href="/vendor/settings" className="flex items-center justify-between p-4 border-b border-outline-variant/20 hover:bg-surface-dim/40 transition">
              <div className="flex items-center gap-3 text-on-surface">
                <Settings size={20} className="text-on-surface-variant" />
                <span className="font-semibold text-sm"><T en="Shop Settings" ta="கடை அமைப்புகள்" /></span>
              </div>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </Link>
            <Link href="/profile" className="flex items-center justify-between p-4 hover:bg-surface-dim/40 transition">
              <div className="flex items-center gap-3 text-on-surface">
                <LayoutDashboard size={20} className="text-on-surface-variant" />
                <span className="font-semibold text-sm"><T en="My Profile" ta="என் சுயவிவரம்" /></span>
              </div>
              <ChevronRight size={18} className="text-on-surface-variant" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
