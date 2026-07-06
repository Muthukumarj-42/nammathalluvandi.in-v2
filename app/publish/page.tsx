"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, Navigation, Store, LogIn, AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCart, updateCartAction, getCartByIdAction, uploadImagesAction } from "@/app/actions";
import { reverseGeocode } from "@/lib/geocoding";
import { useAuth } from "@/context/auth-context";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

const benefits = [
  ["Distance-based match assigns closest renters", "அருகிலுள்ள வாடிக்கையாளர்களுக்கு உங்களை இணைக்கும்"],
  ["Earn recurring monthly rent from idle carts", "மாதாந்திர வாடகை மூலம் நிலையான வருமானம் ஈட்டுங்கள்"],
  ["Verified status gains customer trust", "சரிபார்க்கப்பட்ட வண்டிகளுக்கு கூடுதல் முன்னுரிமை"],
  ["Completely free to list - pay small platform fee", "பதிவு செய்ய முற்றிலும் இலவசம் - சிறிய சேவை கட்டணம் மட்டுமே"]
];

function PublishPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCartId = searchParams.get("edit");

  const { user, isVendor, vendorProfile, profile, loading: authLoading } = useAuth();

  const [lang, setLang] = useState<"en" | "ta">("en");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [editLoading, setEditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync language toggle dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentLang = document.documentElement.dataset.lang === "ta" ? "ta" : "en";
    setLang(currentLang);
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.dataset.lang === "ta" ? "ta" : "en");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
    return () => observer.disconnect();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cartType: "With Store",
    condition: "New",
    expectedRent: "",
    location: "",
    size: "6ft x 4ft",
    weight: "100kg",
    stoveType: "None",
    details: "",
    latitude: "",
    longitude: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const totalAllowed = 5;
    const currentTotal = existingPhotos.length + selectedFiles.length;
    if (currentTotal + files.length > totalAllowed) {
      alert(lang === "ta" 
        ? `அதிகபட்சம் ${totalAllowed} புகைப்படங்கள் மட்டுமே அனுமதிக்கப்படுகின்றன.` 
        : `You can only upload up to ${totalAllowed} photos in total.`);
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Pre-fill name/phone from vendor profile
  useEffect(() => {
    if (isVendor && vendorProfile && !editCartId) {
      setFormData(prev => ({
        ...prev,
        name: (vendorProfile as any).shop_name ?? profile?.name ?? prev.name,
        phone: (vendorProfile as any).phone ?? prev.phone,
      }));
    }
  }, [isVendor, vendorProfile, profile, editCartId]);

  // Load existing cart for edit mode
  useEffect(() => {
    if (!editCartId) return;
    setEditLoading(true);
    getCartByIdAction(editCartId).then(res => {
      if (res.success && res.data) {
        const c = res.data as any;
        setFormData({
          name: (vendorProfile as any)?.shop_name ?? profile?.name ?? "",
          phone: (vendorProfile as any)?.phone ?? "",
          cartType: c.type ?? "With Store",
          condition: c.condition ?? "New",
          expectedRent: String(c.price_per_day ?? ""),
          location: c.location ?? "",
          size: c.size ?? "6ft x 4ft",
          weight: c.weight ?? "100kg",
          stoveType: c.stove_type ?? "None",
          details: c.description ?? "",
          latitude: String(c.latitude ?? ""),
          longitude: String(c.longitude ?? ""),
        });
        setExistingPhotos(c.photos || c.images || []);
      }
      setEditLoading(false);
    });
  }, [editCartId]);

  const getTenDigitPhone = (phoneStr: string) => {
    const clean = phoneStr.replace(/\D/g, "");
    if (clean.length === 12 && clean.startsWith("91")) {
      return clean.slice(2);
    }
    return clean;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === "phone") {
      const digits = getTenDigitPhone(value);
      setPhoneError(value && digits.length !== 10 ? "Phone number must be exactly 10 digits" : "");
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setGeoStatus("error"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        reverseGeocode(lat, lng)
          .then(locName => { setFormData(prev => ({ ...prev, location: locName })); setGeoStatus("success"); })
          .catch(() => setGeoStatus("success"));
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    getTenDigitPhone(formData.phone).length === 10 &&
    formData.location.trim() !== "" &&
    formData.expectedRent.trim() !== "" &&
    phoneError === "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !user) return;
    setSubmitLoading(true);
    try {
      const latVal = formData.latitude.trim() !== "" ? Number(formData.latitude) : undefined;
      const lngVal = formData.longitude.trim() !== "" ? Number(formData.longitude) : undefined;

      let finalPhotos = [...existingPhotos];

      if (selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        selectedFiles.forEach(file => {
          uploadFormData.append("images", file);
        });
        const uploadRes = await uploadImagesAction(uploadFormData);
        if (uploadRes.success && uploadRes.urls) {
          finalPhotos = [...finalPhotos, ...uploadRes.urls];
        } else {
          throw new Error(uploadRes.error || "Failed to upload images");
        }
      }

      if (editCartId) {
        await updateCartAction(editCartId, {
          type: formData.cartType,
          condition: formData.condition,
          size: formData.size,
          weight: formData.weight,
          stove_type: formData.stoveType,
          price_per_day: Number(formData.expectedRent),
          description: formData.details,
          latitude: latVal,
          longitude: lngVal,
          photos: finalPhotos,
        });
        alert(lang === "ta" ? "வண்டி விவரங்கள் புதுப்பிக்கப்பட்டன!" : "Cart updated successfully!");
        router.push("/vendor/dashboard");
      } else {
        await saveCart({
          nameEn: formData.cartType,
          nameTa: formData.cartType,
          type: formData.cartType,
          pricePerDay: Number(formData.expectedRent) || 80,
          depositAmount: 2000,
          availableCount: 1,
          descriptionEn: formData.details,
          descriptionTa: formData.details,
          vendorName: formData.name,
          vendorPhone: formData.phone,
          vendorLocation: formData.location,
          latitude: latVal,
          longitude: lngVal,
          condition: formData.condition,
          size: formData.size,
          weight: formData.weight,
          stoveType: formData.stoveType,
          ownerId: user.id,
          photos: finalPhotos,
        });
        setSubmitSuccess(true);
      }
    } catch (err: any) {
      console.error("Failed to save cart:", err);
      alert(lang === "ta" 
        ? `படிவம் சமர்ப்பிக்க முடியவில்லை. பிழை: ${err.message}` 
        : `Failed to submit. Error: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Auth Loading ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <main className="bg-[#F8F6F2] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Not Logged In ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="bg-[#F8F6F2] min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-8 h-8 text-[#f97316]" />
          </div>
          <h1 className="font-display text-4xl uppercase leading-none text-ink mb-3">
            <Text en="Sign In to List Your Cart" ta="வண்டி பதிவிட உள்நுழையவும்" />
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-8">
            <Text
              en="You need an account to list your cart on Thalluvandi. Sign in or create an account to continue."
              ta="உங்கள் வண்டியை பதிவிட கணக்கு தேவை. தொடர உள்நுழைக அல்லது கணக்கு உருவாக்கவும்."
            />
          </p>
          <Link
            href="/login?redirect=/publish"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base transition"
          >
            <LogIn className="w-5 h-5" />
            <Text en="Login / Register" ta="உள்நுழை / பதிவு செய்" />
          </Link>
          <div className="mt-6 border-t border-black/5 pt-6">
            <p className="text-xs text-muted mb-4 font-semibold uppercase tracking-wider">Why list on Thalluvandi?</p>
            <div className="grid gap-2">
              {benefits.map(([b, t]) => (
                <div key={b} className="flex items-center gap-2 text-left text-xs text-ink/70">
                  <CheckCircle2 className="w-4 h-4 text-[#f97316] shrink-0" />
                  <Text en={b} ta={t} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Logged In but No Vendor Profile ──────────────────────────────────────────
  if (!isVendor) {
    return (
      <main className="bg-[#F8F6F2] min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="font-display text-4xl uppercase leading-none text-ink mb-3">
            <Text en="Create Vendor Profile First" ta="முதலில் விற்பனையாளர் சுயவிவரம் உருவாக்கவும்" />
          </h1>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left mb-6">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <Text
                en="To list a cart, you first need to create your vendor profile with your shop name, contact details, and business info. It only takes a minute and your profile goes live immediately!"
                ta="வண்டியை பதிவிட, முதலில் உங்கள் கடை பெயர், தொடர்பு விவரங்கள் மற்றும் வணிக தகவல்களுடன் விற்பனையாளர் சுயவிவரத்தை உருவாக்க வேண்டும். இது ஒரு நிமிடம் மட்டுமே ஆகும்!"
              />
            </p>
          </div>
          <Link
            href="/vendor/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base transition"
          >
            <Store className="w-5 h-5" />
            <Text en="Create Vendor Profile" ta="விற்பனையாளர் சுயவிவரம் உருவாக்கு" />
          </Link>
          <p className="text-xs text-muted mt-4">
            <Text en="After creating your profile, you can come back here to list your carts." ta="சுயவிவரம் உருவாக்கிய பிறகு, இங்கே திரும்பி வண்டிகளை பதிவிடலாம்." />
          </p>
        </div>
      </main>
    );
  }

  // ── Submit Success ────────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <main className="bg-[#F8F6F2] min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display text-4xl uppercase leading-none text-ink mb-3">
            <Text en="Cart Listing Submitted!" ta="வண்டி பதிவு சமர்ப்பிக்கப்பட்டது!" />
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-8">
            <Text
              en="Your cart listing is now under admin review. It will go live on the marketplace once approved. You'll be able to manage it from your vendor dashboard."
              ta="உங்கள் வண்டி பதிவு இப்போது நிர்வாக மதிப்பாய்வில் உள்ளது. அனுமதிக்கப்பட்ட பிறகு சந்தையில் நேரலையில் வரும். உங்கள் விற்பனையாளர் டாஷ்போர்டிலிருந்து நிர்வகிக்கலாம்."
            />
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base transition"
            >
              <Text en="Go to Vendor Dashboard" ta="விற்பனையாளர் டாஷ்போர்டு" />
            </Link>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl border border-black/10 bg-white text-ink font-semibold text-sm hover:bg-[#F8F6F2] transition"
            >
              <Text en="List Another Cart" ta="மற்றொரு வண்டியை சேர்க்கவும்" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Edit Loading ──────────────────────────────────────────────────────────────
  if (editLoading) {
    return (
      <main className="bg-[#F8F6F2] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────────
  return (
    <main className="bg-[#F8F6F2] pt-16 md:pt-28">
      <section className="pb-20 pt-4 md:pb-24 md:pt-0">
        <div className="site-container grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-12 items-start">
          <div className="flex flex-col justify-between h-full py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Text en="Vendor Network" ta="வண்டி உரிமையாளர் நெட்வொர்க்" />
              </p>
              <h1 className="mt-3 font-display text-5xl uppercase leading-none text-ink md:text-7xl">
                <Text
                  en={editCartId ? "Edit Your Cart Listing" : "List Your Thallu Vandi Across Tamil Nadu"}
                  ta={editCartId ? "உங்கள் வண்டி பட்டியலை திருத்தவும்" : "தமிழ்நாடு முழுவதும் உங்கள் வண்டியை பதிவு செய்யுங்கள்"}
                />
              </h1>
              <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted">
                <Text
                  en="If you own a food cart and want more rental customers, publish it on Thalluvandi. We list verified carts on our premium platform, and nearby enquiries are routed directly to you via distance-based matching!"
                  ta="உங்களுக்கு தள்ளுவண்டி இருந்தால் தள்ளுவண்டி தளத்தில் உங்கள் வண்டியை பதிவு செய்யுங்கள் — அருகிலுள்ள வாடிக்கையாளர்களை உங்களுக்கு உடனடியாக இணைத்துத் தருகிறோம்!"
                />
              </p>
            </div>

            <div className="mt-10 border-t border-black/5 pt-8">
              <h3 className="font-bold text-sm uppercase tracking-wider text-primary mb-4">
                <Text en="How coordinates routing works" ta="இருப்பிட வழிகாட்டி எவ்வாறு இயங்குகிறது?" />
              </h3>
              <p className="text-sm leading-relaxed text-muted max-w-md">
                <Text
                  en="We capture your exact latitude and longitude coordinates. When a business owner searches for a cart near them, our algorithm calculates the distance and maps them to you if you are the closest available provider."
                  ta="உங்கள் வண்டியின் சரியான அட்சரேகை (Latitude) மற்றும் தீர்க்கரேகை (Longitude) தகவல்களைப் பயன்படுத்துகிறோம். இதன் மூலம் அருகிலுள்ள வாடிக்கையாளர் தேடும்போது உங்கள் வண்டி முன்னிலைப்படுத்தப்படும்."
                />
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#fffdf7] p-6 shadow-premium md:p-8 flex flex-col gap-5">
            <div>
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                <Text en={editCartId ? "Edit Cart Details" : "Quick Listing Form"} ta={editCartId ? "வண்டி விவரங்களை திருத்து" : "விரைவு பதிவு படிவம்"} />
              </h2>
              {editCartId && (
                <p className="text-xs text-muted mt-2">
                  <Text en="Editing an existing listing. Changes will be visible to admin." ta="ஏற்கனவே உள்ள பட்டியலை திருத்துகிறீர்கள். மாற்றங்கள் நிர்வாகருக்கு தெரியும்." />
                </p>
              )}
              {!editCartId && (
                <p className="text-xs mt-2 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  <Text en="Your listing will be reviewed by admin before going live." ta="உங்கள் பட்டியல் நேரலையில் வருவதற்கு முன் நிர்வாகி ஆய்வு செய்வார்." />
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Full Name *" ta="பெயர் *" />
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={lang === "ta" ? "உங்கள் பெயர்" : "Enter your name"}
                    className="w-full h-12 border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 bg-white text-base outline-none transition"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="WhatsApp Phone Number *" ta="வாட்ஸ்அப் எண் *" />
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={lang === "ta" ? "10 இலக்கங்கள்" : "10 digits"}
                    className={`w-full h-12 border focus:ring-2 rounded-xl px-4 bg-white text-base outline-none transition ${
                      phoneError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                        : "border-[#e5e0d8] focus:border-primary focus:ring-primary/40"
                    }`}
                  />
                  {phoneError && <span className="text-xs text-red-500 mt-1 font-semibold">{phoneError}</span>}
                </div>
              </div>

              {/* Cart Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="cartType" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Cart Type / Variant *" ta="வண்டி வகை *" />
                  </label>
                  <select
                    id="cartType"
                    value={formData.cartType}
                    onChange={handleChange}
                    className="w-full h-12 border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 bg-white text-sm outline-none transition cursor-pointer"
                  >
                    <option value="With Store">With Store / Stove Cart</option>
                    <option value="With Roof">With Roof / Covered</option>
                    <option value="Ice Cream">Ice Cream Cart</option>
                    <option value="Tea Stall">Tea Stall Station</option>
                    <option value="Other">Other Custom Variant</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="condition" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Condition *" ta="நிலை *" />
                  </label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full h-12 border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 bg-white text-sm outline-none transition cursor-pointer"
                  >
                    <option value="New">Brand New</option>
                    <option value="Used - Very Good">Used - Very Good</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Fair">Fair / Work Needed</option>
                  </select>
                </div>
              </div>

              {/* Size, Weight, Stove */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <label htmlFor="size" className="text-[10px] font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Size" ta="அளவு" />
                  </label>
                  <input
                    type="text"
                    id="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="e.g. 5ft x 3ft"
                    className="w-full h-10 border border-[#e5e0d8] rounded-lg px-2 bg-white text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="weight" className="text-[10px] font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Weight" ta="எடை" />
                  </label>
                  <input
                    type="text"
                    id="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 100kg"
                    className="w-full h-10 border border-[#e5e0d8] rounded-lg px-2 bg-white text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="stoveType" className="text-[10px] font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Stove Type" ta="அடுப்பு வகை" />
                  </label>
                  <input
                    type="text"
                    id="stoveType"
                    value={formData.stoveType}
                    onChange={handleChange}
                    placeholder="e.g. Single Burner"
                    className="w-full h-10 border border-[#e5e0d8] rounded-lg px-2 bg-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Expected Rent & Location Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="expectedRent" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Expected Daily Rent (₹) *" ta="தினசரி வாடகை (₹) *" />
                  </label>
                  <input
                    type="number"
                    id="expectedRent"
                    required
                    value={formData.expectedRent}
                    onChange={handleChange}
                    placeholder="e.g. 80"
                    className="w-full h-12 border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 bg-white text-base outline-none transition"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Location / Area *" ta="இடம் / பகுதி *" />
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Ondipudur, Coimbatore"
                    className="w-full h-12 border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl px-4 bg-white text-base outline-none transition"
                  />
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="bg-[#fcfbf9] border border-black/5 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <Text en="GPS Coordinates (Required) *" ta="GPS இருப்பிட புள்ளிகள் *" />
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition"
                  >
                    <Navigation className="w-3 h-3" />
                    <Text en="Auto-Detect Location" ta="தானியங்கி இருப்பிடம்" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="latitude" className="text-[10px] uppercase text-muted mb-1">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      placeholder="e.g. 11.0028"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full h-10 border border-[#e5e0d8] rounded-lg px-3 text-sm bg-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="longitude" className="text-[10px] uppercase text-muted mb-1">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      placeholder="e.g. 77.0347"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full h-10 border border-[#e5e0d8] rounded-lg px-3 text-sm bg-white"
                    />
                  </div>
                </div>

                {geoStatus === "loading" && <p className="text-[10px] text-amber-600 animate-pulse">Fetching GPS coordinates from browser...</p>}
                {geoStatus === "success" && <p className="text-[10px] text-green-600 font-bold">Successfully populated GPS coordinates!</p>}
                {geoStatus === "error" && <p className="text-[10px] text-red-500">Could not retrieve GPS coordinates automatically. Please input manually.</p>}
              </div>

              {/* Photo Upload Section */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block">
                  <Text en="Cart Photos" ta="வண்டி புகைப்படங்கள்" />
                </label>
                
                <div className="relative group border-2 border-dashed border-[#e5e0d8] hover:border-primary/60 transition rounded-xl p-6 bg-white flex flex-col items-center justify-center cursor-pointer text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#a39e93] group-hover:text-primary transition mb-2" />
                  <span className="text-sm font-semibold text-ink">
                    <Text en="Click or drag photos to upload" ta="புகைப்படங்களை பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்" />
                  </span>
                  <span className="text-xs text-muted mt-1">
                    <Text en="PNG, JPG, WEBP, or HEIC (Up to 5 photos)" ta="PNG, JPG, WEBP அல்லது HEIC (அதிகபட்சம் 5 புகைப்படங்கள்)" />
                  </span>
                </div>

                {/* Previews Grid */}
                {(existingPhotos.length > 0 || previews.length > 0) && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {/* Existing Photos */}
                    {existingPhotos.map((photo, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square border border-[#e5e0d8] rounded-xl overflow-hidden">
                        <img src={photo} alt="Existing" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-amber-500 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                          <Text en="Saved" ta="சேமிக்கப்பட்டது" />
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* New Previews */}
                    {previews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square border border-dashed border-primary/40 rounded-xl overflow-hidden">
                        <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-primary text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                          <Text en="New" ta="புதியது" />
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label htmlFor="details" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                  <Text en="Equipment Included / Details (Optional)" ta="வண்டி விவரங்கள் (விருப்பம்)" />
                </label>
                <textarea
                  id="details"
                  rows={3}
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Shelves description, burner details..."
                  className="w-full border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl p-4 bg-white text-base outline-none transition resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={!isFormValid || submitLoading}
                className={`w-full h-14 bg-error hover:bg-error/90 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition duration-200 ${
                  !isFormValid || submitLoading ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                {submitLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                    </svg>
                    <Text en={editCartId ? "Saving Changes…" : "Submitting…"} ta={editCartId ? "சேமிக்கிறோம்…" : "சமர்ப்பிக்கிறோம்…"} />
                  </span>
                ) : (
                  <Text en={editCartId ? "Save Changes" : "Submit Listing Request"} ta={editCartId ? "மாற்றங்களை சேமி" : "வண்டியை பதிவு செய்"} />
                )}
              </Button>

            </form>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="site-container">
          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
            <h2 className="font-display text-5xl uppercase leading-none text-ink">
              <Text en="Why list on Thalluvandi?" ta="ஏன் தள்ளுவண்டி தளத்தில் பதிவு செய்ய வேண்டும்?" />
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
              {benefits.map(([benefit, tamil]) => (
                <div key={benefit} className="flex min-h-14 items-center gap-3 rounded-xl border border-black/10 bg-[#F8F6F2] p-4 text-left font-bold text-ink">
                  <CheckCircle2 className="shrink-0 text-primary" />
                  <Text en={benefit} ta={tamil} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PublishPage() {
  return (
    <Suspense fallback={
      <main className="bg-[#F8F6F2] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <PublishPageContent />
    </Suspense>
  );
}
