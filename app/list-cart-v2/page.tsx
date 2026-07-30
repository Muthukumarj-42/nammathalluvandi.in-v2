"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogIn, 
  AlertCircle, 
  Store, 
  MapPin, 
  Camera, 
  IndianRupee, 
  Compass, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  X,
  RefreshCw,
  Info
} from "lucide-react";
import { saveCart } from "@/app/actions";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase-browser";
import { Baloo_2, Poppins } from "next/font/google";

// Configure Google Fonts local to this view to isolate visual presentation
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

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

const SIZE_OPTIONS = [
  { value: "Small (3 ft)", label: "Small (3 ft)" },
  { value: "Medium (4 ft)", label: "Medium (4 ft)" },
  { value: "Large (5 ft)", label: "Large (5 ft)" },
  { value: "Extra Large (6 ft)", label: "Extra Large (6 ft)" },
];

const STOVE_OPTIONS = [
  { value: "None", label: "None" },
  { value: "Single Burner", label: "Single Burner" },
  { value: "Double Burner", label: "Double Burner" },
  { value: "Triple Burner", label: "Triple Burner" },
];

const RENTAL_PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
];

const SUGGESTED_ANGLES = [
  { index: 0, label: "Front Angle" },
  { index: 1, label: "Side View" },
  { index: 2, label: "Stove View" },
  { index: 3, label: "Extra View 1" },
  { index: 4, label: "Extra View 2" },
  { index: 5, label: "Extra View 3" },
];

type GeoState = {
  status: "idle" | "loading" | "success" | "error";
  latitude: number | null;
  longitude: number | null;
  area: string;
  district: string;
  address: string;
};

const EMPTY_GEO: GeoState = { status: "idle", latitude: null, longitude: null, area: "", district: "", address: "" };

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

function ListCartV2Content() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user, isVendor, vendorProfile, loading: authLoading } = useAuth();

  // Custom styling references:
  // dark green: bg-[#1a3d2e] / text-[#1a3d2e]
  // orange accent: bg-[#e8732c] / text-[#e8732c]
  // cream background: bg-[#ece4d1]
  // cream card: bg-[#f5f0e6]
  // muted green text: text-[#6b7d72]
  // border tan: border-[#e8dfc8]

  // Flow State
  const [step, setStep] = useState<number>(0); // 0: Landing, 1 to 6 steps
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Intent
  const [intentRent, setIntentRent] = useState(true);
  const [intentSale, setIntentSale] = useState(false);

  // Step 2: Details
  const [cartType, setCartType] = useState("");
  const [condition, setCondition] = useState("");
  const [cartSize, setCartSize] = useState("");
  const [stoveType, setStoveType] = useState("");

  // Step 3: Pricing
  const [dailyRent, setDailyRent] = useState("");
  const [minRentalPeriod, setMinRentalPeriod] = useState("daily");
  const [salePrice, setSalePrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);

  // Step 4: Location
  const [location, setLocation] = useState<GeoState>(EMPTY_GEO);

  // Step 5: Photos (Drag & Drop sorting)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // File Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const totalAllowed = 6;
    if (selectedFiles.length + files.length > totalAllowed) {
      setError(`You can only upload up to ${totalAllowed} photos in total.`);
      return;
    }
    setError("");
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag-and-Drop Sorting Helpers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    // Swap items
    const tempFile = newFiles[draggedIndex];
    newFiles[draggedIndex] = newFiles[index];
    newFiles[index] = tempFile;

    const tempPreview = newPreviews[draggedIndex];
    newPreviews[draggedIndex] = newPreviews[index];
    newPreviews[index] = tempPreview;

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setDraggedIndex(null);
  };

  // GPS trigger
  const handleGpsDetect = async () => {
    setLocation((l) => ({ ...l, status: "loading" }));
    const result = await detectGpsLocation();
    if (!result) {
      setLocation((l) => ({ ...l, status: "error" }));
      return;
    }
    setLocation({
      status: "success",
      latitude: result.latitude,
      longitude: result.longitude,
      area: result.area,
      district: result.district,
      address: `${result.area}, ${result.district}`,
    });
  };

  const handleUseProfileLocation = () => {
    if (!vendorProfile?.latitude || !vendorProfile?.longitude) {
      setError("Your profile doesn't have a saved location yet.");
      return;
    }
    setLocation({
      status: "success",
      latitude: vendorProfile.latitude,
      longitude: vendorProfile.longitude,
      area: vendorProfile.area || "",
      district: vendorProfile.district || "",
      address: `${vendorProfile.area || ""}, ${vendorProfile.district || ""}`.trim(),
    });
  };

  // Validate step navigation
  const isStepValid = useMemo(() => {
    if (step === 1) {
      return intentRent || intentSale;
    }
    if (step === 2) {
      return cartType !== "" && condition !== "" && cartSize !== "" && stoveType !== "";
    }
    if (step === 3) {
      if (intentRent && !dailyRent) return false;
      if (intentSale && !salePrice) return false;
      return true;
    }
    if (step === 4) {
      return location.status === "success" || location.address.trim() !== "";
    }
    if (step === 5) {
      return selectedFiles.length >= 2;
    }
    return true;
  }, [step, intentRent, intentSale, cartType, condition, cartSize, stoveType, dailyRent, salePrice, location, selectedFiles]);

  // Form Submission
  const handleSubmit = async () => {
    if (!user || !isStepValid) return;
    setSubmitLoading(true);
    setError("");

    try {
      // 1. Upload photos to Supabase Storage
      const uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.substring(file.name.lastIndexOf(".")) || ".jpg";
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
      }

      // 2. Submit saved cart request
      const res = await saveCart({
        nameEn: cartType,
        nameTa: cartType,
        type: cartType,
        pricePerDay: intentRent ? Number(dailyRent) : 0,
        depositAmount: intentRent ? 2000 : 0,
        availableCount: 1,
        descriptionEn: `Self-listed cart for ${intentRent && intentSale ? "rent & sale" : intentRent ? "rent" : "sale"}.`,
        descriptionTa: `Self-listed cart for ${intentRent && intentSale ? "rent & sale" : intentRent ? "rent" : "sale"}.`,
        vendorName: vendorProfile?.full_name || vendorProfile?.shop_name || "Vendor",
        vendorPhone: vendorProfile?.whatsapp_number || vendorProfile?.phone || "",
        vendorLocation: location.address,
        latitude: location.latitude || 11.0267,
        longitude: location.longitude || 77.0089,
        condition,
        size: cartSize,
        stoveType,
        minRentalPeriod: intentRent ? minRentalPeriod : undefined,
        availableFrom: new Date().toISOString().slice(0, 10),
        equipment: [],
        area: location.area || location.address,
        district: location.district || "",
        vendorId: vendorProfile?.id,
        ownerId: user.id,
        photos: uploadedUrls,
        isForRent: intentRent,
        isForSale: intentSale,
        salePrice: intentSale ? Number(salePrice) : undefined,
        negotiable: intentSale ? negotiable : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit cart listing");
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setIntentRent(true);
    setIntentSale(false);
    setCartType("");
    setCondition("");
    setCartSize("");
    setStoveType("");
    setDailyRent("");
    setMinRentalPeriod("daily");
    setSalePrice("");
    setNegotiable(false);
    setLocation(EMPTY_GEO);
    setSelectedFiles([]);
    setPreviews([]);
    setSubmitSuccess(false);
    setError("");
  };

  // Auth Loading
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#ece4d1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-[#1a3d2e] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#1a3d2e] font-semibold text-sm font-body">Loading NTV Portal...</span>
        </div>
      </main>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <main className="min-h-screen bg-[#ece4d1] pt-24 pb-16 px-4 flex items-center justify-center font-body">
        <div className="max-w-md w-full text-center bg-[#f5f0e6] p-8 rounded-[24px] border border-[#e8dfc8] shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#1a3d2e]/10 flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-8 h-8 text-[#1a3d2e]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1a3d2e] mb-3">Sign In to Continue</h1>
          <p className="text-[#6b7d72] text-sm mb-8 leading-relaxed">
            You need a registered account to publish or manage food cart listings on Namma Thalluvandi.
          </p>
          <Link href="/login?redirect=/list-cart-v2" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-[14px] bg-[#e8732c] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#e8732c]/90 transition shadow-md">
            <LogIn className="w-4 h-4" /> Login / Register
          </Link>
        </div>
      </main>
    );
  }

  // No Vendor Profile
  if (!isVendor) {
    return (
      <main className="min-h-screen bg-[#ece4d1] pt-24 pb-16 px-4 flex items-center justify-center font-body">
        <div className="max-w-md w-full text-center bg-[#f5f0e6] p-8 rounded-[24px] border border-[#e8dfc8] shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#1a3d2e]/10 flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8 text-[#1a3d2e]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1a3d2e] mb-3">Create Vendor Profile</h1>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#e8dfc8] text-left mb-6">
            <AlertCircle className="w-5 h-5 text-[#e8732c] shrink-0 mt-0.5" />
            <p className="text-sm text-[#6b7d72] leading-relaxed">
              To start listing your carts, you first need to set up a free vendor profile containing your business context.
            </p>
          </div>
          <Link href="/vendor/register" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-[14px] bg-[#e8732c] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#e8732c]/90 transition shadow-md">
            <Store className="w-4 h-4" /> Create Vendor Profile
          </Link>
        </div>
      </main>
    );
  }

  // Success Screen
  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-[#ece4d1] pt-24 pb-16 px-4 flex items-center justify-center font-body">
        <div className="max-w-md w-full text-center bg-[#f5f0e6] p-8 rounded-[28px] border border-[#e8dfc8] shadow-lg">
          <div className="w-20 h-20 rounded-full bg-[#1a3d2e] flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-[#e8dfc8]">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#1a3d2e] mb-2">Listing Submitted!</h1>
          
          <div className="inline-block px-4 py-1.5 bg-[#e8732c]/10 rounded-full border border-[#e8732c]/30 text-[#e8732c] text-xs font-bold uppercase tracking-wider mb-6">
            PENDING REVIEW
          </div>

          <p className="text-[#6b7d72] text-sm leading-relaxed mb-6">
            Our team typically reviews new listings within 24 hours. You'll be notified once your cart goes live.
          </p>

          <div className="bg-white rounded-xl p-4 border border-[#e8dfc8] mb-8 text-left">
            <span className="text-xs font-semibold text-[#6b7d72] uppercase block mb-2">Surfaces where listed:</span>
            <div className="flex gap-2">
              {intentRent && (
                <span className="px-3 py-1 bg-[#1a3d2e]/10 text-[#1a3d2e] text-xs font-bold rounded-full">
                  Explore (Rental)
                </span>
              )}
              {intentSale && (
                <span className="px-3 py-1 bg-[#e8732c]/10 text-[#e8732c] text-xs font-bold rounded-full">
                  Live Sales
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-[14px] bg-[#1a3d2e] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#1a3d2e]/90 transition shadow-md"
          >
            List Another Cart
          </button>
        </div>
      </main>
    );
  }

  // Roadmap node labels
  const stepsList = [
    { num: 1, label: "Intent" },
    { num: 2, label: "Details" },
    { num: 3, label: "Pricing" },
    { num: 4, label: "Location" },
    { num: 5, label: "Photos" },
    { num: 6, label: "Review" }
  ];

  return (
    <div className={`${baloo.variable} ${poppins.variable} min-h-screen bg-[#ece4d1] font-sans antialiased text-[#1a3d2e] pb-24`}>
      {/* ──────────────── SCREEN 0: LANDING ──────────────── */}
      {step === 0 && (
        <main className="max-w-md mx-auto px-4 pt-16 pb-12 flex flex-col items-center">
          {/* Landing Header */}
          <div className="w-full flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#1a3d2e] flex items-center justify-center shadow-sm">
                <Store size={18} className="text-[#e8732c]" />
              </div>
              <span className="font-display font-extrabold text-xl text-[#1a3d2e] tracking-tight">
                Namma Thalluvandi
              </span>
            </div>
            
            {/* EN/TA toggler (Cosmetic) */}
            <button 
              onClick={() => setLang(l => l === "en" ? "ta" : "en")}
              className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#e8dfc8] bg-[#f5f0e6] hover:bg-[#e8dfc8] transition"
            >
              {lang === "en" ? "தமிழ்" : "EN"}
            </button>
          </div>

          {/* Central landing badge */}
          <div className="w-[84px] h-[84px] rounded-full bg-[#1a3d2e] flex items-center justify-center mb-6 shadow-md border-4 border-[#e8dfc8]">
            <Store size={38} className="text-[#e8732c]" />
          </div>

          <h1 className="font-display text-4xl font-extrabold text-center mb-3">
            List Your Cart
          </h1>
          
          <p className="text-center text-[#6b7d72] text-sm leading-relaxed mb-8 max-w-sm">
            Rent it out, sell it, or both — reach buyers and renters across your area in a few steps.
          </p>

          {/* Vendor profile Identity Card */}
          <div className="w-full bg-[#f5f0e6] rounded-[20px] p-5 border border-[#e8dfc8] shadow-sm mb-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8732c] flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {(vendorProfile?.full_name || vendorProfile?.shop_name || "V")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm truncate">{vendorProfile?.full_name || vendorProfile?.shop_name}</span>
                <span className="text-[10px] font-extrabold tracking-wider bg-[#1a3d2e] text-white px-2 py-0.5 rounded-full">
                  VENDOR
                </span>
              </div>
              <p className="text-xs text-[#6b7d72] flex items-center gap-1">
                <MapPin size={12} className="text-[#e8732c]" />
                {vendorProfile?.area && vendorProfile?.district 
                  ? `${vendorProfile.area}, ${vendorProfile.district}` 
                  : "Location not set"}
              </p>
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-[14px] bg-[#e8732c] text-white font-display text-base font-bold uppercase tracking-wider hover:bg-[#e8732c]/90 transition shadow-md flex items-center justify-center gap-2"
          >
            Start Listing <ChevronRight size={18} />
          </button>
        </main>
      )}

      {/* ──────────────── FLOW STEPS (1-6) ──────────────── */}
      {step >= 1 && (
        <div className="max-w-[640px] mx-auto px-4 pt-4">
          
          {/* Style block for roadmap step marker animation */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulseScale {
              0% { transform: scale(1); }
              100% { transform: scale(1.18); }
            }
            .pulse-active {
              animation: pulseScale 0.7s infinite alternate ease-in-out;
            }
          `}} />

          {/* Sticky Header */}
          <header className="sticky top-0 z-50 bg-[#ece4d1] pb-3 border-b border-[#e8dfc8] mb-6">
            <div className="flex items-center justify-between py-2 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded bg-[#1a3d2e] flex items-center justify-center">
                  <Store size={14} className="text-[#e8732c]" />
                </div>
                <span className="font-display font-extrabold text-sm text-[#1a3d2e]">Namma Thalluvandi</span>
              </div>

              {/* Vendor Compact Pill */}
              <div className="flex items-center gap-2 bg-[#f5f0e6] px-2.5 py-1 rounded-full border border-[#e8dfc8] max-w-[200px]">
                <div className="w-5 h-5 rounded-full bg-[#e8732c] flex items-center justify-center text-white text-[10px] font-bold">
                  {(vendorProfile?.full_name || "V")[0].toUpperCase()}
                </div>
                <span className="text-[10px] font-bold text-[#1a3d2e] truncate max-w-[80px]">
                  {vendorProfile?.full_name || vendorProfile?.shop_name}
                </span>
                <span className="text-[8px] font-extrabold bg-[#1a3d2e] text-white px-1.5 py-0.2 rounded-full scale-90">
                  V
                </span>
              </div>

              <button 
                onClick={() => setLang(l => l === "en" ? "ta" : "en")}
                className="text-[10px] font-bold px-2 py-1 rounded-full border border-[#e8dfc8] bg-[#f5f0e6]"
              >
                {lang === "en" ? "தமிழ்" : "EN"}
              </button>
            </div>

            {/* Roadmap Progress Bar */}
            <div className="relative w-full px-2 pt-2 pb-4">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#e8dfc8] -z-10" />
              <div 
                className="absolute top-6 left-6 h-0.5 bg-[#1a3d2e] -z-10 transition-all duration-300"
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              />

              <div className="flex justify-between items-center">
                {stepsList.map((s) => {
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  
                  return (
                    <div key={s.num} className="flex flex-col items-center relative select-none">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2
                          ${isActive ? "bg-[#e8732c] text-white border-[#e8732c] pulse-active shadow-md z-10" : ""}
                          ${isCompleted ? "bg-[#1a3d2e] text-white border-[#1a3d2e] z-10" : ""}
                          ${!isActive && !isCompleted ? "bg-[#ece4d1] text-[#6b7d72] border-[#e8dfc8]" : ""}
                        `}
                      >
                        {isCompleted ? <Check size={14} className="stroke-[3px]" /> : s.num}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1 transition-colors ${isActive ? "text-[#e8732c] font-bold" : "text-[#6b7d72]"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </header>

          {/* Form Error Banner */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-xl text-sm flex gap-2 items-start font-body">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ──────────────── STEP 1: INTENT ──────────────── */}
          {step === 1 && (
            <div className="animate-fade-in font-body">
              <h2 className="font-display text-2xl font-bold mb-1 text-[#1a3d2e]">What would you like to do?</h2>
              <p className="text-xs text-[#6b7d72] mb-6">Select one or both — list for rent and sale at the same time.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Rent Card */}
                <button
                  type="button"
                  onClick={() => setIntentRent(!intentRent)}
                  className={`relative p-5 rounded-[22px] border-2 text-left bg-[#f5f0e6] transition-all hover:shadow-md h-36 flex flex-col justify-between
                    ${intentRent ? "border-[#e8732c] ring-1 ring-[#e8732c]" : "border-[#e8dfc8]"}
                  `}
                >
                  {intentRent && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#e8732c] flex items-center justify-center text-white">
                      <Check size={12} className="stroke-[3.5px]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-[#1a3d2e]/10 flex items-center justify-center text-[#1a3d2e] mb-3">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1a3d2e] leading-snug">Rent Out My Cart</h3>
                    <p className="text-[10px] text-[#6b7d72] mt-0.5">Earn recurring income</p>
                  </div>
                </button>

                {/* Sell Card */}
                <button
                  type="button"
                  onClick={() => setIntentSale(!intentSale)}
                  className={`relative p-5 rounded-[22px] border-2 text-left bg-[#f5f0e6] transition-all hover:shadow-md h-36 flex flex-col justify-between
                    ${intentSale ? "border-[#e8732c] ring-1 ring-[#e8732c]" : "border-[#e8dfc8]"}
                  `}
                >
                  {intentSale && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#e8732c] flex items-center justify-center text-white">
                      <Check size={12} className="stroke-[3.5px]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-[#e8732c]/10 flex items-center justify-center text-[#e8732c] mb-3">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1a3d2e] leading-snug">Sell My Cart</h3>
                    <p className="text-[10px] text-[#6b7d72] mt-0.5">One-time payout</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── STEP 2: CART DETAILS ──────────────── */}
          {step === 2 && (
            <div className="animate-fade-in font-body">
              <h2 className="font-display text-2xl font-bold mb-1 text-[#1a3d2e]">Cart Details</h2>
              <p className="text-xs text-[#6b7d72] mb-6">Describe the physical attributes of your food cart.</p>

              <div className="bg-[#f5f0e6] p-6 rounded-[24px] border border-[#e8dfc8] shadow-sm flex flex-col gap-6">
                
                {/* 1. Cart Type */}
                <div>
                  <span className="block text-xs font-bold text-[#1a3d2e] uppercase tracking-wider mb-2.5">
                    Cart Type *
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CART_TYPE_OPTIONS.map((opt) => {
                      const sel = cartType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCartType(opt.value)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                            ${sel ? "bg-[#e8732c] text-white border-[#e8732c]" : "bg-white text-[#1a3d2e] border-[#e8dfc8] hover:border-[#1a3d2e]/30"}
                          `}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Condition */}
                <div>
                  <span className="block text-xs font-bold text-[#1a3d2e] uppercase tracking-wider mb-2.5">
                    Condition *
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CONDITION_OPTIONS.map((opt) => {
                      const sel = condition === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCondition(opt.value)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                            ${sel ? "bg-[#e8732c] text-white border-[#e8732c]" : "bg-white text-[#1a3d2e] border-[#e8dfc8] hover:border-[#1a3d2e]/30"}
                          `}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Cart Size */}
                <div>
                  <span className="block text-xs font-bold text-[#1a3d2e] uppercase tracking-wider mb-2.5">
                    Cart Size *
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((opt) => {
                      const sel = cartSize === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCartSize(opt.value)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                            ${sel ? "bg-[#e8732c] text-white border-[#e8732c]" : "bg-white text-[#1a3d2e] border-[#e8dfc8] hover:border-[#1a3d2e]/30"}
                          `}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Stove Type */}
                <div>
                  <span className="block text-xs font-bold text-[#1a3d2e] uppercase tracking-wider mb-2.5">
                    Stove Type *
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STOVE_OPTIONS.map((opt) => {
                      const sel = stoveType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStoveType(opt.value)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                            ${sel ? "bg-[#e8732c] text-white border-[#e8732c]" : "bg-white text-[#1a3d2e] border-[#e8dfc8] hover:border-[#1a3d2e]/30"}
                          `}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ──────────────── STEP 3: PRICING ──────────────── */}
          {step === 3 && (
            <div className="animate-fade-in font-body">
              <h2 className="font-display text-2xl font-bold mb-1 text-[#1a3d2e]">Pricing Details</h2>
              <p className="text-xs text-[#6b7d72] mb-6">Enter rental terms, sales price, or both depending on intent.</p>

              <div className="flex flex-col gap-4">
                
                {/* RENTAL PRICING */}
                {intentRent && (
                  <div className="bg-[#f5f0e6] p-6 rounded-[24px] border border-[#e8dfc8] shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8dfc8]">
                      <span className="font-display font-extrabold text-sm text-[#1a3d2e] uppercase tracking-wide">
                        Rental Pricing
                      </span>
                      <span className="text-[10px] font-bold text-[#e8732c] bg-[#e8732c]/10 px-2.5 py-0.5 rounded-full uppercase">
                        Recurring
                      </span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-[#1a3d2e] uppercase mb-1.5">Daily Rent (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-sm font-bold text-[#6b7d72]">₹</span>
                        <input
                          type="number"
                          value={dailyRent}
                          onChange={(e) => setDailyRent(e.target.value)}
                          placeholder="e.g. 80"
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-[#e8dfc8] text-sm focus:outline-none focus:border-[#e8732c] transition"
                        />
                      </div>
                      
                      {/* Range Helper Box */}
                      <div className="mt-3 p-3 bg-white/70 rounded-xl border border-[#e8dfc8] flex items-start gap-2 text-xs text-[#6b7d72]">
                        <Info size={14} className="text-[#1a3d2e] shrink-0 mt-0.5" />
                        <span>💡 Similar carts in your area rent for ₹60 – ₹120/day depending on size.</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1a3d2e] uppercase mb-2">Minimum Rental Period *</label>
                      <div className="flex gap-2 flex-wrap">
                        {RENTAL_PERIOD_OPTIONS.map((opt) => {
                          const sel = minRentalPeriod === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setMinRentalPeriod(opt.value)}
                              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                                ${sel ? "bg-[#e8732c] text-white border-[#e8732c]" : "bg-white text-[#1a3d2e] border-[#e8dfc8] hover:border-[#1a3d2e]/30"}
                              `}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SALE PRICING */}
                {intentSale && (
                  <div className="bg-[#f5f0e6] p-6 rounded-[24px] border border-[#e8dfc8] shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e8dfc8]">
                      <span className="font-display font-extrabold text-sm text-[#1a3d2e] uppercase tracking-wide">
                        Sale Pricing
                      </span>
                      <span className="text-[10px] font-bold text-[#1a3d2e] bg-[#1a3d2e]/10 px-2.5 py-0.5 rounded-full uppercase">
                        One-Time
                      </span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-[#1a3d2e] uppercase mb-1.5">One-time Sale Price (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-sm font-bold text-[#6b7d72]">₹</span>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="e.g. 15000"
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-[#e8dfc8] text-sm focus:outline-none focus:border-[#e8732c] transition"
                        />
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-[#e8dfc8]">
                      <div>
                        <span className="text-xs font-bold text-[#1a3d2e] block">Negotiable</span>
                        <span className="text-[10px] text-[#6b7d72]">Are you open to bargaining?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNegotiable(!negotiable)}
                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none border border-[#e8dfc8]
                          ${negotiable ? "bg-[#e8732c]" : "bg-white"}
                        `}
                      >
                        <div 
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform border border-[#e8dfc8]
                            ${negotiable ? "translate-x-5" : "translate-x-0.5"}
                          `}
                        />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

          {/* ──────────────── STEP 4: LOCATION ──────────────── */}
          {step === 4 && (
            <div className="animate-fade-in font-body">
              <h2 className="font-display text-2xl font-bold mb-1 text-[#1a3d2e]">Cart Location</h2>
              <p className="text-xs text-[#6b7d72] mb-6">Specify where your cart is stored or can be picked up.</p>

              <div className="bg-[#f5f0e6] p-6 rounded-[24px] border border-[#e8dfc8] shadow-sm flex flex-col gap-4">
                
                {/* Auto Detect Button */}
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={location.status === "loading"}
                  className="w-full py-3.5 rounded-xl bg-[#1a3d2e] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1a3d2e]/90 transition shadow-sm disabled:opacity-50"
                >
                  <Compass size={16} className={location.status === "loading" ? "animate-spin" : ""} />
                  {location.status === "loading" ? "Detecting GPS..." : "Auto-detect my location"}
                </button>

                {vendorProfile?.latitude && (
                  <button
                    type="button"
                    onClick={handleUseProfileLocation}
                    className="w-full py-2.5 rounded-xl bg-white text-[#1a3d2e] border border-[#e8dfc8] text-xs font-semibold hover:bg-[#e8dfc8]/30 transition"
                  >
                    📍 Use My Profile Location ({vendorProfile.area || "Vendor Area"})
                  </button>
                )}

                {/* Manual Address */}
                <div>
                  <label className="block text-xs font-bold text-[#1a3d2e] uppercase mb-1.5">Manual Address / Area *</label>
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))}
                    placeholder="e.g. Ondipudur, Coimbatore"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#e8dfc8] text-sm focus:outline-none focus:border-[#e8732c] transition"
                  />
                </div>

                {/* Stylized Static Map Placeholder */}
                <div className="relative h-44 rounded-xl border border-[#e8dfc8] bg-[#ece4d1] overflow-hidden flex items-center justify-center">
                  {/* Decorative roads map SVG */}
                  <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10%" y1="0" x2="30%" y2="100%" stroke="#1a3d2e" strokeWidth="6" />
                    <line x1="0" y1="40%" x2="100%" y2="50%" stroke="#1a3d2e" strokeWidth="8" />
                    <line x1="80%" y1="0" x2="60%" y2="100%" stroke="#1a3d2e" strokeWidth="4" />
                    <circle cx="65%" cy="47%" r="28" fill="#e8dfc8" />
                  </svg>

                  {/* Centered Orange Pin */}
                  <div className="relative flex flex-col items-center z-10">
                    <div className="w-10 h-10 rounded-full bg-[#e8732c]/10 flex items-center justify-center border border-[#e8732c] animate-bounce">
                      <MapPin size={22} className="text-[#e8732c]" />
                    </div>
                  </div>

                  {/* Address Overlay */}
                  {location.address.trim() !== "" && (
                    <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm border border-[#e8dfc8] px-3 py-1.5 rounded-lg text-center truncate shadow-sm">
                      <span className="text-[10px] font-bold text-[#1a3d2e]">{location.address}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ──────────────── STEP 5: PHOTOS ──────────────── */}
          {step === 5 && (
            <div className="animate-fade-in font-body">
              <h2 className="font-display text-2xl font-bold mb-1 text-[#1a3d2e]">Cart Photos</h2>
              <p className="text-xs text-[#6b7d72] mb-6">Upload clear photos of your cart. Reorder by dragging.</p>

              <div className="bg-[#f5f0e6] p-6 rounded-[24px] border border-[#e8dfc8] shadow-sm">
                
                {/* Photo Counter */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#1a3d2e] uppercase tracking-wide">
                    Cart Gallery
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border
                    ${selectedFiles.length >= 2 
                      ? "bg-emerald-100 border-emerald-200 text-emerald-800" 
                      : "bg-[#e8732c]/10 border-[#e8732c]/30 text-[#e8732c]"}
                  `}>
                    {selectedFiles.length} of 6 photos added — min 2 required
                  </span>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {SUGGESTED_ANGLES.map((angle) => {
                    const file = selectedFiles[angle.index];
                    const preview = previews[angle.index];

                    if (file && preview) {
                      // Filled Tile
                      return (
                        <div
                          key={angle.index}
                          draggable
                          onDragStart={() => handleDragStart(angle.index)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(angle.index)}
                          className="relative aspect-square rounded-xl overflow-hidden border border-[#e8dfc8] bg-white group cursor-move shadow-sm transition-transform active:scale-95"
                        >
                          <img src={preview} alt="Cart preview" className="w-full h-full object-cover" />
                          
                          {/* Green Check Badge */}
                          <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white border border-white shadow-sm">
                            <Check size={10} className="stroke-[3.5px]" />
                          </div>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => removePhoto(angle.index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                          >
                            <X size={10} />
                          </button>

                          {/* Order index label */}
                          <div className="absolute bottom-1 right-1 bg-black/40 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            #{angle.index + 1}
                          </div>
                        </div>
                      );
                    }

                    // Empty Suggestion Tile
                    return (
                      <div
                        key={angle.index}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(angle.index)}
                        className="relative aspect-square rounded-xl border-2 border-dashed border-[#e8dfc8] bg-white flex flex-col items-center justify-center p-2 text-center"
                      >
                        <Camera size={18} className="text-[#6b7d72] mb-1.5" />
                        <span className="text-[9px] font-bold text-[#1a3d2e] leading-snug truncate w-full">
                          {angle.label}
                        </span>
                        <span className="text-[7px] text-[#6b7d72] mt-0.5">Required</span>
                      </div>
                    );
                  })}
                </div>

                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={selectedFiles.length >= 6}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={selectedFiles.length >= 6}
                    className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#e8dfc8] bg-white hover:bg-[#e8dfc8]/20 transition flex items-center justify-center gap-2 text-xs font-bold text-[#1a3d2e] disabled:opacity-50"
                  >
                    <Upload size={14} />
                    Choose Photos (PNG, JPG, WEBP)
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ──────────────── STEP 6: REVIEW & SUBMIT ──────────────── */}
          {step === 6 && (
            <div className="animate-fade-in font-body">
              <h2 className="font-display text-2xl font-bold mb-1 text-[#1a3d2e]">Review & Submit</h2>
              <p className="text-xs text-[#6b7d72] mb-6">Review your food cart details before publishing.</p>

              {/* Callout box */}
              <div className="p-4 bg-[#e8732c]/10 border border-[#e8732c]/30 rounded-xl mb-6 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#e8732c] uppercase tracking-wide">
                  This cart will appear on:
                </span>
                <div className="flex gap-2">
                  {intentRent && (
                    <span className="px-3 py-1 bg-[#1a3d2e]/10 text-[#1a3d2e] text-xs font-bold rounded-full">
                      Explore (Rental)
                    </span>
                  )}
                  {intentSale && (
                    <span className="px-3 py-1 bg-[#e8732c]/10 text-[#e8732c] text-xs font-bold rounded-full">
                      Live Sales
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* 1. Specs Details Review */}
                <div className="bg-[#f5f0e6] p-5 rounded-2xl border border-[#e8dfc8]">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#e8dfc8]">
                    <span className="text-xs font-bold text-[#1a3d2e] uppercase tracking-wide">Specs & Attributes</span>
                    <button onClick={() => setStep(2)} className="text-xs text-[#e8732c] font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-[#1a3d2e]">
                    <div className="flex justify-between">
                      <span className="text-[#6b7d72]">Cart Type:</span>
                      <span className="font-semibold">{cartType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7d72]">Condition:</span>
                      <span className="font-semibold">{condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7d72]">Cart Size:</span>
                      <span className="font-semibold">{cartSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7d72]">Stove Type:</span>
                      <span className="font-semibold">{stoveType}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Pricing Review */}
                <div className="bg-[#f5f0e6] p-5 rounded-2xl border border-[#e8dfc8]">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#e8dfc8]">
                    <span className="text-xs font-bold text-[#1a3d2e] uppercase tracking-wide">Pricing Terms</span>
                    <button onClick={() => setStep(3)} className="text-xs text-[#e8732c] font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-[#1a3d2e]">
                    {intentRent && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#6b7d72]">Daily Rent:</span>
                          <span className="font-semibold">₹{dailyRent}/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7d72]">Min Rental Period:</span>
                          <span className="font-semibold capitalize">{minRentalPeriod}</span>
                        </div>
                      </>
                    )}
                    {intentRent && intentSale && <div className="h-px bg-[#e8dfc8] my-1" />}
                    {intentSale && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#6b7d72]">One-time Sale Price:</span>
                          <span className="font-semibold">₹{salePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7d72]">Negotiable:</span>
                          <span className="font-semibold">{negotiable ? "Yes" : "No"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Location Review */}
                <div className="bg-[#f5f0e6] p-5 rounded-2xl border border-[#e8dfc8]">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#e8dfc8]">
                    <span className="text-xs font-bold text-[#1a3d2e] uppercase tracking-wide">Location</span>
                    <button onClick={() => setStep(4)} className="text-xs text-[#e8732c] font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-[#1a3d2e]">
                    <span className="text-[#6b7d72]">Pick-up address:</span>
                    <span className="font-semibold truncate max-w-[200px]">{location.address}</span>
                  </div>
                </div>

                {/* 4. Photos Review */}
                <div className="bg-[#f5f0e6] p-5 rounded-2xl border border-[#e8dfc8]">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#e8dfc8]">
                    <span className="text-xs font-bold text-[#1a3d2e] uppercase tracking-wide">Uploaded Photos</span>
                    <button onClick={() => setStep(5)} className="text-xs text-[#e8732c] font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {previews.map((preview, idx) => (
                      <div key={idx} className="aspect-square rounded-lg border border-[#e8dfc8] overflow-hidden bg-white">
                        <img src={preview} alt="review" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Sticky Bottom Nav Navigation */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#ece4d1]/95 backdrop-blur-sm border-t border-[#e8dfc8] py-4 px-4 shadow-lg">
            <div className="max-w-[640px] mx-auto flex gap-3">
              {/* Back Button */}
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-4 rounded-[14px] border border-[#1a3d2e] text-[#1a3d2e] font-bold text-sm uppercase tracking-wider hover:bg-[#1a3d2e]/10 transition flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-6 py-4 rounded-[14px] border border-[#1a3d2e] text-[#1a3d2e] font-bold text-sm uppercase tracking-wider hover:bg-[#1a3d2e]/10 transition flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} /> Cancel
                </button>
              )}

              {/* Next/Submit Button */}
              {step < 6 ? (
                <button
                  type="button"
                  disabled={!isStepValid}
                  onClick={() => setStep(step + 1)}
                  className="flex-1 py-4 rounded-[14px] bg-[#e8732c] text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-[#e8732c]/90 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="flex-1 py-4 rounded-[14px] bg-[#e8732c] text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-[#e8732c]/90 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Listing"
                  )}
                </button>
              )}
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}

export default function ListCartV2Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#ece4d1] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#1a3d2e] border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ListCartV2Content />
    </Suspense>
  );
}
