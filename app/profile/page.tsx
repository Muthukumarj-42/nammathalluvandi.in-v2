"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User, LogOut, Package, MapPin, Heart, Settings,
  ChevronRight, Store, Shield, LayoutDashboard, Star, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

// ─── Bilingual text helper ────────────────────────────────────────────────────
function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    BUYER: { label: "Buyer", color: "bg-blue-900/40 text-blue-300 border-blue-700/40" },
    VENDOR: { label: "Vendor", color: "bg-amber-900/40 text-amber-300 border-amber-700/40" },
    ADMIN: { label: "Admin", color: "bg-purple-900/40 text-purple-300 border-purple-700/40" },
    SUPER_ADMIN: { label: "Super Admin", color: "bg-red-900/40 text-red-300 border-red-700/40" },
  };
  const { label, color } = map[role] ?? { label: role, color: "bg-white/10 text-white/60 border-white/10" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {label}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 64 }: { src?: string | null; name?: string; size?: number }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full overflow-hidden border-2 border-white/20 shadow-lg flex-shrink-0"
      >
        <Image src={src} alt={name ?? "Avatar"} width={size} height={size} className="object-cover w-full h-full" />
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-[#f97316] to-[#dc2626] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg"
    >
      <span style={{ fontSize: size * 0.35 }}>{initials}</span>
    </div>
  );
}

// ─── Menu row ────────────────────────────────────────────────────────────────
function MenuRow({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 border-b border-outline-variant/20 last:border-b-0 hover:bg-surface-dim/40 transition"
    >
      <div className="flex items-center gap-3 text-on-surface">
        {icon}
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
            {badge}
          </span>
        )}
        <ChevronRight size={18} className="text-on-surface-variant" />
      </div>
    </Link>
  );
}

// ─── Guest view ──────────────────────────────────────────────────────────────
function GuestView() {
  return (
    <main className="min-h-screen bg-surface pb-24 pt-20">
      <section className="bg-primary px-6 pt-12 pb-8 text-on-primary rounded-b-2xl shadow-sm">
        <h1 className="text-2xl font-bold font-display tracking-tight mb-6">
          <T en="Profile" ta="சுயவிவரம்" />
        </h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-sm">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              <T en="Guest User" ta="விருந்தினர்" />
            </h2>
            <p className="text-on-primary/70 text-sm">
              <T en="Login to manage your carts" ta="உள்நுழைந்து வண்டிகளை நிர்வகிக்கவும்" />
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1 bg-surface text-primary hover:bg-surface-dim font-bold rounded-lg border-none shadow-sm">
            <Link href="/login">
              <T en="Login / Register" ta="உள்நுழை / பதிவு செய்" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="px-4 mt-8 max-w-xl mx-auto">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container overflow-hidden shadow-sm">
          <MenuRow href="/explore" icon={<Package size={20} className="text-primary" />} label={<T en="Browse Carts" ta="வண்டிகளை உலாவு" />} />
          <MenuRow href="/contact" icon={<MapPin size={20} className="text-primary" />} label={<T en="Contact Us" ta="எங்களை தொடர்பு கொள்" />} />
        </div>
      </section>
    </main>
  );
}

// ─── Authenticated view ───────────────────────────────────────────────────────
function AuthenticatedView() {
  const router = useRouter();
  const { profile, roles, vendorProfile, isAdmin, isVendor, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface pb-24 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const displayName = profile?.name ?? "User";
  const displayEmail = profile?.email ?? "";

  return (
    <main className="min-h-screen bg-surface pb-24 pt-20">
      {/* Header */}
      <section className="bg-primary px-6 pt-12 pb-8 text-on-primary rounded-b-2xl shadow-sm">
        <h1 className="text-2xl font-bold font-display tracking-tight mb-6">
          <T en="Profile" ta="சுயவிவரம்" />
        </h1>
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar} name={displayName} size={64} />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{displayName}</h2>
            <p className="text-on-primary/70 text-sm truncate">{displayEmail}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            id="signout-btn"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-on-primary/70 hover:text-on-primary text-sm font-semibold transition-colors"
          >
            <LogOut size={16} />
            <T en="Sign Out" ta="வெளியேறு" />
          </button>
        </div>
      </section>

      <div className="px-4 mt-8 max-w-xl mx-auto space-y-6">

        {/* Admin shortcut */}
        {isAdmin && (
          <div className="rounded-2xl border border-purple-700/30 bg-purple-900/10 overflow-hidden shadow-sm">
            <div className="px-4 py-2 border-b border-purple-700/20">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                <T en="Admin Access" ta="நிர்வாக அணுகல்" />
              </p>
            </div>
            <MenuRow
              href="/admin"
              icon={<Shield size={20} className="text-purple-400" />}
              label={<T en="Admin Dashboard" ta="நிர்வாக டாஷ்போர்டு" />}
            />
          </div>
        )}

        {/* Vendor section */}
        {isVendor ? (
          <div className="rounded-2xl border border-amber-700/30 bg-amber-900/10 overflow-hidden shadow-sm">
            <div className="px-4 py-2 border-b border-amber-700/20 flex items-center justify-between">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                <T en="Vendor" ta="விற்பனையாளர்" />
              </p>
              {vendorProfile && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  vendorProfile.status === "approved"
                    ? "bg-green-900/40 text-green-400"
                    : vendorProfile.status === "rejected"
                    ? "bg-red-900/40 text-red-400"
                    : "bg-yellow-900/40 text-yellow-400"
                }`}>
                  {vendorProfile.status === "approved" ? "✓ Approved" : vendorProfile.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                </span>
              )}
            </div>
            <MenuRow
              href="/vendor/dashboard"
              icon={<LayoutDashboard size={20} className="text-amber-400" />}
              label={<T en="Vendor Dashboard" ta="விற்பனையாளர் டாஷ்போர்டு" />}
            />
            <MenuRow
              href="/publish"
              icon={<Store size={20} className="text-amber-400" />}
              label={<T en="List a Cart" ta="வண்டி பதிவிடு" />}
            />
          </div>
        ) : (
          /* Become a vendor CTA */
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container overflow-hidden shadow-sm">
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-on-surface">
                  <T en="Become a Vendor" ta="விற்பனையாளராகுங்கள்" />
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  <T en="List your carts and earn money" ta="உங்கள் வண்டிகளை பதிவிட்டு வருமானம் ஈட்டுங்கள்" />
                </p>
              </div>
              <Link
                href="/vendor/register"
                className="shrink-0 px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition"
              >
                <T en="Apply" ta="விண்ணப்பி" />
              </Link>
            </div>
          </div>
        )}

        {/* Account section */}
        <div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 px-1">
            <T en="Account" ta="கணக்கு" />
          </h3>
          <div className="bg-surface-container rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
            <MenuRow
              href="/orders"
              icon={<Package size={20} className="text-primary" />}
              label={<T en="My Bookings" ta="என் பதிவுகள்" />}
            />
            <MenuRow
              href="/explore"
              icon={<Heart size={20} className="text-secondary" />}
              label={<T en="Saved Listings" ta="சேமித்த பட்டியல்கள்" />}
            />
            <MenuRow
              href="/contact"
              icon={<MapPin size={20} className="text-primary" />}
              label={<T en="Saved Addresses" ta="சேமித்த முகவரிகள்" />}
            />
            <MenuRow
              href="/settings"
              icon={<Settings size={20} className="text-on-surface-variant" />}
              label={<T en="Settings" ta="அமைப்புகள்" />}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-surface pb-24 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return user ? <AuthenticatedView /> : <GuestView />;
}
