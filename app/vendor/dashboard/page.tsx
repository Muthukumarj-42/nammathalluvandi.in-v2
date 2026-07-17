"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Plus, ChevronRight, Package } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth, type VendorProfile } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { mapDbCartToCart, type Cart } from "@/lib/carts";
import { Button } from "@/components/ui/button";

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
  color = "text-[#f97316]",
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-[#160c06] rounded-2xl border border-[#ffb690]/15 p-5 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-[#f6ded3]/60 font-medium mt-1">{label}</p>
      <p className="text-2xl font-bold font-display text-[#fffdf7]">{value}</p>
    </div>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const { user, profile, vendorProfile, isVendor, loading } = useAuth();
  const [myCarts, setMyCarts] = useState<Cart[]>([]);
  const [cartsLoading, setCartsLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "ta">("en");

  const supabase = createClient();

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
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(mapDbCartToCart);
          setMyCarts(mapped);
        }
        setCartsLoading(false);
      });
  }, [user, isVendor]);

  if (loading || cartsLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a08] pb-24 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !isVendor) return null;

  const shopName = vendorProfile?.full_name ?? vendorProfile?.shop_name ?? profile?.name ?? "My Shop";

  return (
    <main className="min-h-screen bg-[#0a0a08] pb-24 pt-14 md:pt-20 text-[#f6ded3] relative overflow-hidden">
      {/* Subtle warm ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(249,115,22,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(220,38,38,0.04) 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot grid / editorial-grid */}
      <div className="absolute inset-0 editorial-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 cinematic-vignette pointer-events-none" />

      {/* Header */}
      <section className="relative border-b border-[#ffb690]/10 pt-4 pb-4 md:pt-8 md:pb-8 px-6 bg-gradient-to-br from-[#075200] to-[#116d03] z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-wider text-white uppercase">
              {shopName}
            </h1>
          </div>
          {myCarts.length > 0 && (
            <Button asChild className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-xl font-display uppercase tracking-widest text-xs font-bold px-4 py-2 shrink-0 h-10">
              <Link href="/publish" className="flex items-center gap-1">
                <Plus size={14} />
                <T en="List New Cart" ta="புதிய வண்டி சேர்" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8 relative z-10">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Package size={18} />}
            label={<T en="Total Carts Listed" ta="மொத்த வண்டிகள்" />}
            value={myCarts.length}
            color="text-[#f97316]"
          />
          <StatCard
            icon={<Store size={18} />}
            label={<T en="Live on Marketplace" ta="சந்தையில் நேரலையில்" />}
            value={myCarts.filter((c) => c.available).length}
            color="text-green-400"
          />
        </div>

        {/* My Carts */}
        <div>
          <h2 className="text-lg font-bold font-display text-[#fffdf7] uppercase tracking-wider mb-4">
            <T en="My Listed Carts" ta="என் வண்டிகள்" />
          </h2>

          <div className="space-y-4">
            {myCarts.length === 0 ? (
              <div className="bg-[#160c06] border border-[#ffb690]/15 rounded-3xl p-10 text-center flex flex-col items-center">
                <Package size={48} className="text-[#f6ded3]/30 mb-4" />
                <p className="text-base text-[#f6ded3]/70 max-w-sm mb-6">
                  <T en="You haven't listed any food carts yet. Start earning recurring monthly rent today!" ta="நீங்கள் இன்னும் உணவு வண்டிகள் எதையும் பட்டியலிடவில்லை. இன்றே வருமானம் ஈட்டத் தொடங்குங்கள்!" />
                </p>
                <Button asChild className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-xl font-display uppercase tracking-widest text-sm font-bold px-6 py-3 h-12">
                  <Link href="/publish" className="flex items-center gap-2">
                    <Plus size={16} />
                    <T en="List Your First Cart" ta="முதல் வண்டியை சேர்" />
                  </Link>
                </Button>
              </div>
            ) : (
              myCarts.map((cart) => {
                const displayName = lang === "ta" ? cart.nameTa : cart.nameEn;
                
                return (
                  <Link
                    key={cart.id}
                    href={`/carts/${cart.uniqueCode || cart.id}`}
                    className="flex items-center justify-between p-5 bg-[#160c06] border border-[#ffb690]/15 hover:border-[#f97316]/50 rounded-2xl transition duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail Placeholder */}
                      <div className="w-12 h-12 rounded-xl bg-[#251913] flex items-center justify-center border border-[#ffb690]/10 overflow-hidden shrink-0">
                        {cart.images && cart.images[0] ? (
                          <img src={cart.images[0]} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-[#f6ded3]/30" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-[#fffdf7] group-hover:text-[#f97316] transition-colors">{displayName}</p>
                          {cart.uniqueCode && (
                            <span className="text-[9px] font-bold bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              {cart.uniqueCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#f6ded3]/60 mt-1">
                          <T en="Daily Rent" ta="தினசரி வாடகை" />:{" "}
                          <span className="text-[#ffca45] font-semibold font-display">₹{cart.pricePerDay}/day</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        cart.available
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {cart.available ? <T en="Live" ta="நேரலை" /> : <T en="Pending" ta="நிலுவையில்" />}
                      </span>
                      <ChevronRight size={18} className="text-[#f6ded3]/40 group-hover:text-[#f97316] transition-colors group-hover:translate-x-0.5 duration-200" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
