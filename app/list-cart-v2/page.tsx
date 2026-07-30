"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogIn, 
  AlertCircle, 
  MapPin, 
  Camera, 
  Compass, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  X,
  RefreshCw,
  Info,
  Search,
  IndianRupee
} from "lucide-react";
import { saveCart } from "@/app/actions";
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

const SUGGESTED_ANGLES = [
  { index: 0, en: "Front Angle", ta: "முன்பக்க கோணம்" },
  { index: 1, en: "Side View", ta: "பக்கவாட்டு தோற்றம்" },
  { index: 2, en: "Stove View", ta: "அடுப்பு பகுதி" },
  { index: 3, en: "Extra View 1", ta: "கூடுதல் படம் 1" },
  { index: 4, en: "Extra View 2", ta: "கூடுதல் படம் 2" },
  { index: 5, en: "Extra View 3", ta: "கூடுதல் படம் 3" },
];

type GeoState = {
  status: "idle" | "loading" | "success" | "error";
  latitude: number | null;
  longitude: number | null;
  area: string;
  district: string;
  address: string;
};

// Initial geographic coordinates fall back to Coimbatore default map
const INITIAL_GEO: GeoState = {
  status: "success",
  latitude: 11.0168,
  longitude: 76.9558,
  area: "Coimbatore",
  district: "Coimbatore",
  address: "Coimbatore, Tamil Nadu",
};

const LOCAL_STORAGE_KEY = "ntv_list_cart_flow_data";

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

// Compress images client-side before upload to prevent mobile network time-outs
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

function ListCartV2Content() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user, isVendor, vendorProfile, loading: authLoading } = useAuth();

  // Reference for Camera & Gallery Upload Inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
  const [location, setLocation] = useState<GeoState>(INITIAL_GEO);
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  // Step 5: Photos (Drag & Drop sorting)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Sync state with global HTML data attribute
  useEffect(() => {
    const updateLang = () => {
      const current = document.documentElement.getAttribute("data-lang") || "en";
      setLang(current as "en" | "ta");
    };
    updateLang();

    const observer = new MutationObserver(updateLang);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
    return () => observer.disconnect();
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step !== undefined) setStep(parsed.step);
        if (parsed.intentRent !== undefined) setIntentRent(parsed.intentRent);
        if (parsed.intentSale !== undefined) setIntentSale(parsed.intentSale);
        if (parsed.cartType !== undefined) setCartType(parsed.cartType);
        if (parsed.condition !== undefined) setCondition(parsed.condition);
        if (parsed.cartSize !== undefined) setCartSize(parsed.cartSize);
        if (parsed.stoveType !== undefined) setStoveType(parsed.stoveType);
        if (parsed.dailyRent !== undefined) setDailyRent(parsed.dailyRent);
        if (parsed.minRentalPeriod !== undefined) setMinRentalPeriod(parsed.minRentalPeriod);
        if (parsed.salePrice !== undefined) setSalePrice(parsed.salePrice);
        if (parsed.negotiable !== undefined) setNegotiable(parsed.negotiable);
        if (parsed.location !== undefined) setLocation(parsed.location);
      } catch (e) {
        console.error("Failed to parse saved flow data", e);
      }
    } else if (vendorProfile?.latitude && vendorProfile?.longitude) {
      // Initialize with vendor coordinates if localStorage is empty
      setLocation({
        status: "success",
        latitude: vendorProfile.latitude,
        longitude: vendorProfile.longitude,
        area: vendorProfile.area || "",
        district: vendorProfile.district || "",
        address: `${vendorProfile.area || ""}, ${vendorProfile.district || ""}`.trim(),
      });
    }
  }, [vendorProfile]);

  // Persist state to localStorage on changes
  useEffect(() => {
    if (step === 0 && submitSuccess) return;
    const dataToSave = {
      step,
      intentRent,
      intentSale,
      cartType,
      condition,
      cartSize,
      stoveType,
      dailyRent,
      minRentalPeriod,
      salePrice,
      negotiable,
      location,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [step, intentRent, intentSale, cartType, condition, cartSize, stoveType, dailyRent, minRentalPeriod, salePrice, negotiable, location, submitSuccess]);

  // File Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const totalAllowed = 6;
    if (selectedFiles.length + files.length > totalAllowed) {
      setError(
        lang === "ta" 
          ? `நீங்கள் அதிகபட்சமாக ${totalAllowed} புகைப்படங்களை மட்டுமே பதிவேற்ற முடியும்.` 
          : `You can only upload up to ${totalAllowed} photos in total.`
      );
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
      setError(
        lang === "ta"
          ? "உங்கள் சுயவிவரத்தில் சேமிக்கப்பட்ட இருப்பிடம் எதுவும் இல்லை."
          : "Your profile doesn't have a saved location yet."
      );
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

  // Manual Geocode Lookup using Nominatim
  const handleGeocodeSearch = async () => {
    if (!location.address.trim()) return;
    setGeocodeLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.address)}&limit=1`,
        {
          headers: {
            "User-Agent": "NammaThalluvandi/1.0"
          }
        }
      );
      const json = await res.json();
      if (json && json.length > 0) {
        const item = json[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        
        setLocation({
          status: "success",
          latitude: lat,
          longitude: lon,
          area: item.display_name.split(",")[0] || "",
          district: item.display_name.split(",")[1] || "",
          address: item.display_name,
        });
      } else {
        setError(
          lang === "ta"
            ? "இந்த முகவரியைக் கண்டறிய முடியவில்லை. தயவுசெய்து வேறு பகுதியைத் தேர்ந்தெடுக்கவும்."
            : "Could not find coordinates for this address. Please try another area name."
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        lang === "ta"
          ? "இருப்பிடத்தைத் தேடுவதில் தோல்வி. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
          : "Geocoding search failed. Please try again."
      );
    } finally {
      setGeocodeLoading(false);
    }
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
      // 1. Compress and Upload photos to Supabase Storage
      const uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const compressed = await compressImage(file);
          const fileExt = compressed.name.substring(compressed.name.lastIndexOf(".")) || ".jpg";
          const filename = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
          
          const { data, error: uploadErr } = await supabase.storage
            .from("carts")
            .upload(filename, compressed);

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

      // Clear local storage on success
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    setLocation(INITIAL_GEO);
    setSelectedFiles([]);
    setPreviews([]);
    setSubmitSuccess(false);
    setError("");
  };

  // Auth Loading Screen - Renders full new brand logo
  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <img src="/brand/full-logo-new.png" alt="Namma Thalluvandi" className="w-40 h-40 object-contain animate-pulse" />
        <span className="text-primary font-bold text-xs uppercase tracking-wide">Loading Portal...</span>
      </main>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        {/* Hide global WhatsApp floating widget button only on this page */}
        <style dangerouslySetInnerHTML={{__html: `a[aria-label="WhatsApp booking"] { display: none !important; }`}} />
        
        <div className="max-w-md w-full text-center bg-surface p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-3">
            {lang === "ta" ? "தொடர உள்நுழையவும்" : "Sign In to Continue"}
          </h1>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
            {lang === "ta"
              ? "நம்ம தள்ளுவண்டியில் வண்டியைப் பட்டியலிட அல்லது நிர்வகிக்க உங்களுக்கு ஒரு கணக்கு தேவை."
              : "You need a registered account to publish or manage food cart listings on Namma Thalluvandi."}
          </p>
          <Link href="/login?redirect=/list-cart-v2" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#F97316] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#e06612] transition shadow-md">
            <LogIn className="w-4 h-4" /> {lang === "ta" ? "உள்நுழைய / பதிவு செய்ய" : "Login / Register"}
          </Link>
        </div>
      </main>
    );
  }

  // No Vendor Profile
  if (!isVendor) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        {/* Hide global WhatsApp floating widget button only on this page */}
        <style dangerouslySetInnerHTML={{__html: `a[aria-label="WhatsApp booking"] { display: none !important; }`}} />

        <div className="max-w-md w-full text-center bg-surface p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-5 shadow-sm border border-outline-variant/30 p-2">
            <img src="/brand/text-logo.webp" alt="NTV" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-3">
            {lang === "ta" ? "சுயவிவரத்தை உருவாக்கவும்" : "Create Vendor Profile"}
          </h1>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-outline-variant/20 text-left mb-6">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {lang === "ta"
                ? "உங்கள் தள்ளுவண்டிகளை பட்டியலிட, முதலில் உங்கள் வணிக விவரங்களுடன் ஒரு இலவச விற்பனையாளர் சுயவிவரத்தை அமைக்க வேண்டும்."
                : "To start listing your carts, you first need to set up a free vendor profile containing your business context."}
            </p>
          </div>
          <Link href="/vendor/register" className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#F97316] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#e06612] transition shadow-md">
            {lang === "ta" ? "விற்பனையாளர் சுயவிவரத்தை உருவாக்கு" : "Create Vendor Profile"}
          </Link>
        </div>
      </main>
    );
  }

  // Success Screen
  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 flex items-center justify-center">
        {/* Hide global WhatsApp floating widget button only on this page */}
        <style dangerouslySetInnerHTML={{__html: `a[aria-label="WhatsApp booking"] { display: none !important; }`}} />

        <div className="max-w-md w-full text-center bg-surface p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-background">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface mb-2">
            {lang === "ta" ? "பதிவு சமர்ப்பிக்கப்பட்டது!" : "Listing Submitted!"}
          </h1>
          
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            {lang === "ta" ? "மதிப்பாய்வில் உள்ளது" : "PENDING REVIEW"}
          </div>

          <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
            {lang === "ta"
              ? "எங்கள் குழு பொதுவாக புதிய பதிவுகளை 24 மணி நேரத்திற்குள் மதிப்பாய்வு செய்கிறது. அது நேரலைக்கு வந்ததும் உங்களுக்குத் தெரிவிக்கப்படும்."
              : "Our team typically reviews new listings within 24 hours. You'll be notified once your cart goes live."}
          </p>

          <div className="bg-background rounded-xl p-4 border border-outline-variant/20 mb-8 text-left">
            <span className="text-xs font-semibold text-on-surface-variant uppercase block mb-2">
              {lang === "ta" ? "பட்டியலிடப்பட்ட இடங்கள்:" : "Surfaces where listed:"}
            </span>
            <div className="flex gap-2">
              {intentRent && (
                <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-bold rounded-full">
                  {lang === "ta" ? "வாடகைக்கு (Explore)" : "Explore (Rental)"}
                </span>
              )}
              {intentSale && (
                <span className="px-3 py-1 bg-[#F97316]/15 text-[#F97316] text-xs font-bold rounded-full">
                  {lang === "ta" ? "விற்பனைக்கு (Sales)" : "Live Sales"}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition shadow-md"
          >
            {lang === "ta" ? "மற்றொரு வண்டியைச் சேர்க்க" : "List Another Cart"}
          </button>
        </div>
      </main>
    );
  }

  // Roadmap node labels
  const stepsList = [
    { num: 1, en: "Intent", ta: "நோக்கம்" },
    { num: 2, en: "Details", ta: "விவரங்கள்" },
    { num: 3, en: "Pricing", ta: "விலை" },
    { num: 4, en: "Location", ta: "இருப்பிடம்" },
    { num: 5, en: "Photos", ta: "புகைப்படம்" },
    { num: 6, en: "Review", ta: "மதிப்பாய்வு" }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 pt-24 px-4">
      
      {/* Hide global WhatsApp float widget button only on this page */}
      <style dangerouslySetInnerHTML={{__html: `
        a[aria-label="WhatsApp booking"] {
          display: none !important;
        }
      `}} />

      {/* ──────────────── SCREEN 0: LANDING ──────────────── */}
      {step === 0 && (
        <main className="max-w-md mx-auto py-12 flex flex-col items-center">
          {/* Central landing badge using NTV Logo */}
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6 shadow-sm border border-outline-variant/30 p-2">
            <img src="/brand/text-logo.webp" alt="NTV Logo" className="w-14 h-14 object-contain" />
          </div>

          <h1 className="text-3xl font-black text-center mb-3">
            {lang === "ta" ? "உங்கள் வண்டியைப் பட்டியலிட்டு வாடகைக்கு விடுங்கள்" : "List Your Cart"}
          </h1>
          
          <p className="text-center text-on-surface-variant text-sm leading-relaxed mb-8 max-w-sm">
            {lang === "ta"
              ? "வாடகைக்கு விடுங்கள், விற்கவும் அல்லது இரண்டும் செய்யலாம் — உங்கள் பகுதியில் உள்ள வாடிக்கையாளர்களை எளிதாக சென்றடையுங்கள்."
              : "Rent it out, sell it, or both — reach buyers and renters across your area in a few steps."}
          </p>

          {/* Vendor profile Identity Card */}
          <div className="w-full bg-surface rounded-2xl p-5 border border-outline-variant/20 shadow-sm mb-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20 shrink-0">
              {(vendorProfile?.full_name || vendorProfile?.shop_name || "V")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm truncate">{vendorProfile?.full_name || vendorProfile?.shop_name}</span>
                <span className="text-[10px] font-extrabold tracking-wider bg-primary text-white px-2 py-0.5 rounded-full uppercase">
                  {lang === "ta" ? "விற்பனையாளர்" : "VENDOR"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <MapPin size={12} className="text-[#F97316]" />
                {vendorProfile?.area && vendorProfile?.district 
                  ? `${vendorProfile.area}, ${vendorProfile.district}` 
                  : (lang === "ta" ? "இருப்பிடம் அமைக்கப்படவில்லை" : "Location not set")}
              </p>
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-xl bg-[#F97316] text-white text-base font-bold uppercase tracking-wider hover:bg-[#e06612] transition shadow-md flex items-center justify-center gap-2"
          >
            {lang === "ta" ? "பட்டியலிட தொடங்கு" : "Start Listing"} <ChevronRight size={18} />
          </button>
        </main>
      )}

      {/* ──────────────── FLOW STEPS (1-6) ──────────────── */}
      {step >= 1 && (
        <div className="max-w-[640px] mx-auto">
          
          {/* Style block for roadmap step marker animation */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulseScale {
              0% { transform: scale(1); }
              100% { transform: scale(1.1); }
            }
            .pulse-active {
              animation: pulseScale 0.7s infinite alternate ease-in-out;
            }
          `}} />

          {/* Roadmap Progress Bar Container inside the content area */}
          <div className="bg-surface rounded-2xl border border-outline-variant/30 p-5 mb-6 shadow-sm">
            <div className="relative w-full px-2 pt-2 pb-4">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-outline-variant/20 -z-10" />
              <div 
                className="absolute top-6 left-6 h-0.5 bg-primary -z-10 transition-all duration-300"
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
                          ${isActive ? "bg-[#F97316] text-white border-[#F97316] pulse-active shadow-md z-10" : ""}
                          ${isCompleted ? "bg-primary text-white border-primary z-10" : ""}
                          ${!isActive && !isCompleted ? "bg-background text-on-surface-variant/50 border-outline-variant/35" : ""}
                        `}
                      >
                        {isCompleted ? <Check size={14} className="stroke-[3px]" /> : s.num}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1.5 transition-colors ${isActive ? "text-[#F97316] font-bold" : "text-on-surface-variant"}`}>
                        {lang === "ta" ? s.ta : s.en}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-xl text-sm flex gap-2 items-start">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ──────────────── STEP 1: INTENT ──────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-1">
                {lang === "ta" ? "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?" : "What would you like to do?"}
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                {lang === "ta"
                  ? "ஒன்றை அல்லது இரண்டையுமே தேர்ந்தெடுக்கலாம் — வாடகைக்கும் விற்பனைக்கும் ஒரே நேரத்தில் பட்டியலிட முடியும்."
                  : "Select one or both — list for rent and sale at the same time."}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Rent Card */}
                <button
                  type="button"
                  onClick={() => setIntentRent(!intentRent)}
                  className={`relative p-5 rounded-2xl border text-left bg-surface transition-all hover:shadow-sm h-36 flex flex-col justify-between
                    ${intentRent ? "border-[#F97316] ring-1 ring-[#F97316]" : "border-outline-variant/30"}
                  `}
                >
                  {intentRent && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center text-white">
                      <Check size={12} className="stroke-[3.5px]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <img src="/brand/text-logo.webp" alt="NTV Icon" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-snug">
                      {lang === "ta" ? "வாடகைக்கு விட" : "Rent Out My Cart"}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {lang === "ta" ? "மாதாந்திர வருமானம் பெற" : "Earn recurring income"}
                    </p>
                  </div>
                </button>

                {/* Sell Card */}
                <button
                  type="button"
                  onClick={() => setIntentSale(!intentSale)}
                  className={`relative p-5 rounded-2xl border text-left bg-surface transition-all hover:shadow-sm h-36 flex flex-col justify-between
                    ${intentSale ? "border-[#F97316] ring-1 ring-[#F97316]" : "border-outline-variant/30"}
                  `}
                >
                  {intentSale && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center text-white">
                      <Check size={12} className="stroke-[3.5px]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316] mb-3">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-snug">
                      {lang === "ta" ? "விற்பனை செய்ய" : "Sell My Cart"}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {lang === "ta" ? "முழுத் தொகைக்கு விற்க" : "One-time payout"}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── STEP 2: CART DETAILS ──────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-1">
                {lang === "ta" ? "வண்டி விவரங்கள்" : "Cart Details"}
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                {lang === "ta" ? "உங்கள் தள்ளுவண்டியின் உடல் அமைப்புகளை விவரிக்கவும்." : "Describe the physical attributes of your food cart."}
              </p>

              <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-6">
                
                {/* 1. Cart Type */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-2.5">
                    {lang === "ta" ? "வண்டி வகை *" : "Cart Type *"}
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
                            ${sel ? "bg-primary text-white border-primary" : "bg-background text-on-surface border-outline-variant/30 hover:border-primary/30"}
                          `}
                        >
                          {lang === "ta" ? opt.ta : opt.en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Condition */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-2.5">
                    {lang === "ta" ? "வண்டியின் நிலை *" : "Condition *"}
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
                            ${sel ? "bg-primary text-white border-primary" : "bg-background text-on-surface border-outline-variant/30 hover:border-primary/30"}
                          `}
                        >
                          {lang === "ta" ? opt.ta : opt.en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Cart Size */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-2.5">
                    {lang === "ta" ? "வண்டி அளவு *" : "Cart Size *"}
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
                            ${sel ? "bg-primary text-white border-primary" : "bg-background text-on-surface border-outline-variant/30 hover:border-primary/30"}
                          `}
                        >
                          {lang === "ta" ? opt.ta : opt.en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Stove Type */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider mb-2.5">
                    {lang === "ta" ? "அடுப்பு வகை *" : "Stove Type *"}
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
                            ${sel ? "bg-primary text-white border-primary" : "bg-background text-on-surface border-outline-variant/30 hover:border-primary/30"}
                          `}
                        >
                          {lang === "ta" ? opt.ta : opt.en}
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
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-1">
                {lang === "ta" ? "விலை விவரங்கள்" : "Pricing Details"}
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                {lang === "ta"
                  ? "வாடகை கால வரம்புகள், விற்பனை விலை அல்லது இரண்டையுமே பூர்த்தி செய்யவும்."
                  : "Enter rental terms, sales price, or both depending on intent."}
              </p>

              <div className="flex flex-col gap-4">
                
                {/* RENTAL PRICING */}
                {intentRent && (
                  <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
                      <span className="font-bold text-sm uppercase tracking-wide">
                        {lang === "ta" ? "வாடகை விலை" : "Rental Pricing"}
                      </span>
                      <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/10 px-2.5 py-0.5 rounded-full uppercase">
                        {lang === "ta" ? "தொடர்ச்சியான" : "Recurring"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase mb-1.5">
                        {lang === "ta" ? "தினசரி வாடகை (₹) *" : "Daily Rent (₹) *"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-sm font-bold text-on-surface-variant">₹</span>
                        <input
                          type="number"
                          value={dailyRent}
                          onChange={(e) => setDailyRent(e.target.value)}
                          placeholder="e.g. 80"
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition"
                        />
                      </div>
                      
                      {/* Range Helper Box */}
                      <div className="mt-3 p-3 bg-background rounded-xl border border-outline-variant/20 flex items-start gap-2 text-xs text-on-surface-variant">
                        <Info size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>
                          {lang === "ta"
                            ? "💡 உங்கள் பகுதியில் உள்ள இதே போன்ற வண்டிகள் அளவுக்கு ஏற்ப ஒரு நாளைக்கு ₹60 - ₹120 வரை வாடகைக்கு விடப்படுகின்றன."
                            : "💡 Similar carts in your area rent for ₹60 – ₹120/day depending on size."}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-2">
                        {lang === "ta" ? "குறைந்தபட்ச வாடகை காலம் *" : "Minimum Rental Period *"}
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {RENTAL_PERIOD_OPTIONS.map((opt) => {
                          const sel = minRentalPeriod === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setMinRentalPeriod(opt.value)}
                              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all
                                ${sel ? "bg-primary text-white border-primary" : "bg-background text-on-surface border-outline-variant/30 hover:border-primary/30"}
                              `}
                            >
                              {lang === "ta" ? opt.ta : opt.en}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SALE PRICING */}
                {intentSale && (
                  <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/20">
                      <span className="font-bold text-sm uppercase tracking-wide">
                        {lang === "ta" ? "விற்பனை விலை" : "Sale Pricing"}
                      </span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
                        {lang === "ta" ? "ஒரு முறை" : "One-Time"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase mb-1.5">
                        {lang === "ta" ? "விற்பனை தொகை (₹) *" : "One-time Sale Price (₹) *"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-sm font-bold text-on-surface-variant">₹</span>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="e.g. 15000"
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition"
                        />
                      </div>
                    </div>

                    {/* Toggle Switch - standard height / width so it is fully visible */}
                    <div className="flex items-center justify-between p-3.5 bg-background rounded-xl border border-outline-variant/20">
                      <div>
                        <span className="text-xs font-bold block">{lang === "ta" ? "பேச்சுவார்த்தைக்கு உட்பட்டது" : "Negotiable"}</span>
                        <span className="text-[10px] text-on-surface-variant">
                          {lang === "ta" ? "விலையை குறைக்க சம்மதமா?" : "Are you open to bargaining?"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNegotiable(!negotiable)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                          ${negotiable ? "bg-[#F97316]" : "bg-outline-variant/60"}
                        `}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out
                            ${negotiable ? "translate-x-5" : "translate-x-0"}
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
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-1">
                {lang === "ta" ? "வண்டி இருப்பிடம்" : "Cart Location"}
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                {lang === "ta" ? "வண்டி நிறுத்தப்பட்டுள்ள அல்லது பெற்றுக்கொள்ளக்கூடிய இடத்தை குறிப்பிடவும்." : "Specify where your cart is stored or can be picked up."}
              </p>

              <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
                
                {/* Auto Detect Button */}
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={location.status === "loading"}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  <Compass size={16} className={location.status === "loading" ? "animate-spin" : ""} />
                  {location.status === "loading" 
                    ? (lang === "ta" ? "இருப்பிடத்தைக் கண்டறிகிறது..." : "Detecting GPS...") 
                    : (lang === "ta" ? "என் இருப்பிடத்தை தானாகக் கண்டறி" : "Auto-detect my location")}
                </button>

                {vendorProfile?.latitude && (
                  <button
                    type="button"
                    onClick={handleUseProfileLocation}
                    className="w-full py-2.5 rounded-xl bg-background text-on-surface border border-outline-variant/30 text-xs font-semibold hover:bg-outline-variant/10 transition"
                  >
                    📍 {lang === "ta" ? `என் சுயவிவர இருப்பிடத்தைப் பயன்படுத்து (${vendorProfile.area || "விற்பனையாளர் பகுதி"})` : `Use My Profile Location (${vendorProfile.area || "Vendor Area"})`}
                  </button>
                )}

                {/* Manual Address Search Input */}
                <div>
                  <label className="block text-xs font-bold uppercase mb-1.5">
                    {lang === "ta" ? "முகவரி / பகுதி தேடுக *" : "Search Address / Area *"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleGeocodeSearch()}
                      placeholder="e.g. Ondipudur, Coimbatore"
                      className="flex-1 px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={handleGeocodeSearch}
                      disabled={geocodeLoading}
                      className="px-4 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50"
                    >
                      {geocodeLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                </div>

                {/* Google Maps Integration (Always loaded using Coimbatore fallback or resolved lat/lng) */}
                <div className="relative h-60 rounded-xl border border-outline-variant/30 bg-background overflow-hidden">
                  <iframe
                    title="NTV Google Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${location.latitude || 11.0168},${location.longitude || 76.9558}&z=15&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

              </div>
            </div>
          )}

          {/* ──────────────── STEP 5: PHOTOS ──────────────── */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-1">
                {lang === "ta" ? "வண்டி புகைப்படங்கள்" : "Cart Photos"}
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                {lang === "ta" 
                  ? "வண்டியின் தெளிவான புகைப்படங்களை பதிவேற்றவும். வரிசையை மாற்ற இழுக்கவும்." 
                  : "Upload clear photos of your cart. Reorder by dragging."}
              </p>

              <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
                
                {/* Photo Counter */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {lang === "ta" ? "பட தொகுப்பு" : "Cart Gallery"}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border
                    ${selectedFiles.length >= 2 
                      ? "bg-emerald-100 border-emerald-200 text-emerald-800" 
                      : "bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]"}
                  `}>
                    {selectedFiles.length} {lang === "ta" ? "இல் 6 படங்கள் - குறைந்தபட்சம் 2 தேவை" : "of 6 photos added — min 2 required"}
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
                          className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/20 bg-background group cursor-move shadow-sm transition-transform active:scale-95"
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
                        className="relative aspect-square rounded-xl border-2 border-dashed border-outline-variant/30 bg-background flex flex-col items-center justify-center p-2 text-center"
                      >
                        <Camera size={18} className="text-on-surface-variant mb-1.5" />
                        <span className="text-[9px] font-bold leading-snug truncate w-full">
                          {lang === "ta" ? angle.ta : angle.en}
                        </span>
                        <span className="text-[7px] text-on-surface-variant mt-0.5">
                          {lang === "ta" ? "தேவை" : "Required"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Camera / Gallery explicit buttons */}
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    disabled={selectedFiles.length >= 6}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={selectedFiles.length >= 6}
                    className="flex-1 py-3 rounded-xl border border-outline-variant/30 bg-background hover:bg-outline-variant/10 transition flex items-center justify-center gap-2 text-xs font-bold text-on-surface disabled:opacity-50"
                  >
                    <Camera size={16} className="text-primary" />
                    {lang === "ta" ? "படம் எடு" : "Take Photo"}
                  </button>

                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={selectedFiles.length >= 6}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={selectedFiles.length >= 6}
                    className="flex-1 py-3 rounded-xl border border-outline-variant/30 bg-background hover:bg-outline-variant/10 transition flex items-center justify-center gap-2 text-xs font-bold text-on-surface disabled:opacity-50"
                  >
                    <Upload size={14} className="text-[#F97316]" />
                    {lang === "ta" ? "பதிவேற்று" : "Upload Photo"}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ──────────────── STEP 6: REVIEW & SUBMIT ──────────────── */}
          {step === 6 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-1">
                {lang === "ta" ? "மதிப்பாய்வு செய்து சமர்ப்பிக்கவும்" : "Review & Submit"}
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                {lang === "ta" ? "வெளியிடுவதற்கு முன் உங்கள் வண்டி விவரங்களை சரிபார்க்கவும்." : "Review your food cart details before publishing."}
              </p>

              {/* Callout box */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-6 flex flex-col gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  {lang === "ta" ? "இந்த வண்டி காண்பிக்கப்படும் இடங்கள்:" : "This cart will appear on:"}
                </span>
                <div className="flex gap-2">
                  {intentRent && (
                    <span className="px-3 py-1 bg-primary/15 text-primary text-xs font-bold rounded-full">
                      {lang === "ta" ? "வாடகைக்கு (Explore)" : "Explore (Rental)"}
                    </span>
                  )}
                  {intentSale && (
                    <span className="px-3 py-1 bg-[#F97316]/15 text-[#F97316] text-xs font-bold rounded-full">
                      {lang === "ta" ? "விற்பனைக்கு (Sales)" : "Live Sales"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* 1. Specs Details Review */}
                <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {lang === "ta" ? "வண்டியின் அமைப்புகள்" : "Specs & Attributes"}
                    </span>
                    <button onClick={() => setStep(2)} className="text-xs text-[#F97316] font-bold hover:underline">
                      {lang === "ta" ? "திருத்து" : "Edit"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">{lang === "ta" ? "வண்டி வகை:" : "Cart Type:"}</span>
                      <span className="font-semibold">{cartType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">{lang === "ta" ? "வண்டியின் நிலை:" : "Condition:"}</span>
                      <span className="font-semibold">{condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">{lang === "ta" ? "வண்டி அளவு:" : "Cart Size:"}</span>
                      <span className="font-semibold">{cartSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">{lang === "ta" ? "அடுப்பு வகை:" : "Stove Type:"}</span>
                      <span className="font-semibold">{stoveType}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Pricing Review */}
                <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {lang === "ta" ? "வாடகை மற்றும் விற்பனை தொகை" : "Pricing Terms"}
                    </span>
                    <button onClick={() => setStep(3)} className="text-xs text-[#F97316] font-bold hover:underline">
                      {lang === "ta" ? "திருத்து" : "Edit"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    {intentRent && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">{lang === "ta" ? "தினசரி வாடகை:" : "Daily Rent:"}</span>
                          <span className="font-semibold">₹{dailyRent}/{lang === "ta" ? "நாள்" : "day"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">{lang === "ta" ? "குறைந்தபட்ச வாடகை காலம்:" : "Min Rental Period:"}</span>
                          <span className="font-semibold capitalize">{minRentalPeriod}</span>
                        </div>
                      </>
                    )}
                    {intentRent && intentSale && <div className="h-px bg-outline-variant/20 my-1" />}
                    {intentSale && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">{lang === "ta" ? "விற்பனை விலை:" : "One-time Sale Price:"}</span>
                          <span className="font-semibold">₹{salePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">{lang === "ta" ? "விலையை குறைக்க சம்மதம்:" : "Negotiable:"}</span>
                          <span className="font-semibold">{negotiable ? (lang === "ta" ? "ஆம்" : "Yes") : (lang === "ta" ? "இல்லை" : "No")}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Location Review */}
                <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {lang === "ta" ? "இருப்பிடம்" : "Location"}
                    </span>
                    <button onClick={() => setStep(4)} className="text-xs text-[#F97316] font-bold hover:underline">
                      {lang === "ta" ? "திருத்து" : "Edit"}
                    </button>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">{lang === "ta" ? "முகவரி:" : "Pick-up address:"}</span>
                    <span className="font-semibold truncate max-w-[200px]">{location.address}</span>
                  </div>
                </div>

                {/* 4. Photos Review */}
                <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {lang === "ta" ? "பதிவேற்றிய புகைப்படங்கள்" : "Uploaded Photos"}
                    </span>
                    <button onClick={() => setStep(5)} className="text-xs text-[#F97316] font-bold hover:underline">
                      {lang === "ta" ? "திருத்து" : "Edit"}
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {previews.map((preview, idx) => (
                      <div key={idx} className="aspect-square rounded-lg border border-outline-variant/20 overflow-hidden bg-background">
                        <img src={preview} alt="review" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Bottom Nav Navigation - Structured cleanly matching page styles */}
          <div className="mt-8 flex gap-3">
            {/* Back Button */}
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-outline-variant/10 transition flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> {lang === "ta" ? "முன்னால்" : "Back"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="px-6 py-3.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold text-sm uppercase tracking-wider hover:bg-outline-variant/10 transition flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> {lang === "ta" ? "ரத்துசெய்" : "Cancel"}
              </button>
            )}

            {/* Next/Submit Button */}
            {step < 6 ? (
              <button
                type="button"
                disabled={!isStepValid}
                onClick={() => setStep(step + 1)}
                className="flex-1 py-3.5 rounded-xl bg-[#F97316] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#e06612] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {lang === "ta" ? "அடுத்தது" : "Next"} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading}
                className="flex-1 py-3.5 rounded-xl bg-[#F97316] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#e06612] transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> {lang === "ta" ? "சமர்ப்பிக்கிறது..." : "Submitting..."}
                  </>
                ) : (
                  (lang === "ta" ? "பதிவை சமர்ப்பி" : "Submit Listing")
                )}
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default function ListCartV2Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <img src="/brand/full-logo-new.png" alt="Namma Thalluvandi" className="w-40 h-40 object-contain animate-pulse" />
          <span className="text-primary font-bold text-xs uppercase tracking-wide">Loading Portal...</span>
        </main>
      }
    >
      <ListCartV2Content />
    </Suspense>
  );
}
