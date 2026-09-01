"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Plus, ChevronRight, Package, ShieldCheck, Crown, Clock, Edit3, ArrowUpRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { mapDbCartToCart, type Cart } from "@/lib/carts";
import { getOwnerListingUsageAction } from "@/app/actions";
import { getPlan, formatCurrency } from "@/lib/plans";
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
  sublabel,
  color = "text-[#f97316]",
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string | number;
  sublabel?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-[#160c06] rounded-2xl border border-[#ffb690]/15 p-5 flex flex-col justify-between">
      <div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
          {icon}
        </div>
        <p className="text-xs text-[#f6ded3]/60 font-medium mt-3">{label}</p>
        <p className="text-2xl font-bold font-display text-[#fffdf7] mt-0.5">{value}</p>
      </div>
      {sublabel && <p className="text-[11px] text-[#f6ded3]/50 mt-2">{sublabel}</p>}
    </div>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const { user, profile, vendorProfile, isVendor, loading } = useAuth();
  const [myCarts, setMyCarts] = useState<Cart[]>([]);
  const [cartsLoading, setCartsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<{
    subscription: any;
    totalListings: number;
    remainingListings: number;
    maxCarts: number;
    canPublish: boolean;
  }>({
    subscription: null,
    totalListings: 0,
    remainingListings: 0,
    maxCarts: 0,
    canPublish: false,
  });
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

    // 1. Fetch owner carts
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

    // 2. Fetch owner subscription & usage limits
    getOwnerListingUsageAction(user.id).then((res) => {
      if (res.success && res.data) {
        setUsageStats(res.data);
      }
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
  const sub = usageStats.subscription;
  const currentPlan = sub ? getPlan(sub.plan_id) : null;
  const cycleLabel = sub?.billing_cycle === "3_months" ? "3 Months" : "Monthly";

  const expiryDate = sub?.expires_at
    ? new Date(sub.expires_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const canAddMore = usageStats.remainingListings > 0;

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
      {/* Subtle dot grid */}
      <div className="absolute inset-0 editorial-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 cinematic-vignette pointer-events-none" />

      {/* Header */}
      <section className="relative border-b border-[#ffb690]/10 pt-6 pb-6 md:pt-8 md:pb-8 px-6 bg-gradient-to-br from-[#075200] to-[#116d03] z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
              <T en="Owner & Vendor Portal" ta="உரிமையாளர் தளம்" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wider text-white uppercase mt-0.5">
              {shopName}
            </h1>
          </div>
          <Button
            asChild
            className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-xl font-display uppercase tracking-widest text-xs font-bold px-4 py-2 shrink-0 h-10 shadow-md"
          >
            <Link href="/publish" className="flex items-center gap-1.5">
              <Plus size={15} />
              <T en="List New Cart" ta="புதிய வண்டி சேர்" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8 relative z-10">
        {/* Active Plan & Quota Card */}
        <div className="bg-[#160c06] rounded-3xl border border-[#ffb690]/20 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ffb690]/10 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f97316]/20 to-[#f97316]/5 border border-[#f97316]/30 flex items-center justify-center text-[#f97316] font-bold">
                <Crown size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold text-[#fffdf7]">
                    {currentPlan ? (
                      <T en={`${currentPlan.nameEn} Plan`} ta={`${currentPlan.nameTa} திட்டம்`} />
                    ) : (
                      <T en="No Active Plan" ta="திட்டம் இல்லை" />
                    )}
                  </h3>
                  {currentPlan && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
                      {cycleLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#f6ded3]/60 mt-0.5">
                  {sub ? (
                    <>
                      {formatCurrency(sub.amount)} / {cycleLabel} · <T en="Valid until" ta="செல்லுபடியாகும் நாள்" /> {expiryDate}
                    </>
                  ) : (
                    <T en="Choose a plan to list carts and receive inquiries" ta="வண்டிகளைப் பட்டியலிட திட்டத்தைத் தேர்வு செய்க" />
                  )}
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              className="border-[#ffb690]/30 hover:bg-[#ffb690]/10 text-[#f97316] hover:text-[#fffdf7] rounded-xl text-xs font-bold uppercase tracking-wider h-10 px-4 shrink-0"
            >
              <Link href="/publish?change_plan=true" className="flex items-center gap-1.5">
                <Sparkles size={14} />
                <T en="Upgrade / Change Plan" ta="திட்டத்தை மாற்றவும்" />
              </Link>
            </Button>
          </div>

          {/* Quota Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#f6ded3]/70">
                <T en="Listing Limit Quota" ta="பட்டியல் பயன்பாடு" />
              </span>
              <span className="text-[#fffdf7] font-display">
                {myCarts.length} / {usageStats.maxCarts || 2} <T en="Used" ta="பயன்படுத்தப்பட்டது" /> (
                <span className={canAddMore ? "text-green-400" : "text-amber-400"}>
                  {usageStats.remainingListings} <T en="Remaining" ta="மீதம்" />
                </span>
                )
              </span>
            </div>

            <div className="w-full h-2.5 bg-[#251913] rounded-full overflow-hidden border border-[#ffb690]/10">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  canAddMore ? "bg-gradient-to-r from-[#f97316] to-[#22c55e]" : "bg-amber-500"
                }`}
                style={{
                  width: `${Math.min(100, (myCarts.length / (usageStats.maxCarts || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Package size={18} />}
            label={<T en="Total Carts Listed" ta="மொத்த வண்டிகள்" />}
            value={myCarts.length}
            sublabel={<T en={`Limit: ${usageStats.maxCarts || 2} max`} ta={`வரம்பு: அதிகபட்சம் ${usageStats.maxCarts || 2}`} />}
            color="text-[#f97316]"
          />
          <StatCard
            icon={<Store size={18} />}
            label={<T en="Published Live" ta="நேரலையில் வெளியிடப்பட்டது" />}
            value={myCarts.filter((c) => c.available).length}
            sublabel={<T en="Visible on explore" ta="தேடலில் தெரியும்" />}
            color="text-green-400"
          />
          <StatCard
            icon={<Clock size={18} />}
            label={<T en="Pending Verification" ta="சரிபார்ப்பில் நிலுவை" />}
            value={myCarts.filter((c) => !c.available).length}
            sublabel={<T en="Reviewed in 24 hrs" ta="24 மணி நேரத்தில் சரிபார்க்கப்படும்" />}
            color="text-amber-400"
          />
        </div>

        {/* My Carts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display text-[#fffdf7] uppercase tracking-wider">
              <T en="My Listed Carts" ta="என் வண்டிகள்" /> ({myCarts.length})
            </h2>
            {canAddMore ? (
              <span className="text-xs text-green-400 font-medium">
                ✓ {usageStats.remainingListings} <T en="listings available" ta="இடங்கள் உள்ளன" />
              </span>
            ) : (
              <span className="text-xs text-amber-400 font-medium">
                ⚠️ <T en="Limit reached" ta="வரம்பு முடிந்தது" />
              </span>
            )}
          </div>

          <div className="space-y-4">
            {myCarts.length === 0 ? (
              <div className="bg-[#160c06] border border-[#ffb690]/15 rounded-3xl p-10 text-center flex flex-col items-center">
                <Package size={48} className="text-[#f6ded3]/30 mb-4" />
                <p className="text-base text-[#f6ded3]/70 max-w-sm mb-6">
                  <T
                    en="You haven't listed any food carts yet. Select a plan and publish your first cart today!"
                    ta="நீங்கள் இன்னும் உணவு வண்டிகள் எதையும் பட்டியலிடவில்லை. இன்றே உங்கள் முதல் வண்டியைச் சேர்த்து வாடகை ஈட்டுங்கள்!"
                  />
                </p>
                <Button
                  asChild
                  className="bg-[#f97316] text-[#0a0a08] hover:bg-[#f97316]/95 border-none rounded-xl font-display uppercase tracking-widest text-sm font-bold px-6 py-3 h-12"
                >
                  <Link href="/publish" className="flex items-center gap-2">
                    <Plus size={16} />
                    <T en="Publish Your First Cart" ta="முதல் வண்டியைப் பட்டியலிடு" />
                  </Link>
                </Button>
              </div>
            ) : (
              myCarts.map((cart) => {
                const displayName = lang === "ta" ? cart.nameTa : cart.nameEn;
                const isPublished = cart.available;

                return (
                  <div
                    key={cart.id}
                    className="p-5 bg-[#160c06] border border-[#ffb690]/15 hover:border-[#f97316]/40 rounded-2xl transition duration-300 flex items-center justify-between gap-4 group"
                  >
                    <Link
                      href={`/carts/${cart.uniqueCode || cart.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-[#251913] flex items-center justify-center border border-[#ffb690]/10 overflow-hidden shrink-0">
                        {cart.images && cart.images[0] ? (
                          <img src={cart.images[0]} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-[#f6ded3]/30" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-[#fffdf7] group-hover:text-[#f97316] transition-colors truncate">
                            {displayName}
                          </p>
                          {cart.uniqueCode && (
                            <span className="text-[9px] font-bold bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              {cart.uniqueCode}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#f6ded3]/60 mt-1">
                          {cart.pricePerDay ? (
                            <span>
                              <T en="Rent" ta="வாடகை" />:{" "}
                              <strong className="text-[#ffca45] font-display">₹{cart.pricePerDay}/day</strong>
                            </span>
                          ) : null}
                          {cart.city && cart.city[0] ? (
                            <span>📍 {cart.city[0]}</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {isPublished ? (
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <T en="Published" ta="நேரலை" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse">
                          <T en="Pending Verification" ta="சரிபார்ப்பில் உள்ளது" />
                        </span>
                      )}

                      <Link
                        href={`/publish?edit=${cart.id}`}
                        title="Edit Cart Details"
                        className="p-2 rounded-xl bg-[#251913] hover:bg-[#ffb690]/10 border border-[#ffb690]/15 text-[#f6ded3]/70 hover:text-[#f97316] transition"
                      >
                        <Edit3 size={15} />
                      </Link>

                      <Link
                        href={`/carts/${cart.uniqueCode || cart.id}`}
                        className="p-2 rounded-xl bg-[#251913] hover:bg-[#ffb690]/10 border border-[#ffb690]/15 text-[#f6ded3]/70 hover:text-[#f97316] transition"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
