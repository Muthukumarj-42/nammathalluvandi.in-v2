"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, AlertCircle, Store, X } from "lucide-react";
import { saveCart, updateCartAction, getCartByIdAction } from "@/app/actions";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase-browser";

const CART_TYPE_OPTIONS = [
  { value: "With Store", label: "With Store / Stove Cart" },
  { value: "With Roof", label: "With Roof / Covered Cart" },
  { value: "Ice Cream", label: "Ice Cream Cart" },
  { value: "Tea Stall", label: "Tea & Coffee Cart" },
  { value: "E-Rickshaw", label: "E-Rickshaw Food Cart" },
  { value: "Other", label: "Custom / Other" },
];

const CONDITION_OPTIONS = [
  { value: "New", label: "Brand New" },
  { value: "Used - Very Good", label: "Used — Very Good" },
  { value: "Used - Good", label: "Used — Good" },
  { value: "Fair", label: "Used — Fair" },
];

const SIZE_OPTIONS = ["Small (3 ft)", "Medium (4 ft)", "Large (5 ft)", "Extra Large (6 ft)"];
const STOVE_OPTIONS = ["None", "Single Burner", "Double Burner", "Triple Burner"];

const RENTAL_PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
];

const EQUIPMENT_OPTIONS = [
  "⛽ Gas Cylinder Connection",
  "💧 Water Tank",
  "⚡ Electrical Connection",
  "📦 Storage Shelves",
  "🔒 Lockable Cabinet",
  "🛞 Wheel Brake System",
  "☂️ Roof / Rain Cover",
  "🧊 Ice Storage Compartment",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition";
const selectClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition appearance-none";
const labelClass = "block text-sm font-semibold text-on-surface mb-1.5";
const helperClass = "text-xs text-on-surface-variant mt-1";
const sectionClass = "bg-surface rounded-2xl p-5 border border-outline-variant/20 mb-4";

type GeoState = {
  status: "idle" | "loading" | "success" | "error";
  latitude: number | null;
  longitude: number | null;
  area: string;
  district: string;
  source: "profile" | "detected" | null;
};

const EMPTY_GEO: GeoState = { status: "idle", latitude: null, longitude: null, area: "", district: "", source: null };

async function detectGpsLocation(): Promise<{ latitude: number; longitude: number; area: string; district: string } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const json = await res.json();
          resolve({ latitude, longitude, area: json.locality || json.city || "", district: json.principalSubdivision || json.city || "" });
        } catch {
          resolve({ latitude, longitude, area: "", district: "" });
        }
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function PublishPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCartId = searchParams.get("edit");
  const supabase = useMemo(() => createClient(), []);

  const { user, isVendor, vendorProfile, loading: authLoading } = useAuth();

  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    cartType: "",
    condition: "",
    size: "",
    stoveType: "None",
    dailyRent: "",
    minRentalPeriod: "",
    availableFrom: new Date().toISOString().slice(0, 10),
    additionalDetails: "",
  });

  const [equipment, setEquipment] = useState<string[]>([]);
  const [location, setLocation] = useState<GeoState>(EMPTY_GEO);
  const [confirmed, setConfirmed] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  const previewsRef = useRef<string[]>([]);
  useEffect(() => { previewsRef.current = previews; }, [previews]);
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const totalAllowed = 5;
    const currentTotal = existingPhotos.length + selectedFiles.length;
    if (currentTotal + files.length > totalAllowed) {
      setError(`You can only upload up to ${totalAllowed} photos in total.`);
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Load existing cart for edit mode
  useEffect(() => {
    if (!editCartId) return;
    setEditLoading(true);
    getCartByIdAction(editCartId).then((res) => {
      if (res.success && res.data) {
        const c: any = res.data;
        setFormData({
          cartType: c.type ?? "",
          condition: c.condition ?? "",
          size: c.size ?? "",
          stoveType: c.stove_type ?? "None",
          dailyRent: String(c.price_per_day ?? ""),
          minRentalPeriod: c.min_rental_period ?? "",
          availableFrom: c.available_from ?? new Date().toISOString().slice(0, 10),
          additionalDetails: c.description ?? "",
        });
        setEquipment(Array.isArray(c.equipment) ? c.equipment : []);
        if (c.latitude && c.longitude) {
          setLocation({
            status: "success",
            latitude: c.latitude,
            longitude: c.longitude,
            area: c.area ?? "",
            district: c.district ?? "",
            source: "detected",
          });
        }
        setExistingPhotos(c.photos || []);
        setConfirmed(true); // already-owned listing being edited
      }
      setEditLoading(false);
    });
  }, [editCartId]);

  const handleUseProfileLocation = () => {
    if (vendorProfile?.latitude == null || vendorProfile?.longitude == null) {
      setError("Your profile doesn't have a saved location yet. Use 'Cart is at a different location' instead.");
      return;
    }
    setLocation({
      status: "success",
      latitude: vendorProfile.latitude,
      longitude: vendorProfile.longitude,
      area: vendorProfile.area || "",
      district: vendorProfile.district || "",
      source: "profile",
    });
  };

  const handleDetectNewLocation = async () => {
    setLocation((l) => ({ ...l, status: "loading" }));
    const result = await detectGpsLocation();
    if (!result) {
      setLocation((l) => ({ ...l, status: "error" }));
      return;
    }
    setLocation({ status: "success", source: "detected", ...result });
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  };

  const totalPhotos = existingPhotos.length + selectedFiles.length;
  const isFormValid =
    formData.cartType !== "" &&
    formData.condition !== "" &&
    formData.dailyRent.trim() !== "" &&
    formData.minRentalPeriod !== "" &&
    formData.availableFrom !== "" &&
    location.status === "success" &&
    confirmed &&
    (editCartId ? true : totalPhotos >= 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !user) return;
    setSubmitLoading(true);
    setError("");
    try {
      let finalPhotos = [...existingPhotos];
      if (selectedFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of selectedFiles) {
          const fileExt = file.name.substring(file.name.lastIndexOf('.')) || ".jpg";
          const filename = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
          
          const { data, error: uploadErr } = await supabase.storage
            .from("carts")
            .upload(filename, file);

          if (uploadErr) {
            throw new Error(`Failed to upload ${file.name}: ${uploadErr.message}`);
          }

          if (data) {
            const { data: urlData } = supabase.storage
              .from("carts")
              .getPublicUrl(filename);
            uploadedUrls.push(urlData.publicUrl);
          }
        }
        finalPhotos = [...finalPhotos, ...uploadedUrls];
      }

      if (editCartId) {
        const res = await updateCartAction(editCartId, {
          type: formData.cartType,
          condition: formData.condition,
          size: formData.size,
          stove_type: formData.stoveType,
          price_per_day: Number(formData.dailyRent),
          min_rental_period: formData.minRentalPeriod,
          available_from: formData.availableFrom,
          equipment,
          description: formData.additionalDetails,
          latitude: location.latitude ?? undefined,
          longitude: location.longitude ?? undefined,
          area: location.area,
          district: location.district,
          photos: finalPhotos,
        });
        if (!res.success) throw new Error(res.error || "Failed to update cart");
        router.push("/vendor/dashboard");
      } else {
        const res = await saveCart({
          nameEn: formData.cartType,
          nameTa: formData.cartType,
          type: formData.cartType,
          pricePerDay: Number(formData.dailyRent) || 80,
          depositAmount: 2000,
          availableCount: 1,
          descriptionEn: formData.additionalDetails,
          descriptionTa: formData.additionalDetails,
          vendorName: vendorProfile?.full_name || vendorProfile?.shop_name || "Vendor",
          vendorPhone: vendorProfile?.whatsapp_number || vendorProfile?.phone || "",
          vendorLocation: location.area,
          latitude: location.latitude ?? undefined,
          longitude: location.longitude ?? undefined,
          condition: formData.condition,
          size: formData.size,
          stoveType: formData.stoveType,
          minRentalPeriod: formData.minRentalPeriod,
          availableFrom: formData.availableFrom,
          equipment,
          area: location.area,
          district: location.district,
          vendorId: vendorProfile?.id,
          ownerId: user.id,
          photos: finalPhotos,
        });
        if (!res.success) throw new Error(res.error || "Failed to save cart");
        setSubmitSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cartType: "",
      condition: "",
      size: "",
      stoveType: "None",
      dailyRent: "",
      minRentalPeriod: "",
      availableFrom: new Date().toISOString().slice(0, 10),
      additionalDetails: "",
    });
    setEquipment([]);
    setLocation(EMPTY_GEO);
    setConfirmed(false);
    setSelectedFiles([]);
    setPreviews([]);
    setExistingPhotos([]);
    setSubmitSuccess(false);
  };

  // ── Auth loading ──
  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface mb-3">Sign In to List Your Cart</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            You need an account to list your cart on Thalluvandi. Sign in or create an account to continue.
          </p>
          <Link href="/login?redirect=/publish" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition">
            <LogIn className="w-4 h-4" /> Login / Register
          </Link>
        </div>
      </main>
    );
  }

  // ── No vendor profile yet ──
  if (!isVendor) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface mb-3">Create Vendor Profile First</h1>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-left mb-6">
            <AlertCircle className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              To list a cart, you first need to create your vendor profile. It only takes 2 minutes.
            </p>
          </div>
          <Link href="/vendor/register" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition">
            <Store className="w-4 h-4" /> Create Vendor Profile
          </Link>
        </div>
      </main>
    );
  }

  // ── Submit success ──
  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center py-12">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Listing Submitted!</h2>
          <p className="text-on-surface-variant text-sm mb-2">Your cart will be reviewed and listed within 24 hours.</p>
          <p className="text-on-surface-variant text-sm mb-6">Booking enquiries will be sent directly to your WhatsApp.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={resetForm}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition"
            >
              LIST ANOTHER CART
            </button>
            <Link href="/explore" className="text-primary text-sm font-semibold text-center">Browse all carts →</Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Edit loading ──
  if (editLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const vendorName = vendorProfile?.full_name || vendorProfile?.shop_name || "Vendor";
  const vendorPhoto = vendorProfile?.profile_photo_url;
  const vendorArea = vendorProfile?.area;
  const vendorDistrict = vendorProfile?.district;

  // ── Main form ──
  return (
    <main className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="w-full max-w-[600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-on-surface mb-2">
            {editCartId ? "Edit Cart Listing" : "List Your Cart"}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {editCartId ? "Update your listing details" : "Free · Reviewed within 24 hours"}
          </p>
        </div>

        {/* Listing as */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          {vendorPhoto ? (
            <img className="w-10 h-10 rounded-full object-cover" src={vendorPhoto} alt={vendorName} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {vendorName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-on-surface text-sm">{vendorName}</p>
            <p className="text-xs text-on-surface-variant">
              📍 {vendorArea && vendorDistrict ? `${vendorArea} · ${vendorDistrict}` : "Location not set"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/20 text-error text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1 — Cart Details */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-4">Cart Details</h2>

            <div className="mb-4">
              <label className={labelClass}>Cart Type *</label>
              <select
                value={formData.cartType}
                onChange={(e) => setFormData((f) => ({ ...f, cartType: e.target.value }))}
                className={selectClass}
              >
                <option value="">Select cart type...</option>
                {CART_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Condition *</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData((f) => ({ ...f, condition: e.target.value }))}
                className={selectClass}
              >
                <option value="">Select condition...</option>
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cart Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData((f) => ({ ...f, size: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select size...</option>
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Stove Type</label>
                <select
                  value={formData.stoveType}
                  onChange={(e) => setFormData((f) => ({ ...f, stoveType: e.target.value }))}
                  className={selectClass}
                >
                  {STOVE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 — Pricing & Availability */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-4">Pricing & Availability</h2>

            <div className="mb-4">
              <label className={labelClass}>Daily Rent (₹) *</label>
              <input
                type="number"
                min={0}
                value={formData.dailyRent}
                onChange={(e) => setFormData((f) => ({ ...f, dailyRent: e.target.value }))}
                placeholder="e.g. 80"
                className={inputClass}
              />
              <p className={helperClass}>💡 Similar carts in your area rent for ₹60 – ₹120/day</p>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Minimum Rental Period *</label>
              <div className="flex flex-wrap gap-2">
                {RENTAL_PERIOD_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setFormData((f) => ({ ...f, minRentalPeriod: o.value }))}
                    className={
                      formData.minRentalPeriod === o.value
                        ? "bg-primary text-on-primary rounded-full px-5 py-2 text-sm font-semibold"
                        : "bg-surface border border-outline-variant rounded-full px-5 py-2 text-sm text-on-surface-variant cursor-pointer hover:border-primary/50 transition"
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Available From *</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={formData.availableFrom}
                onChange={(e) => setFormData((f) => ({ ...f, availableFrom: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Section 3 — Equipment */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">Equipment Included</h2>
            <p className={`${helperClass} mb-3`}>Tap everything that applies to your cart</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition"
                >
                  <input
                    type="checkbox"
                    checked={equipment.includes(item)}
                    onChange={() => toggleEquipment(item)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm text-on-surface">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4 — Cart Location */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">Cart Location</h2>
            <p className={`${helperClass} mb-3`}>Where is your cart currently stored or located?</p>

            <button
              type="button"
              onClick={handleUseProfileLocation}
              className="w-full py-3 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-sm font-medium flex items-center gap-2 px-4 mb-3 hover:border-primary/40 transition"
            >
              📍 Use My Profile Location
              <span className="text-on-surface-variant text-xs ml-auto">
                {vendorArea && vendorDistrict ? `${vendorArea}, ${vendorDistrict}` : "Not set"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDetectNewLocation}
              disabled={location.status === "loading"}
              className="w-full py-3 rounded-xl border border-dashed border-outline-variant/40 bg-surface text-on-surface-variant text-sm flex items-center gap-2 px-4 hover:border-primary/40 transition disabled:opacity-60"
            >
              📍 {location.status === "loading" ? "Detecting…" : "Cart is at a different location"}
            </button>

            {location.status === "success" && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mt-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">✅ Location {location.source === "profile" ? "Set From Profile" : "Detected"}</div>
                <p className="text-on-surface-variant text-xs">{location.area || "Area"}, {location.district || "District"}</p>
              </div>
            )}
            {location.status === "error" && (
              <div className="rounded-xl bg-error/5 border border-error/20 p-4 mt-3">
                <p className="text-error text-sm">❌ Could not detect location. Please allow location access and try again.</p>
              </div>
            )}
          </div>

          {/* Section 5 — Cart Photos */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">Cart Photos</h2>
            <p className={`${helperClass} mb-3`}>Add 2–5 clear photos of your cart</p>

            <div className="relative border-2 border-dashed border-outline-variant/40 rounded-xl bg-surface-container p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-3xl text-primary mb-1">📷</div>
              <p className="font-semibold text-on-surface text-sm mt-2">Tap to add cart photos</p>
              <p className="text-xs text-on-surface-variant mt-1">PNG, JPG, WEBP · Up to 5 photos · Max 5MB each</p>
            </div>

            {(existingPhotos.length > 0 || previews.length > 0) && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {existingPhotos.map((photo, idx) => (
                  <div key={`existing-${idx}`} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-outline-variant/30">
                    <img src={photo} alt="Existing" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-error text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {previews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-primary/40 border-dashed">
                    <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-error text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!editCartId && totalPhotos < 2 && (
              <p className={helperClass}>Add at least {2 - totalPhotos} more photo{2 - totalPhotos === 1 ? "" : "s"} to continue.</p>
            )}
          </div>

          {/* Section 6 — Additional Details */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-0.5">Additional Details</h2>
            <p className={`${helperClass} mb-3`}>(Optional)</p>
            <label className={labelClass}>Anything else about this cart?</label>
            <textarea
              rows={3}
              value={formData.additionalDetails}
              onChange={(e) => setFormData((f) => ({ ...f, additionalDetails: e.target.value }))}
              placeholder="e.g. Recently painted, new wheels fitted, available immediately..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Section 7 — Submit */}
          <label className="flex items-start gap-2 px-1 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="accent-primary w-4 h-4 mt-0.5"
            />
            <span className="text-sm text-on-surface">I confirm I own this cart and have the right to rent it out.</span>
          </label>

          <button
            type="submit"
            disabled={!isFormValid || submitLoading}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                {editCartId ? "Saving…" : "Submitting…"}
              </span>
            ) : editCartId ? (
              "SAVE CHANGES"
            ) : (
              "SUBMIT LISTING REQUEST"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function PublishPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <PublishPageContent />
    </Suspense>
  );
}
