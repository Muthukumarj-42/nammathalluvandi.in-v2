"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, AlertCircle, Store, X } from "lucide-react";
import { saveCart, updateCartAction, getCartByIdAction } from "@/app/actions";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase-browser";

const CART_TYPE_OPTIONS = [
  { value: "With Store", en: "With Store / Stove Cart", ta: "அடுப்புடன் கூடிய வண்டி / ஸ்டவ் வண்டி" },
  { value: "With Roof", en: "With Roof / Covered Cart", ta: "மேற்கூரையுடன் கூடிய வண்டி / மூடப்பட்ட வண்டி" },
  { value: "Ice Cream", en: "Ice Cream Cart", ta: "ஐஸ்கிரீம் வண்டி" },
  { value: "Tea Stall", en: "Tea & Coffee Cart", ta: "டீ & காபி கடை வண்டி" },
  { value: "E-Rickshaw", en: "E-Rickshaw Food Cart", ta: "இ-ரிக்ஷா உணவு வண்டி" },
  { value: "Other", en: "Custom / Other", ta: "தனிப்பயனாக்கப்பட்ட வண்டி / இதர" },
];

const CONDITION_OPTIONS = [
  { value: "New", en: "Brand New", ta: "புதியது" },
  { value: "Used - Very Good", en: "Used — Very Good", ta: "பயன்படுத்தப்பட்டது — மிக நன்று" },
  { value: "Used - Good", en: "Used — Good", ta: "பயன்படுத்தப்பட்டது — நன்று" },
  { value: "Fair", en: "Used — Fair", ta: "பயன்படுத்தப்பட்டது — சுமார்" },
];

const SIZE_OPTIONS = [
  { value: "Small (3 ft)", en: "Small (3 ft)", ta: "சிறிய (3 அடி)" },
  { value: "Medium (4 ft)", en: "Medium (4 ft)", ta: "நடுத்தர (4 அடி)" },
  { value: "Large (5 ft)", en: "Large (5 ft)", ta: "பெரிய (5 அடி)" },
  { value: "Extra Large (6 ft)", en: "Extra Large (6 ft)", ta: "மிகப் பெரிய (6 அடி)" },
];

const STOVE_OPTIONS = [
  { value: "None", en: "None", ta: "இல்லை" },
  { value: "Single Burner", en: "Single Burner", ta: "ஒற்றை அடுப்பு" },
  { value: "Double Burner", en: "Double Burner", ta: "இரட்டை அடுப்பு" },
  { value: "Triple Burner", en: "Triple Burner", ta: "மூன்று அடுப்பு" },
];

const RENTAL_PERIOD_OPTIONS = [
  { value: "daily", en: "Daily", ta: "தினசரி" },
  { value: "weekly", en: "Weekly", ta: "வாராந்திர" },
  { value: "1_month", en: "1 Month", ta: "1 மாதம்" },
  { value: "3_months", en: "3 Months", ta: "3 மாதங்கள்" },
];

const EQUIPMENT_OPTIONS = [
  { value: "⛽ Gas Cylinder Connection", en: "⛽ Gas Cylinder Connection", ta: "⛽ கேஸ் சிலிண்டர் இணைப்பு" },
  { value: "💧 Water Tank", en: "💧 Water Tank", ta: "💧 தண்ணீர் தொட்டி" },
  { value: "⚡ Electrical Connection", en: "⚡ Electrical Connection", ta: "⚡ மின்சார இணைப்பு" },
  { value: "📦 Storage Shelves", en: "📦 Storage Shelves", ta: "📦 சேமிப்பு அலமாரிகள்" },
  { value: "🔒 Lockable Cabinet", en: "🔒 Lockable Cabinet", ta: "🔒 பூட்டக்கூடிய அமைச்சரவை" },
  { value: "🛞 Wheel Brake System", en: "🛞 Wheel Brake System", ta: "🛞 சக்கர பிரேக் சிஸ்டம்" },
  { value: "☂️ Roof / Rain Cover", en: "☂️ Roof / Rain Cover", ta: "☂️ மேற்கூரை / மழை உறை" },
  { value: "🧊 Ice Storage Compartment", en: "🧊 Ice Storage Compartment", ta: "🧊 ஐஸ் சேமிப்பு பெட்டி" },
];

function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
              headers: {
                "User-Agent": "NammaThalluvandi/1.0"
              }
            }
          );
          const json = await res.json();
          const addr = json.address || {};
          
          let district = addr.state_district || addr.county || addr.district || addr.city || addr.state || "";
          district = district.replace(/\s+district/i, "").trim();

          let area = addr.suburb || addr.town || addr.village || addr.city_district || addr.locality || addr.county || "";
          area = area.replace(/\s+taluk/i, "").trim();

          resolve({ latitude, longitude, area, district });
        } catch {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const json = await res.json();
            resolve({
              latitude,
              longitude,
              area: json.locality || json.city || "",
              district: json.principalSubdivision || json.city || ""
            });
          } catch {
            resolve({ latitude, longitude, area: "", district: "" });
          }
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
  const [lang, setLang] = useState<"en" | "ta">("en");

  // Sync React language state dynamically with DOM mutations (data-lang toggle)
  useEffect(() => {
    const currentLang =
      document.documentElement.dataset.lang === "ta" ? "ta" : "en";
    setLang(currentLang);

    const observer = new MutationObserver(() => {
      const updatedLang =
        document.documentElement.dataset.lang === "ta" ? "ta" : "en";
      setLang(updatedLang);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang"],
    });

    return () => observer.disconnect();
  }, []);

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
        const selectedCartType = CART_TYPE_OPTIONS.find((o) => o.value === formData.cartType);
        const nameEn = selectedCartType?.en || formData.cartType;
        const nameTa = selectedCartType?.ta || formData.cartType;

        const res = await saveCart({
          nameEn,
          nameTa,
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
          <h1 className="font-display text-2xl font-bold text-on-surface mb-3">
            <T en="Sign In to List Your Cart" ta="உங்கள் வண்டியைப் பட்டியலிட உள்நுழையவும்" />
          </h1>
          <p className="text-on-surface-variant text-sm mb-8">
            <T
              en="You need an account to list your cart on Thalluvandi. Sign in or create an account to continue."
              ta="நம்ம தள்ளுவண்டியில் வண்டியைப் பட்டியலிட உங்களுக்கு ஒரு கணக்கு இருக்க வேண்டும். தொடர உள்நுழையவும்."
            />
          </p>
          <Link href="/login?redirect=/publish" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition">
            <LogIn className="w-4 h-4" /> <T en="Login / Register" ta="உள்நுழைய / பதிவு செய்ய" />
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
          <h1 className="font-display text-2xl font-bold text-on-surface mb-3">
            <T en="Create Vendor Profile First" ta="முதலில் விற்பனையாளர் சுயவிவரத்தை உருவாக்கவும்" />
          </h1>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-left mb-6">
            <AlertCircle className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <T
                en="To list a cart, you first need to create your vendor profile. It only takes 2 minutes."
                ta="வண்டியைப் பட்டியலிட, முதலில் உங்கள் விற்பனையாளர் சுயவிவரத்தை உருவாக்க வேண்டும். இதற்கு 2 நிமிடங்கள் மட்டுமே ஆகும்."
              />
            </p>
          </div>
          <Link href="/vendor/register" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition">
            <Store className="w-4 h-4" /> <T en="Create Vendor Profile" ta="விற்பனையாளர் சுயவிவரத்தை உருவாக்கவும்" />
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
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
            <T en="Listing Submitted!" ta="விவரங்கள் சமர்ப்பிக்கப்பட்டது!" />
          </h2>
          <p className="text-on-surface-variant text-sm mb-2">
            <T en="Your cart will be reviewed and listed within 24 hours." ta="உங்கள் வண்டி 24 மணி நேரத்திற்குள் சரிபார்க்கப்பட்டு நேரலையில் பட்டியலிடப்படும்." />
          </p>
          <p className="text-on-surface-variant text-sm mb-6">
            <T en="Booking enquiries will be sent directly to your WhatsApp." ta="முன்பதிவு விசாரணைகள் நேரடியாக உங்கள் வாட்ஸ்அப்பிற்கு அனுப்பப்படும்." />
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={resetForm}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary-container transition"
            >
              <T en="LIST ANOTHER CART" ta="மற்றொரு வண்டியைப் பட்டியலிடவும்" />
            </button>
            <Link href="/explore" className="text-primary text-sm font-semibold text-center">
              <T en="Browse all carts →" ta="அனைத்து வண்டிகளையும் பார்க்க →" />
            </Link>
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
            {editCartId ? (
              <T en="Edit Cart Listing" ta="வண்டி விவரங்களை மாற்றியமைக்கவும்" />
            ) : (
              <T en="List Your Cart" ta="உங்கள் வண்டியைப் பட்டியலிடுங்கள்" />
            )}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {editCartId ? (
              <T en="Update your listing details" ta="உங்கள் வண்டியின் விவரங்களைப் புதுப்பிக்கவும்" />
            ) : (
              <T en="Free · Reviewed within 24 hours" ta="இலவசம் · 24 மணி நேரத்திற்குள் சரிபார்க்கப்படும்" />
            )}
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
              📍 {vendorArea && vendorDistrict ? `${vendorArea} · ${vendorDistrict}` : <T en="Location not set" ta="இருப்பிடம் அமைக்கப்படவில்லை" />}
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
            <h2 className="font-display text-base font-bold text-on-surface mb-4">
              <T en="Cart Details" ta="வண்டியின் விவரங்கள்" />
            </h2>

            <div className="mb-4">
              <label className={labelClass}><T en="Cart Type *" ta="வண்டி வகை *" /></label>
              <select
                value={formData.cartType}
                onChange={(e) => setFormData((f) => ({ ...f, cartType: e.target.value }))}
                className={selectClass}
              >
                <option value="">{lang === "ta" ? "வண்டி வகையைத் தேர்ந்தெடுக்கவும்..." : "Select cart type..."}</option>
                {CART_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{lang === "ta" ? o.ta : o.en}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className={labelClass}><T en="Condition *" ta="நிலைமை *" /></label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData((f) => ({ ...f, condition: e.target.value }))}
                className={selectClass}
              >
                <option value="">{lang === "ta" ? "நிலைமையைத் தேர்ந்தெடுக்கவும்..." : "Select condition..."}</option>
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{lang === "ta" ? o.ta : o.en}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}><T en="Cart Size" ta="வண்டியின் அளவு" /></label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData((f) => ({ ...f, size: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">{lang === "ta" ? "அளவைத் தேர்ந்தெடுக்கவும்..." : "Select size..."}</option>
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{lang === "ta" ? s.ta : s.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}><T en="Stove Type" ta="அடுப்பு வகை" /></label>
                <select
                  value={formData.stoveType}
                  onChange={(e) => setFormData((f) => ({ ...f, stoveType: e.target.value }))}
                  className={selectClass}
                >
                  {STOVE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{lang === "ta" ? s.ta : s.en}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 — Pricing & Availability */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-4">
              <T en="Pricing & Availability" ta="வாடகை & கிடைக்கும் விவரங்கள்" />
            </h2>

            <div className="mb-4">
              <label className={labelClass}><T en="Daily Rent (₹) *" ta="தினசரி வாடகை (₹) *" /></label>
              <input
                type="number"
                min={0}
                value={formData.dailyRent}
                onChange={(e) => setFormData((f) => ({ ...f, dailyRent: e.target.value }))}
                placeholder={lang === "ta" ? "உதாரணமாக: 80" : "e.g. 80"}
                className={inputClass}
              />
              <p className={helperClass}>
                <T
                  en="💡 Similar carts in your area rent for ₹60 – ₹120/day"
                  ta="💡 உங்கள் பகுதியில் இதே போன்ற வண்டிகள் ₹60 - ₹120/நாள் வரை வாடகைக்கு விடப்படுகின்றன"
                />
              </p>
            </div>

            <div className="mb-4">
              <label className={labelClass}><T en="Minimum Rental Period *" ta="குறைந்தபட்ச வாடகை காலம் *" /></label>
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
                    {lang === "ta" ? o.ta : o.en}
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
            <h2 className="font-display text-base font-bold text-on-surface mb-1">
              <T en="Equipment Included" ta="வண்டியிலுள்ள உபகரணங்கள்" />
            </h2>
            <p className={`${helperClass} mb-3`}>
              <T en="Tap everything that applies to your cart" ta="உங்கள் வண்டியில் இருக்கும் அனைத்தையும் தேர்ந்தெடுக்கவும்" />
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EQUIPMENT_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition"
                >
                  <input
                    type="checkbox"
                    checked={equipment.includes(o.value)}
                    onChange={() => toggleEquipment(o.value)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm text-on-surface">
                    {lang === "ta" ? o.ta : o.en}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4 — Cart Location */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">
              <T en="Cart Location" ta="வண்டி இருக்கும் இடம்" />
            </h2>
            <p className={`${helperClass} mb-3`}>
              <T en="Where is your cart currently stored or located?" ta="உங்கள் வண்டி தற்போது எங்கு வைக்கப்பட்டுள்ளது அல்லது அமைந்துள்ளது?" />
            </p>

            <button
              type="button"
              onClick={handleUseProfileLocation}
              className="w-full py-3 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-sm font-medium flex items-center gap-2 px-4 mb-3 hover:border-primary/40 transition"
            >
              📍 <T en="Use My Profile Location" ta="என் சுயவிவர இருப்பிடத்தைப் பயன்படுத்தவும்" />
              <span className="text-on-surface-variant text-xs ml-auto">
                {vendorArea && vendorDistrict ? `${vendorArea}, ${vendorDistrict}` : <T en="Not set" ta="அமைக்கப்படவில்லை" />}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDetectNewLocation}
              disabled={location.status === "loading"}
              className="w-full py-3 rounded-xl border border-dashed border-outline-variant/40 bg-surface text-on-surface-variant text-sm flex items-center gap-2 px-4 hover:border-primary/40 transition disabled:opacity-60"
            >
              📍 {location.status === "loading" ? (
                <T en="Detecting…" ta="இருப்பிடம் கண்டறியப்படுகிறது…" />
              ) : (
                <T en="Cart is at a different location" ta="வண்டி வேறு இடத்தில் உள்ளது" />
              )}
            </button>

            {location.status === "success" && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mt-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
                  ✅ <T en="Location" ta="இருப்பிடம்" /> {location.source === "profile" ? (
                    <T en="Set From Profile" ta="சுயவிவரத்திலிருந்து அமைக்கப்பட்டது" />
                  ) : (
                    <T en="Detected" ta="கண்டறியப்பட்டது" />
                  )}
                </div>
                <p className="text-on-surface-variant text-xs">{location.area || "Area"}, {location.district || "District"}</p>
              </div>
            )}
            {location.status === "error" && (
              <div className="rounded-xl bg-error/5 border border-error/20 p-4 mt-3">
                <p className="text-error text-sm">
                  <T
                    en="❌ Could not detect location. Please allow location access and try again."
                    ta="❌ இருப்பிடத்தைக் கண்டறிய முடியவில்லை. தயவுசெய்து இருப்பிட அனுமதியை வழங்கி மீண்டும் முயலவும்."
                  />
                </p>
              </div>
            )}
          </div>

          {/* Section 5 — Cart Photos */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">
              <T en="Cart Photos" ta="வண்டி புகைப்படங்கள்" />
            </h2>
            <p className={`${helperClass} mb-3`}>
              <T en="Add 2–5 clear photos of your cart" ta="உங்கள் வண்டியின் 2-5 தெளிவான புகைப்படங்களைச் சேர்க்கவும்" />
            </p>

            <div className="relative border-2 border-dashed border-outline-variant/40 rounded-xl bg-surface-container p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-3xl text-primary mb-1">📷</div>
              <p className="font-semibold text-on-surface text-sm mt-2">
                <T en="Tap to add cart photos" ta="புகைப்படங்களைச் சேர்க்க தட்டவும்" />
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                <T en="PNG, JPG, WEBP · Up to 5 photos · Max 5MB each" ta="PNG, JPG, WEBP · 5 புகைப்படங்கள் வரை · தலா 5MB அதிகபட்சம்" />
              </p>
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
              <p className={helperClass}>
                <T
                  en={`Add at least ${2 - totalPhotos} more photo${2 - totalPhotos === 1 ? "" : "s"} to continue.`}
                  ta={`தொடர மேலும் குறைந்தபட்சம் ${2 - totalPhotos} புகைப்படங்களைச் சேர்க்கவும்.`}
                />
              </p>
            )}
          </div>

          {/* Section 6 — Additional Details */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-0.5">
              <T en="Additional Details" ta="கூடுதல் விவரங்கள்" />
            </h2>
            <p className={`${helperClass} mb-3`}><T en="(Optional)" ta="(விருப்பத்திற்குரியது)" /></p>
            <label className={labelClass}><T en="Anything else about this cart?" ta="இந்த வண்டியைப் பற்றி வேறு ஏதேனும் கூற விரும்புகிறீர்களா?" /></label>
            <textarea
              rows={3}
              value={formData.additionalDetails}
              onChange={(e) => setFormData((f) => ({ ...f, additionalDetails: e.target.value }))}
              placeholder={lang === "ta" ? "எ.கா. சமீபத்தில் வண்ணம் பூசப்பட்டது, புதிய சக்கரங்கள் பொருத்தப்பட்டது, உடனடியாகக் கிடைக்கும்..." : "e.g. Recently painted, new wheels fitted, available immediately..."}
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
            <span className="text-sm text-on-surface">
              <T en="I confirm I own this cart and have the right to rent it out." ta="இந்த வண்டி எனக்குச் சொந்தமானது என்றும் இதை வாடகைக்கு விட எனக்கு உரிமை உண்டு என்றும் உறுதிப்படுத்துகிறேன்." />
            </span>
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
                {editCartId ? <T en="Saving…" ta="சேமிக்கப்படுகிறது…" /> : <T en="Submitting…" ta="சமர்ப்பிக்கப்படுகிறது…" />}
              </span>
            ) : editCartId ? (
              <T en="SAVE CHANGES" ta="மாற்றங்களைச் சேமிக்கவும்" />
            ) : (
              <T en="SUBMIT LISTING REQUEST" ta="வண்டியைப் பதிவிட சமர்ப்பிக்கவும்" />
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
