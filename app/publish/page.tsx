"use client";

import { useState, useEffect, Suspense, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  AlertCircle,
  Store,
  X,
  Check,
  CreditCard,
  ShieldCheck,
  Plus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Crown,
  Zap,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  saveCart,
  updateCartAction,
  getCartByIdAction,
  getUserSubscriptionAction,
  createSubscriptionAction,
  getOwnerListingUsageAction,
} from "@/app/actions";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase-browser";
import {
  LISTING_PLANS,
  PLANS_LIST,
  PlanTier,
  BillingCycle,
  ListingPlan,
  getPlan,
  getPlanPricing,
  formatCurrency,
} from "@/lib/plans";
import { RazorpayPlanCheckout } from "@/components/payment/razorpay-plan-checkout";
import { Button } from "@/components/ui/button";

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
                "User-Agent": "NammaThalluvandi/1.0",
              },
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
              district: json.principalSubdivision || json.city || "",
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
  const forcePlanSelect = searchParams.get("change_plan") === "true";
  const supabase = useMemo(() => createClient(), []);

  const { user, isVendor, vendorProfile, loading: authLoading } = useAuth();
  const [lang, setLang] = useState<"en" | "ta">("en");

  // Sync language toggle dynamically with DOM mutations
  useEffect(() => {
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

  // Flow State: "loading" | "plan_select" | "review_payment" | "cart_form" | "submitted_success"
  const [currentStep, setCurrentStep] = useState<
    "loading" | "plan_select" | "review_payment" | "cart_form" | "submitted_success"
  >("loading");

  // Subscription state
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [usageStats, setUsageStats] = useState({
    totalListings: 0,
    remainingListings: 0,
    maxCarts: 0,
    canPublish: false,
  });

  // Selected Plan state
  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier>("growth");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("1_month");

  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  // Cart Form State
  const [formData, setFormData] = useState({
    cartType: "",
    condition: "",
    size: "",
    stoveType: "None",
    dailyRent: "",
    isForRent: true,
    isForSale: false,
    salePrice: "",
    negotiable: false,
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
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Load user subscription and listing usage
  const fetchUsageData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getOwnerListingUsageAction(user.id);
      if (res.success && res.data) {
        setUserSubscription(res.data.subscription);
        setUsageStats({
          totalListings: res.data.totalListings,
          remainingListings: res.data.remainingListings,
          maxCarts: res.data.maxCarts,
          canPublish: res.data.canPublish,
        });

        // Determine step based on subscription
        if (editCartId) {
          setCurrentStep("cart_form");
        } else if (forcePlanSelect) {
          setCurrentStep("plan_select");
        } else if (res.data.canPublish) {
          setCurrentStep("cart_form");
        } else if (res.data.subscription && res.data.remainingListings <= 0) {
          // Limit reached, prompt upgrade
          setCurrentStep("plan_select");
        } else {
          // No active plan yet
          setCurrentStep("plan_select");
        }
      } else {
        setCurrentStep("plan_select");
      }
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
      setCurrentStep("plan_select");
    }
  }, [user, editCartId, forcePlanSelect]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsageData();
    }
  }, [authLoading, user, fetchUsageData]);

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
          isForRent: c.is_for_rent ?? true,
          isForSale: c.is_for_sale ?? false,
          salePrice: String(c.sale_price ?? ""),
          negotiable: c.negotiable ?? false,
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
        setConfirmed(true);
        setCurrentStep("cart_form");
      }
      setEditLoading(false);
    });
  }, [editCartId]);

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
    (formData.isForRent ? formData.dailyRent.trim() !== "" && formData.minRentalPeriod !== "" : true) &&
    (formData.isForSale ? formData.salePrice.trim() !== "" : true) &&
    formData.availableFrom !== "" &&
    location.status === "success" &&
    confirmed &&
    (editCartId ? true : totalPhotos >= 2);

  // Handle Verified Razorpay Payment Success
  const handlePaymentSuccess = async (subscription: any) => {
    if (!user) return;
    try {
      setUserSubscription(subscription);
      await fetchUsageData();
      // Redirect immediately into the cart listing submission form
      setCurrentStep("cart_form");
    } catch (err: any) {
      console.error("Subscription activation failed:", err);
      setError("Subscription activation error. Please contact support.");
    }
  };

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
          const fileExt = file.name.substring(file.name.lastIndexOf(".")) || ".jpg";
          const filename = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;

          const { data, error: uploadErr } = await supabase.storage.from("carts").upload(filename, file);

          if (uploadErr) {
            throw new Error(`Failed to upload ${file.name}: ${uploadErr.message}`);
          }

          if (data) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("carts").getPublicUrl(filename);
            uploadedUrls.push(publicUrl);
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
          price_per_day: formData.isForRent ? Number(formData.dailyRent) : undefined,
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
          pricePerDay: formData.isForRent ? Number(formData.dailyRent) || 80 : 0,
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
          isForRent: formData.isForRent,
          isForSale: formData.isForSale,
          salePrice: formData.isForSale ? Number(formData.salePrice) || 0 : undefined,
          negotiable: formData.negotiable,
        });
        if (!res.success) throw new Error(res.error || "Failed to save cart");
        setCurrentStep("submitted_success");
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
      isForRent: true,
      isForSale: false,
      salePrice: "",
      negotiable: false,
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
    fetchUsageData();
  };

  // ── Auth Loading Screen ──
  if (authLoading || currentStep === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-on-surface-variant font-medium">
            <T en="Loading listing portal…" ta="பட்டியல் தளம் ஏற்றப்படுகிறது…" />
          </p>
        </div>
      </main>
    );
  }

  // ── 1. Not Logged In Screen ──
  if (!user) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 text-primary">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface mb-2">
            <T en="Sign In to Publish Your Cart" ta="உங்கள் வண்டியைப் பட்டியலிட உள்நுழையவும்" />
          </h1>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            <T
              en="Join hundreds of food cart owners in Coimbatore & Tiruppur. Select a listing plan, complete secure verification, and start receiving verified rental bookings."
              ta="கோவை மற்றும் திருப்பூர் மாவட்டத்தின் முன்னணி உணவு வண்டி உரிமையாளர்களுடன் இணையுங்கள். திட்டத்தைத் தேர்வு செய்து நேரடி வாடகை முன்பதிவுகளைப் பெறுங்கள்."
            />
          </p>
          <Link
            href="/login?redirect=/publish"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition shadow-md"
          >
            <LogIn className="w-4 h-4" /> <T en="Login / Register" ta="உள்நுழைய / பதிவு செய்ய" />
          </Link>
        </div>
      </main>
    );
  }

  // ── 2. No Vendor Profile Screen ──
  if (!isVendor) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 text-primary">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface mb-2">
            <T en="Create Vendor Profile First" ta="முதலில் விற்பனையாளர் சுயவிவரத்தை உருவாக்கவும்" />
          </h1>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-left mb-6">
            <AlertCircle className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <T
                en="To publish a food cart, you first need to register your owner profile. It takes less than 2 minutes."
                ta="வண்டியைப் பட்டியலிட, முதலில் உங்கள் விற்பனையாளர் சுயவிவரத்தை உருவாக்க வேண்டும். இதற்கு 2 நிமிடங்கள் மட்டுமே ஆகும்."
              />
            </p>
          </div>
          <Link
            href="/vendor/register"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition shadow-md"
          >
            <Store className="w-4 h-4" /> <T en="Create Owner Profile" ta="சுயவிவரத்தை உருவாக்கவும்" />
          </Link>
        </div>
      </main>
    );
  }

  // ── 3. Submission Success Screen (With Verification Lifecycle) ──
  if (currentStep === "submitted_success") {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
            <T en="Listing Submitted for Verification!" ta="சரிபார்ப்பிற்காக சமர்ப்பிக்கப்பட்டது!" />
          </h2>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            <T
              en="Your food cart listing has been submitted. Our team will review the details and approve your listing within 24 hours."
              ta="உங்கள் உணவு வண்டி விவரங்கள் சமர்ப்பிக்கப்பட்டுள்ளன. எங்கள் குழு 24 மணி நேரத்திற்குள் சரிபார்த்து நேரலையில் வெளியிடும்."
            />
          </p>

          {/* Verification Lifecycle Progression */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 mb-6 text-left space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              <T en="Verification Lifecycle" ta="சரிபார்ப்பு நிலை" />
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-600 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">✓</span>
              <span><T en="Payment Completed" ta="கட்டணம் செலுத்தப்பட்டது" /></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-600 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">✓</span>
              <span><T en="Cart Details Submitted" ta="வண்டி விவரங்கள் சமர்ப்பிக்கப்பட்டது" /></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-amber-600 font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 animate-pulse">⏳</span>
              <span><T en="Pending NTV Verification (Under Review)" ta="சரிபார்ப்பு நிலுவையில் உள்ளது (ஆய்வில்)" /></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant/50 font-medium">
              <span className="w-5 h-5 rounded-full bg-outline-variant/20 flex items-center justify-center shrink-0">4</span>
              <span><T en="Approved & Published Live on Explore" ta="ஒப்புதல் பெற்று நேரலையில் வெளியிடப்படும்" /></span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md"
            >
              <Link href="/vendor/dashboard">
                <T en="VIEW IN VENDOR DASHBOARD" ta="விற்பனையாளர் கணக்கில் பார்க்க" />
              </Link>
            </Button>
            {usageStats.remainingListings > 1 && (
              <Button
                variant="outline"
                onClick={resetForm}
                className="w-full py-3.5 h-auto rounded-xl border-outline-variant/40 hover:bg-surface-container text-sm font-semibold"
              >
                <T
                  en={`List Another Cart (${usageStats.remainingListings - 1} remaining)`}
                  ta={`மற்றொரு வண்டியைச் சேர்க்கவும் (${usageStats.remainingListings - 1} மீதமுள்ளது)`}
                />
              </Button>
            )}
            <Link href="/explore" className="text-primary text-sm font-semibold text-center mt-2 hover:underline">
              <T en="Browse All Marketplace Carts →" ta="அனைத்து வண்டிகளையும் பார்க்க →" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Review & Payment Step ──
  if (currentStep === "review_payment") {
    const selectedPlan = getPlan(selectedPlanId);
    const pricing = getPlanPricing(selectedPlan.id, billingCycle);

    return (
      <main className="min-h-screen bg-background pt-20 pb-16 px-4">
        <div className="w-full max-w-lg mx-auto">
          {/* Back button */}
          <button
            onClick={() => setCurrentStep("plan_select")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> <T en="Back to Plan Selection" ta="திட்டம் தேர்வுக்கு திரும்பவும்" />
          </button>

          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-on-surface mb-2">
              <T en="Review & Complete Payment" ta="சரிபார்த்து கட்டணம் செலுத்தவும்" />
            </h1>
            <p className="text-on-surface-variant text-sm">
              <T en="Secure checkout powered by Razorpay Test Gateway" ta="ரேசர்பே பாதுகாப்பான கட்டண தளம்" />
            </p>
          </div>

          {/* Plan Summary Card */}
          <div className="bg-surface rounded-3xl p-6 border border-outline-variant/30 shadow-sm mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: selectedPlan.bgHex, color: selectedPlan.accentHex }}>
                {selectedPlan.badgeEn}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {selectedPlan.maxCarts} <T en="Carts Allowed" ta="வண்டிகள் அனுமதிக்கப்படுகிறது" />
              </span>
            </div>

            <div className="border-t border-b border-outline-variant/20 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant"><T en="Plan Duration" ta="திட்ட காலம்" /></span>
                <span className="font-semibold text-on-surface">
                  {billingCycle === "1_month" ? <T en="1 Month (30 Days)" ta="1 மாதம் (30 நாட்கள்)" /> : <T en="3 Months (90 Days)" ta="3 மாதங்கள் (90 நாட்கள்)" />}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant"><T en="Listing Quota" ta="பட்டியல் வரம்பு" /></span>
                <span className="font-semibold text-on-surface">Up to {selectedPlan.maxCarts} food carts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant"><T en="WhatsApp Inquiries" ta="வாட்ஸ்அப் விசாரணைகள்" /></span>
                <span className="font-semibold text-emerald-600"><T en="Unlimited" ta="வரம்பற்றது" /></span>
              </div>
              {pricing.savingsNoteEn && (
                <div className="flex justify-between text-xs text-emerald-600 font-semibold bg-emerald-500/10 p-2.5 rounded-xl">
                  <span><T en="Plan Discount Applied" ta="தள்ளுபடி பயன்படுத்தப்பட்டது" /></span>
                  <span><T en={pricing.savingsNoteEn} ta={pricing.savingsNoteTa || ""} /></span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-base font-bold text-on-surface"><T en="Total Amount" ta="மொத்த தொகை" /></span>
              <span className="text-3xl font-black font-display text-primary">{formatCurrency(pricing.price)}</span>
            </div>
          </div>

          {/* Razorpay Component */}
          <RazorpayPlanCheckout
            plan={selectedPlan}
            billingCycle={billingCycle}
            user={{
              id: user.id,
              name: vendorProfile?.full_name || vendorProfile?.shop_name || user.email,
              email: user.email,
              phone: vendorProfile?.whatsapp_number || vendorProfile?.phone,
            }}
            vendorId={vendorProfile?.id}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentStep("plan_select")}
          />
        </div>
      </main>
    );
  }

  // ── 6. Plan Selection Step (Dynamic Pricing Cards) ──
  if (currentStep === "plan_select") {
    const isLimitReached = userSubscription && usageStats.remainingListings <= 0;

    return (
      <main className="min-h-screen bg-background pt-20 pb-20 px-4">
        <div className="w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            {isLimitReached ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-bold mb-4 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <T
                  en={`Listing Limit Reached (${usageStats.totalListings}/${usageStats.maxCarts} used)`}
                  ta={`வரம்பு முடிந்தது (${usageStats.totalListings}/${usageStats.maxCarts} பயன்படுத்தப்பட்டது)`}
                />
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-4 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <T en="Choose Your Listing Plan" ta="உங்கள் திட்டத்தைத் தேர்ந்தெடுக்கவும்" />
              </div>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface mb-3 tracking-tight">
              {isLimitReached ? (
                <T en="Upgrade Plan to List More Carts" ta="கூடுதல் வண்டிகளைச் சேர்க்க திட்டத்தை உயர்த்தவும்" />
              ) : (
                <T en="Publish Your Cart on Namma Thalluvandi" ta="உங்கள் தள்ளுவண்டியை எளிதாகப் பட்டியலிடுங்கள்" />
              )}
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              <T
                en="Connect directly with thousands of street food entrepreneurs looking to rent or buy food carts in Coimbatore, Tiruppur & across Tamil Nadu."
                ta="கோயம்புத்தூர் மற்றும் திருப்பூர் பகுதிகளில் உணவு வண்டிகளை வாடகைக்கு எடுக்க அல்லது வாங்க விரும்பும் ஆயிரக்கணக்கான தொழில்முனைவோருடன் நேரடியாக இணையுங்கள்."
              />
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-surface border border-outline-variant/30 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle("1_month")}
                className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  billingCycle === "1_month"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <T en="1 Month Plan" ta="1 மாத திட்டம்" />
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("3_months")}
                className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all relative ${
                  billingCycle === "3_months"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <T en="3 Months Plan" ta="3 மாத திட்டம்" />
                <span className="ml-1.5 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase font-black tracking-wider">
                  <T en="SAVE" ta="சேமிப்பு" />
                </span>
              </button>
            </div>
          </div>

          {/* 3 Dynamic Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS_LIST.map((plan) => {
              const pricing = getPlanPricing(plan.id, billingCycle);
              const isSelected = selectedPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                    plan.isRecommended
                      ? "bg-surface border-2 border-primary shadow-xl md:-translate-y-2 ring-4 ring-primary/10"
                      : "bg-surface border border-outline-variant/30 hover:border-outline-variant/60 shadow-sm"
                  }`}
                >
                  {/* Recommended Ribbon */}
                  {plan.isRecommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> <T en="RECOMMENDED" ta="பரிந்துரைக்கப்படுகிறது" />
                    </div>
                  )}

                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: plan.bgHex, color: plan.accentHex }}
                      >
                        {plan.badgeEn}
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">
                        {plan.maxCarts} <T en="Carts Max" ta="வண்டிகள் வரை" />
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-on-surface mb-2">
                      <T en={plan.nameEn} ta={plan.nameTa} />
                    </h3>

                    {/* Price */}
                    <div className="my-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-black text-on-surface">
                          {formatCurrency(pricing.price)}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          / {billingCycle === "1_month" ? <T en="month" ta="மாதம்" /> : <T en="3 months" ta="3 மாதங்கள்" />}
                        </span>
                      </div>
                      {pricing.savingsNoteEn && (
                        <p className="text-xs text-emerald-600 font-bold mt-1">
                          ✓ <T en={pricing.savingsNoteEn} ta={pricing.savingsNoteTa || ""} />
                        </p>
                      )}
                    </div>

                    {/* Features checklist */}
                    <div className="border-t border-outline-variant/20 pt-5 mt-5 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        <T en="What's Included:" ta="சேர்க்கப்பட்டுள்ளவை:" />
                      </p>
                      <ul className="space-y-2.5">
                        {plan.featuresEn.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>
                              <span className="en">{feat}</span>
                              <span className="ta tamil-text">{plan.featuresTa[idx] || feat}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Select CTA */}
                  <div className="pt-8">
                    <Button
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setCurrentStep("review_payment");
                      }}
                      className={`w-full py-4 h-auto rounded-xl font-bold text-sm uppercase tracking-wider shadow-sm transition active:scale-[0.99] ${
                        plan.isRecommended
                          ? "bg-primary hover:bg-primary/90 text-on-primary"
                          : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40"
                      }`}
                    >
                      <T
                        en={`Choose ${plan.nameEn} (${formatCurrency(pricing.price)})`}
                        ta={`${plan.nameTa} தேர்ந்தெடு (${formatCurrency(pricing.price)})`}
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification note */}
          <div className="mt-12 p-6 rounded-2xl bg-surface-container border border-outline-variant/20 max-w-2xl mx-auto text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <T en="Manual Quality & Authenticity Review" ta="தர மற்றும் நம்பகத்தன்மை சரிபார்ப்பு" />
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <T
                en="All cart listings undergo manual inspection by the NTV operations team before becoming public to ensure safe and genuine transactions for all vendors."
                ta="அனைத்து வண்டிகளும் வாடகைக்கு வெளியிடப்படுவதற்கு முன் நம்ம தள்ளுவண்டி குழுவால் சரிபார்க்கப்பட்டு பின்னர் நேரலையில் வைக்கப்படும்."
              />
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── 7. Cart Submission Form ──
  const vendorName = vendorProfile?.full_name || vendorProfile?.shop_name || "Vendor";
  const vendorPhoto = vendorProfile?.profile_photo_url;
  const vendorArea = vendorProfile?.area;
  const vendorDistrict = vendorProfile?.district;
  const activePlan = userSubscription ? getPlan(userSubscription.plan_id) : null;

  return (
    <main className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="w-full max-w-[620px] mx-auto">
        {/* Active Plan Usage Banner */}
        {activePlan && (
          <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 mb-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base"
                style={{ background: activePlan.bgHex, color: activePlan.accentHex }}
              >
                🛒
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">
                  <T en="Active Plan:" ta="செயலில் உள்ள திட்டம்:" />{" "}
                  <strong className="text-on-surface">{activePlan.nameEn}</strong>
                </p>
                <p className="text-sm font-bold text-on-surface font-display">
                  {usageStats.totalListings} / {usageStats.maxCarts}{" "}
                  <T en="Listings Used" ta="வண்டிகள் பயன்படுத்தப்பட்டது" /> (
                  <span className="text-emerald-600">{usageStats.remainingListings} <T en="remaining" ta="மீதம்" /></span>)
                </p>
              </div>
            </div>
            <Link
              href="/publish?change_plan=true"
              className="text-xs text-primary font-bold hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
            >
              <T en="Change Plan" ta="திட்டம் மாற்ற" />
            </Link>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold text-on-surface mb-1.5">
            {editCartId ? (
              <T en="Edit Cart Listing" ta="வண்டி விவரங்களை மாற்றியமைக்கவும்" />
            ) : (
              <T en="Submit Cart for Verification" ta="வண்டி விவரங்களை சமர்ப்பிக்கவும்" />
            )}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {editCartId ? (
              <T en="Update your listing details" ta="உங்கள் வண்டியின் விவரங்களைப் புதுப்பிக்கவும்" />
            ) : (
              <T en="Reviewed & published within 24 hours" ta="24 மணி நேரத்திற்குள் சரிபார்க்கப்படும்" />
            )}
          </p>
        </div>

        {/* Listing as Vendor Profile Card */}
        <div className="bg-surface rounded-2xl p-4 mb-6 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
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
              📍 {vendorArea && vendorDistrict ? `${vendorArea} · ${vendorDistrict}` : <T en="Coimbatore / Tiruppur" ta="கோவை / திருப்பூர்" />}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1 — Cart Type & Specs */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-4">
              <T en="1. Cart Details" ta="1. வண்டியின் விவரங்கள்" />
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

          {/* Section 2 — Listing Intent & Pricing */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-3">
              <T en="2. Listing Intent & Pricing" ta="2. வாடகை & விற்பனை விவரங்கள்" />
            </h2>

            {/* Rent / Sale checkboxes */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface cursor-pointer flex-1 hover:border-primary/40 transition">
                <input
                  type="checkbox"
                  checked={formData.isForRent}
                  onChange={(e) => setFormData((f) => ({ ...f, isForRent: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-semibold text-on-surface">
                  <T en="Available for Rent" ta="வாடகைக்கு உண்டு" />
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface cursor-pointer flex-1 hover:border-primary/40 transition">
                <input
                  type="checkbox"
                  checked={formData.isForSale}
                  onChange={(e) => setFormData((f) => ({ ...f, isForSale: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-semibold text-on-surface">
                  <T en="Available for Sale" ta="விற்பனைக்கு உண்டு" />
                </span>
              </label>
            </div>

            {formData.isForRent && (
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 mb-4 space-y-4">
                <div>
                  <label className={labelClass}><T en="Daily Rent (₹) *" ta="தினசரி வாடகை (₹) *" /></label>
                  <input
                    type="number"
                    min={0}
                    value={formData.dailyRent}
                    onChange={(e) => setFormData((f) => ({ ...f, dailyRent: e.target.value }))}
                    placeholder="e.g. 80"
                    className={inputClass}
                  />
                  <p className={helperClass}>
                    <T en="💡 Standard carts rent for ₹60 – ₹120/day in Coimbatore" ta="💡 கோவையில் சராசரி வாடகை ₹60 - ₹120/நாள்" />
                  </p>
                </div>

                <div>
                  <label className={labelClass}><T en="Minimum Rental Period *" ta="குறைந்தபட்ச வாடகை காலம் *" /></label>
                  <div className="flex flex-wrap gap-2">
                    {RENTAL_PERIOD_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, minRentalPeriod: o.value }))}
                        className={
                          formData.minRentalPeriod === o.value
                            ? "bg-primary text-on-primary rounded-full px-5 py-2 text-xs font-bold"
                            : "bg-surface border border-outline-variant rounded-full px-5 py-2 text-xs text-on-surface-variant cursor-pointer hover:border-primary/50 transition"
                        }
                      >
                        {lang === "ta" ? o.ta : o.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.isForSale && (
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 mb-4 space-y-3">
                <div>
                  <label className={labelClass}><T en="Sale Price (₹) *" ta="விற்பனை விலை (₹) *" /></label>
                  <input
                    type="number"
                    min={0}
                    value={formData.salePrice}
                    onChange={(e) => setFormData((f) => ({ ...f, salePrice: e.target.value }))}
                    placeholder="e.g. 25000"
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.negotiable}
                    onChange={(e) => setFormData((f) => ({ ...f, negotiable: e.target.checked }))}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-xs font-medium text-on-surface">
                    <T en="Price is Negotiable" ta="விலை பேசிக்கொள்ளலாம்" />
                  </span>
                </label>
              </div>
            )}

            <div>
              <label className={labelClass}><T en="Available From *" ta="கிடைக்கும் தேதி *" /></label>
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
              <T en="3. Equipment Included" ta="3. வண்டியிலுள்ள உபகரணங்கள்" />
            </h2>
            <p className={`${helperClass} mb-3`}>
              <T en="Select all available features" ta="வண்டியில் உள்ள அனைத்து வசதிகளையும் தேர்வு செய்க" />
            </p>
            <div className="grid grid-cols-2 gap-2">
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
                  <span className="text-xs text-on-surface">
                    {lang === "ta" ? o.ta : o.en}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4 — Cart Location */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">
              <T en="4. Cart Location" ta="4. வண்டி இருக்கும் இடம்" />
            </h2>
            <p className={`${helperClass} mb-3`}>
              <T en="Where is your food cart currently stored?" ta="தற்போது வண்டி எங்கு உள்ளது?" />
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
                <T en="Detecting GPS…" ta="GPS கண்டறியப்படுகிறது…" />
              ) : (
                <T en="Detect Current GPS Location" ta="நேரடி GPS இருப்பிடத்தைப் பெறுக" />
              )}
            </button>

            {location.status === "success" && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mt-3">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-1">
                  ✅ <T en="Location Set" ta="இருப்பிடம் அமைக்கப்பட்டது" />
                </div>
                <p className="text-on-surface-variant text-xs">{location.area || "Area"}, {location.district || "District"}</p>
              </div>
            )}
          </div>

          {/* Section 5 — Photos */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-1">
              <T en="5. Cart Photos" ta="5. வண்டி புகைப்படங்கள்" />
            </h2>
            <p className={`${helperClass} mb-3`}>
              <T en="Add 2–5 clear photos (Front angle, side view, stove area)" ta="2-5 தெளிவான புகைப்படங்களைச் சேர்க்கவும்" />
            </p>

            <div className="relative border-2 border-dashed border-outline-variant/40 rounded-2xl bg-surface-container p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-3xl text-primary mb-1">📷</div>
              <p className="font-semibold text-on-surface text-sm mt-2">
                <T en="Tap to upload cart photos" ta="புகைப்படங்களைச் சேர்க்க தட்டவும்" />
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                <T en="PNG, JPG, WEBP · Up to 5 photos · Max 5MB each" ta="5 புகைப்படங்கள் வரை · தலா 5MB அதிகபட்சம்" />
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
                      className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full"
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
                      className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full"
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

          {/* Section 6 — Description */}
          <div className={sectionClass}>
            <h2 className="font-display text-base font-bold text-on-surface mb-0.5">
              <T en="6. Additional Description" ta="6. கூடுதல் விவரங்கள்" />
            </h2>
            <p className={`${helperClass} mb-3`}><T en="(Optional)" ta="(விருப்பத்திற்குரியது)" /></p>
            <textarea
              rows={3}
              value={formData.additionalDetails}
              onChange={(e) => setFormData((f) => ({ ...f, additionalDetails: e.target.value }))}
              placeholder={lang === "ta" ? "எ.கா. சமீபத்தில் வண்ணம் பூசப்பட்டது, உடனடியாகக் கிடைக்கும்..." : "e.g. Recently serviced, clean counter, ready for immediate handover..."}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Section 7 — Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 px-1 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="accent-primary w-4 h-4 mt-0.5"
            />
            <span className="text-xs text-on-surface leading-relaxed">
              <T
                en="I confirm I am the legal owner of this food cart and all provided specifications and photographs are accurate."
                ta="இந்த வண்டி எனக்குச் சொந்தமானது என்றும் வழங்கப்பட்ட விவரங்கள் உண்மையானவை என்றும் உறுதிப்படுத்துகிறேன்."
              />
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || submitLoading}
            className="w-full py-4 h-auto rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm uppercase tracking-widest shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                <T en="Submitting Cart…" ta="சமர்ப்பிக்கப்படுகிறது…" />
              </span>
            ) : editCartId ? (
              <T en="SAVE CHANGES" ta="மாற்றங்களைச் சேமிக்கவும்" />
            ) : (
              <T en="SUBMIT FOR VERIFICATION" ta="சரிபார்ப்பிற்கு சமர்ப்பிக்கவும்" />
            )}
          </Button>
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
