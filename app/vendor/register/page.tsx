"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth-context";

function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

const CATEGORIES = [
  { value: "tea_coffee", en: "Tea & Coffee", ta: "தேநீர் & காபி" },
  { value: "juice", en: "Juice & Beverages", ta: "ஜூஸ் & பானங்கள்" },
  { value: "fast_food", en: "Fast Food", ta: "ஃபாஸ்ட் ஃபுட்" },
  { value: "snacks", en: "Snacks & Chaat", ta: "சிற்றுண்டி & சாட்" },
  { value: "fruits", en: "Fruits & Vegetables", ta: "பழங்கள் & காய்கறிகள்" },
  { value: "others", en: "Others", ta: "மற்றவை" },
];

interface FormData {
  shop_name: string;
  business_category: string;
  description: string;
  phone: string;
  address: string;
  upi: string;
  gst: string;
}

const EMPTY: FormData = {
  shop_name: "",
  business_category: "",
  description: "",
  phone: "",
  address: "",
  upi: "",
  gst: "",
};

export default function VendorRegisterPage() {
  const router = useRouter();
  const { user, profile, isVendor, refreshProfile } = useAuth();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login?redirect=/vendor/register"); return; }

    if (!form.shop_name.trim() || !form.business_category || !form.phone.trim() || !form.address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("vendor_profiles")
        .upsert({
          id: user.id,
          shop_name: form.shop_name.trim(),
          business_category: form.business_category,
          description: form.description.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          upi: form.upi.trim(),
          gst: form.gst.trim() || null,
          status: "pending",
        });

      if (insertError) throw insertError;
      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Already a vendor
  if (isVendor) {
    return (
      <main className="min-h-screen bg-surface pb-24 pt-20 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-900/30 border border-amber-700/40 flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2">
            <T en="You're already a Vendor!" ta="நீங்கள் ஏற்கனவே விற்பனையாளர்!" />
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            <T en="Access your vendor dashboard to manage your carts." ta="உங்கள் வண்டிகளை நிர்வகிக்க டாஷ்போர்டை பயன்படுத்துங்கள்." />
          </p>
          <Link href="/vendor/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition">
            <T en="Go to Dashboard" ta="டாஷ்போர்டுக்கு செல்" />
            <ChevronRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-screen bg-surface pb-24 pt-20 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            <T en="Application Submitted!" ta="விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!" />
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            <T
              en="Our team will review your application and get back to you within 1–2 business days."
              ta="எங்கள் குழு உங்கள் விண்ணப்பத்தை மதிப்பாய்வு செய்து 1–2 நாட்களில் தெரிவிப்பார்கள்."
            />
          </p>
          <Link href="/profile" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition">
            <T en="Back to Profile" ta="சுயவிவரத்திற்கு திரும்பு" />
          </Link>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-surface pb-24 pt-20 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-xl font-bold text-on-surface mb-3">
            <T en="Sign in to continue" ta="தொடர உள்நுழையவும்" />
          </h1>
          <Link href="/login?redirect=/vendor/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm">
            <T en="Login / Register" ta="உள்நுழை / பதிவு செய்" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface pb-24 pt-20">
      {/* Header */}
      <section className="bg-primary px-6 pt-12 pb-8 text-on-primary rounded-b-2xl shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
            <Store size={20} className="text-on-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight">
              <T en="Become a Vendor" ta="விற்பனையாளராகுங்கள்" />
            </h1>
            <p className="text-on-primary/60 text-xs">
              <T en="List your carts on Thalluvandi" ta="Thalluvandil உங்கள் வண்டிகளை பதிவிடுங்கள்" />
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4">
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-900/20 border border-red-700/30 text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Info */}
          <fieldset className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <legend className="px-4 pt-4 pb-0 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <T en="Business Information" ta="வணிக தகவல்" />
            </legend>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="Shop Name" ta="கடை பெயர்" /> <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.shop_name}
                  onChange={set("shop_name")}
                  placeholder="e.g., Ravi's Juice Corner"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="Business Category" ta="வணிக வகை" /> <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.business_category}
                  onChange={set("business_category")}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                >
                  <option value="">
                    <T en="Select a category" ta="வகையை தேர்ந்தெடு" />
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="Description" ta="விளக்கம்" />
                </label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Tell us about your business…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>
            </div>
          </fieldset>

          {/* Contact & Location */}
          <fieldset className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <legend className="px-4 pt-4 pb-0 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <T en="Contact & Location" ta="தொடர்பு & இடம்" />
            </legend>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="Phone Number" ta="தொலைபேசி எண்" /> <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="Business Address" ta="வணிக முகவரி" /> <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Street, Area, City, PIN"
                  rows={2}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
            <legend className="px-4 pt-4 pb-0 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <T en="Payment Details" ta="கட்டண விவரங்கள்" />
            </legend>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="UPI ID" ta="UPI ஐடி" />
                </label>
                <input
                  type="text"
                  value={form.upi}
                  onChange={set("upi")}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  <T en="GST Number" ta="GST எண்" />{" "}
                  <span className="text-on-surface-variant text-xs font-normal">(<T en="Optional" ta="விரும்பினால்" />)</span>
                </label>
                <input
                  type="text"
                  value={form.gst}
                  onChange={set("gst")}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
            </div>
          </fieldset>

          <p className="text-xs text-on-surface-variant px-1 leading-relaxed">
            <T
              en="Your application will be reviewed by our admin team within 1–2 business days. You'll be notified once approved."
              ta="உங்கள் விண்ணப்பம் 1–2 நாட்களில் மதிப்பாய்வு செய்யப்படும். அனுமதிக்கப்பட்டதும் தெரிவிக்கப்படும்."
            />
          </p>

          <button
            id="vendor-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold text-base hover:from-[#fb923c] hover:to-[#f97316] transition-all duration-200 shadow-lg shadow-orange-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                </svg>
                <T en="Submitting…" ta="சமர்ப்பிக்கிறோம்…" />
              </span>
            ) : (
              <T en="Submit Application" ta="விண்ணப்பத்தை சமர்ப்பி" />
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
