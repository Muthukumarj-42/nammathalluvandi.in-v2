"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ChevronRight, AlertCircle, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth-context";
import { uploadVendorPhotoAction } from "@/app/actions";

function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

const CART_COUNT_OPTIONS = ["1", "2-3", "4-5", "5+"];

interface FormState {
  fullName: string;
  whatsappNumber: string;
  cartCount: string;
  aboutText: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  whatsappNumber: "",
  cartCount: "",
  aboutText: "",
};

type GeoState = {
  status: "idle" | "loading" | "success" | "error";
  latitude: number | null;
  longitude: number | null;
  area: string;
  district: string;
};

const EMPTY_GEO: GeoState = { status: "idle", latitude: null, longitude: null, area: "", district: "" };

export default function VendorRegisterPage() {
  const router = useRouter();
  const { user, vendorProfile, refreshProfile } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [geo, setGeo] = useState<GeoState>(EMPTY_GEO);
  const [confirmed, setConfirmed] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    previewRef.current = photoPreview;
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be under 2MB.");
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // GPS detection is only ever triggered by this click handler — never during render.
  const handleDetectLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo((g) => ({ ...g, status: "error" }));
      return;
    }
    setGeo((g) => ({ ...g, status: "loading" }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const json = await res.json();
          const area = json.locality || json.city || "";
          const district = json.principalSubdivision || json.city || "";
          setGeo({ status: "success", latitude, longitude, area, district });
        } catch {
          setGeo({ status: "success", latitude, longitude, area: "", district: "" });
        }
      },
      () => setGeo((g) => ({ ...g, status: "error" })),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isFormValid =
    form.fullName.trim() !== "" &&
    form.whatsappNumber.trim() !== "" &&
    form.cartCount !== "" &&
    geo.status === "success" &&
    confirmed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login?redirect=/vendor/register"); return; }
    if (!isFormValid) {
      setError("Please fill in all required fields, detect your location, and confirm the checkbox.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let profilePhotoUrl: string | null = null;
      if (photoFile) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        const uploadRes = await uploadVendorPhotoAction(fd);
        profilePhotoUrl = uploadRes.success ? (uploadRes.url ?? null) : null;
      }

      // NOTE: requires supabase/migrations/002_vendor_and_cart_listing_redesign.sql
      // to have been run — it adds full_name/whatsapp_number/profile_photo_url/
      // latitude/longitude/area/district/cart_count/about_text to vendor_profiles.
      const { error: insertError } = await supabase
        .from("vendor_profiles")
        .upsert({
          id: user.id,
          full_name: form.fullName.trim(),
          whatsapp_number: form.whatsappNumber.trim(),
          profile_photo_url: profilePhotoUrl,
          latitude: geo.latitude,
          longitude: geo.longitude,
          area: geo.area,
          district: geo.district,
          cart_count: form.cartCount,
          about_text: form.aboutText.trim(),
          status: "approved",
        });

      if (insertError) throw insertError;
      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to create vendor profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Already a vendor
  if (vendorProfile && !success) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-xl font-bold text-on-surface mb-2">
            <T en="You're already a Vendor!" ta="நீங்கள் ஏற்கனவே விற்பனையாளர்!" />
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            <T en="Access your vendor dashboard to manage your carts." ta="உங்கள் வண்டிகளை நிர்வகிக்க டாஷ்போர்டை பயன்படுத்துங்கள்." />
          </p>
          <Link href="/vendor/dashboard" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition">
            <T en="Go to Dashboard" ta="டாஷ்போர்டுக்கு செல்" />
            <ChevronRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <h1 className="font-display text-xl font-bold text-on-surface mb-3">
            <T en="Sign in to continue" ta="தொடர உள்நுழையவும்" />
          </h1>
          <Link href="/login?redirect=/vendor/register" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition">
            <T en="Login / Register" ta="உள்நுழை / பதிவு செய்" />
          </Link>
        </div>
      </main>
    );
  }

  // Success — just submitted this session
  if (success) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Profile Created!</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            You're all set! You can now list your carts on Thalluvandi. Booking enquiries will be sent to your WhatsApp on {form.whatsappNumber}.
          </p>
          <Link href="/publish" className="text-primary text-sm font-semibold underline">
            List your first cart →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="w-full max-w-[600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Create Vendor Profile</h1>
          <p className="text-on-surface-variant text-sm">Free · Takes 2 minutes · Reach 700+ active renters</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/20 text-error text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1 — Personal Details */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 mb-4">
            <h2 className="font-display text-base font-bold text-on-surface mb-4">Personal Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Your Full Name *</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="e.g. Nagaraj D"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              <p className="text-xs text-on-surface-variant mt-1">This is shown to renters after booking is confirmed only</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">WhatsApp Number *</label>
              <input
                type="tel"
                required
                maxLength={13}
                value={form.whatsappNumber}
                onChange={set("whatsappNumber")}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              <p className="text-xs text-on-surface-variant mt-1">All booking enquiries will be sent to this number</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Profile Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7 text-primary" />
                )}
                <span className="text-sm font-semibold text-on-surface">Tap to upload photo</span>
                <span className="text-xs text-on-surface-variant">JPG, PNG up to 2MB</span>
              </button>
              <p className="text-xs text-on-surface-variant mt-1">Builds trust with renters</p>
            </div>
          </div>

          {/* Section 2 — Your Location */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 mb-4">
            <h2 className="font-display text-base font-bold text-on-surface mb-1">Your Location</h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Your exact location is never shown to renters. Used only to match you with nearby cart seekers.
            </p>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={geo.status === "loading"}
              className="w-full py-4 rounded-xl border-2 border-dashed border-primary/40 bg-surface-container text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition disabled:opacity-60"
            >
              📍 {geo.status === "loading" ? "Detecting…" : "Detect My Location"}
            </button>

            {geo.status === "success" && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mt-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">✅ Location Detected</div>
                <p className="text-on-surface-variant text-xs">{geo.area || "Area"}, {geo.district || "District"}</p>
              </div>
            )}

            {geo.status === "error" && (
              <div className="rounded-xl bg-error/5 border border-error/20 p-4 mt-3">
                <p className="text-error text-sm">❌ Could not detect location. Please allow location access and try again.</p>
              </div>
            )}
          </div>

          {/* Section 3 — Your Carts */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/20 mb-4">
            <h2 className="font-display text-base font-bold text-on-surface mb-4">Your Carts</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">How many carts do you have? *</label>
              <div className="flex flex-wrap gap-2">
                {CART_COUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, cartCount: opt }))}
                    className={
                      form.cartCount === opt
                        ? "bg-primary text-on-primary rounded-full px-5 py-2 text-sm font-semibold"
                        : "bg-surface border border-outline-variant rounded-full px-5 py-2 text-sm text-on-surface-variant cursor-pointer hover:border-primary/50 transition"
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">About You</label>
              <textarea
                rows={3}
                value={form.aboutText}
                onChange={set("aboutText")}
                placeholder="e.g. I have 2 food carts available in Ondipudur. 30 years experience in cart rental business."
                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
              />
              <p className="text-xs text-on-surface-variant mt-1">This is private — only seen by NTV admin</p>
            </div>
          </div>

          {/* Section 4 — Confirmation */}
          <label className="flex items-start gap-2 px-1 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="accent-primary w-4 h-4 mt-0.5"
            />
            <span className="text-sm text-on-surface">
              I confirm all details provided are accurate and I own/operate the listed carts.
            </span>
          </label>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Creating profile...
              </span>
            ) : (
              "CREATE VENDOR PROFILE"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
