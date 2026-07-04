"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getCart, type Cart } from "@/lib/carts";
import { saveBooking } from "@/app/actions";
import { reverseGeocode } from "@/lib/geocoding";

const TAMIL_DICTIONARY: Record<string, string> = {
  // Pronouns / Particles
  "i": "நான்",
  "we": "நாங்கள்",
  "my": "என்",
  "our": "எங்கள்",
  "a": "ஒரு",
  "an": "ஒரு",
  "the": "அந்த",
  "and": "மற்றும்",
  "with": "உடன்",
  "for": "வழியாக",
  "to": "உக்கு",
  "in": "இல்",
  "at": "இல்",
  "of": "இன்",
  
  // Names
  "nagaraj": "நாகராஜ்",
  "nagarajan": "நாகராஜ்",
  "muthu": "முத்து",
  "kumar": "குமார்",
  "muthukumar": "முத்துக்குமார்",
  "raja": "ராஜா",
  "ramesh": "ரமேஷ்",
  "suresh": "சுரேஷ்",
  "ganesh": "கணேஷ்",
  "dinesh": "தினேஷ்",
  "murugan": "முருகன்",
  "karthik": "கார்த்திக்",
  "karthi": "கார்த்தி",
  "senthil": "செந்தில்",
  "mani": "மணி",
  "selvam": "செல்வம்",
  "annadurai": "அண்ணாதுரை",
  "durai": "துரை",

  // Locations
  "coimbatore": "கோயம்புத்தூர்",
  "kovai": "கோவை",
  "ondipudur": "ஒண்டிப்புதூர்",
  "singanallur": "சிங்காநல்லூர்",
  "ramanathapuram": "இராமநாதபுரம்",
  "gandhipuram": "காந்திபுரம்",
  "townhall": "டவுன்ஹால்",
  "town hall": "டவுன் ஹால்",
  "peelamedu": "பீளமேடு",
  "saravanampatti": "சரவணம்பட்டி",
  "sundarapuram": "சுந்தராபுரம்",
  "kuniyamuthur": "குனியமுத்தூர்",
  "kovaipudur": "கோவைப்புதூர்",
  "thudiyalur": "துடியலூர்",
  "vadavalli": "வடவள்ளி",
  "sulur": "சூலூர்",
  "saibaba colony": "சாய்பாபா காலனி",
  "rs puram": "ஆர்.எஸ். புரம்",
  "race course": "ரேஸ் கோர்ஸ்",
  "sowripalayam": "சௌரிபாளையம்",
  "puliakulam": "புலியகுளம்",
  "hopes": "ஹோப்ஸ்",
  "hope college": "ஹோப் காலேஜ்",
  "jallimedu": "ஜல்லிமேடு",
  "aruljothipuram": "அருள்ஜோதிபுரம்",

  // Business / Carts / Features
  "tea": "டீ",
  "coffee": "காபி",
  "juice": "ஜூஸ்",
  "fast food": "ஃபாஸ்ட் ஃபுட்",
  "fastfood": "ஃபாஸ்ட் ஃபுட்",
  "snacks": "ஸ்நாக்ஸ்",
  "snack": "ஸ்நாக்ஸ்",
  "momo": "மோமோ",
  "momos": "மோமோஸ்",
  "biryani": "பிரியாணி",
  "stove": "அடுப்பு",
  "cart": "வண்டி",
  "carts": "வண்டிகள்",
  "rent": "வாடகை",
  "rental": "வாடகை",
  "need": "வேண்டும்",
  "want": "வேண்டும்",
  "please": "தயவுசெய்து",
  "yes": "ஆம்",
  "no": "இல்லை",
  "none": "இல்லை",
  "nil": "இல்லை",
  "nothing": "இல்லை",
  "good": "நல்லது",
  "shop": "கடை",
  "stall": "கடை",
  "hotel": "உணவகம்",
  "restaurant": "உணவகம்",
  "food": "உணவு",
  "catering": "கேட்டரிங்",
};

function transliterateWordToTamil(word: string): string {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "").trim();
  if (!cleanWord) return word;

  if (TAMIL_DICTIONARY[cleanWord]) {
    return TAMIL_DICTIONARY[cleanWord];
  }

  if (/^[a-z]+$/.test(cleanWord)) {
    let result = "";
    let i = 0;

    const vowels = new Set(["a", "e", "i", "o", "u", "y"]);

    const consonantMap: Record<string, string> = {
      "ch": "ச",
      "sh": "ஷ",
      "th": "த",
      "dh": "த",
      "ph": "ப",
      "bh": "ப",
      "kh": "க",
      "gh": "க",
      "nj": "ஞ",
      "ng": "ங",
      "k": "க",
      "g": "க",
      "c": "ச",
      "j": "ஜ",
      "t": "ட",
      "d": "ட",
      "n": "ன",
      "p": "ப",
      "b": "ப",
      "m": "ம",
      "y": "ய",
      "r": "ர",
      "l": "ல",
      "v": "வ",
      "w": "வ",
      "s": "ஸ",
      "h": "ஹ",
    };

    const vowelSignMap: Record<string, string> = {
      "aa": "ா",
      "ee": "ீ",
      "oo": "ூ",
      "ai": "ை",
      "ou": "ௌ",
      "a": "",
      "e": "ே",
      "i": "ி",
      "o": "ோ",
      "u": "ு",
      "y": "ி",
    };

    const independentVowelMap: Record<string, string> = {
      "aa": "ஆ",
      "ee": "ஈ",
      "oo": "ஊ",
      "ai": "ஐ",
      "ou": "ஔ",
      "a": "அ",
      "e": "எ",
      "i": "இ",
      "o": "ஒ",
      "u": "உ",
      "y": "இ",
    };

    while (i < cleanWord.length) {
      let char = cleanWord[i];

      if (vowels.has(char)) {
        let vGroup = char;
        if (i + 1 < cleanWord.length && vowels.has(cleanWord[i + 1]) && (char + cleanWord[i + 1]) in independentVowelMap) {
          vGroup = char + cleanWord[i + 1];
          i += 2;
        } else {
          i += 1;
        }
        result += independentVowelMap[vGroup] || "";
        continue;
      }

      let cGroup = char;
      if (i + 1 < cleanWord.length && (char + cleanWord[i + 1]) in consonantMap) {
        cGroup = char + cleanWord[i + 1];
      }

      let tamilConsonant = consonantMap[cGroup];
      if (!tamilConsonant) {
        result += char;
        i += 1;
        continue;
      }

      i += cGroup.length;

      if (i < cleanWord.length && vowels.has(cleanWord[i])) {
        let vChar = cleanWord[i];
        let vGroup = vChar;
        if (i + 1 < cleanWord.length && vowels.has(cleanWord[i + 1]) && (vChar + cleanWord[i + 1]) in vowelSignMap) {
          vGroup = vChar + cleanWord[i + 1];
          i += 2;
        } else {
          i += 1;
        }

        let vowelSign = vowelSignMap[vGroup];
        if (vGroup === "a" && i === cleanWord.length && cleanWord.length > 3) {
          vowelSign = "ா";
        }

        result += tamilConsonant + vowelSign;
      } else {
        result += tamilConsonant + "்";
      }
    }
    return result;
  }

  return word;
}

function translateSentenceToTamil(text: string): string {
  if (!text) return "";
  const tokens = text.split(/(\s+|[,.!?;:()\"\'\-]+)/);
  const translatedTokens = tokens.map((token) => {
    if (/^[\s+,.!?;:()\"\'\-]+$/.test(token)) {
      return token;
    }
    return transliterateWordToTamil(token);
  });
  return translatedTokens.join("");
}

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

export function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cartId = searchParams.get("cart");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState<"en" | "ta">("en");
  const [todayDate, setTodayDate] = useState("");
  const [imgError, setImgError] = useState(false);


  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
    details: "",
    latitude: "",
    longitude: "",
  });
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Auto-detect current coordinates using Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));

        reverseGeocode(lat, lng)
          .then((locName) => {
            setFormData((prev) => ({
              ...prev,
              location: locName,
            }));
            setGeoStatus("success");
          })
          .catch((err) => {
            console.error("Geocoding error:", err);
            setGeoStatus("success");
          });
      },
      (error) => {
        console.error("Error fetching location:", error);
        setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Validation States
  const [phoneError, setPhoneError] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Fetch Cart Details on mount/cartId change
  useEffect(() => {
    if (cartId) {
      setLoading(true);
      getCart(cartId).then((data) => {
        setCart(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [cartId]);

  // Sync language toggle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentLang =
      document.documentElement.dataset.lang === "ta" ? "ta" : "en";
    setLang(currentLang);
    setTodayDate(new Date().toISOString().split("T")[0]);

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

  // Redirect if cart not found (only after loading has finished)
  useEffect(() => {
    if (!loading && !cart) {
      router.replace("/explore");
    }
  }, [cart, loading, router]);

  if (loading) {
    return (
      <main className="bg-[#fffdf7] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted text-sm font-semibold">
            <Text en="Loading booking details..." ta="முன்பதிவு விவரங்கள் ஏற்றப்படுகின்றன..." />
          </p>
        </div>
      </main>
    );
  }

  if (!cart) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "phone") {
      // Validate phone number (must be 10 digits)
      const digits = value.replace(/\D/g, "");
      if (value && digits.length !== 10) {
        setPhoneError(
          lang === "ta"
            ? "தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்"
            : "Phone number must be exactly 10 digits",
        );
      } else {
        setPhoneError("");
      }
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.phone.replace(/\D/g, "").length === 10 &&
    formData.date !== "" &&
    formData.date >= todayDate &&
    formData.location.trim() !== "" &&
    formData.latitude.trim() !== "" &&
    formData.longitude.trim() !== "" &&
    agreed &&
    phoneError === "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const translatedName = translateSentenceToTamil(formData.name.trim());
    const translatedLocation = translateSentenceToTamil(formData.location.trim());
    const translatedDetails = formData.details.trim() !== "" 
      ? translateSentenceToTamil(formData.details.trim()) 
      : "இல்லை";

    // Persist booking lead in database
    try {
      await saveBooking({
        cartId: cart.id,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        date: formData.date,
        location: formData.location.trim(),
        duration: "1 month",
        details: formData.details.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
    } catch (err) {
      console.error("Failed to save booking to database:", err);
    }

    // Build message dynamically strictly in Tamil as required
    const message = `வணக்கம், நான் ${cart.nameTa} வாடகைக்கு எடுக்க விரும்புகிறேன் (வி2 வண்டிகள் தேடல்).

பெயர்: ${translatedName}
தொலைபேசி: ${formData.phone.trim()}
தேவையான தேதி: ${formData.date}
இடம் (கோவையில்): ${translatedLocation}
மேலும் விவரம்: ${translatedDetails}

அனைத்து வாடகை விதிகளையும் படித்து ஒப்புக்கொண்டேன். ✓`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/918838292849?text=${encodedMessage}`;
    window.open(waUrl, "_blank");
  };

  const placeholders = {
    name: lang === "ta" ? "உங்கள் பெயர் உள்ளிடுங்கள்" : "Enter your full name",
    phone: lang === "ta" ? "உங்கள் கைபேசி எண்" : "Enter your mobile number",
    location: lang === "ta" ? "உங்கள் கடை / இடம்" : "Your shop/stall location",
    details:
      lang === "ta"
        ? "கூடுதல் தேவைகள் அல்லது கேள்விகள்?"
        : "Any special requirements or questions?",
  };

  return (
    <main className="bg-[#fffdf7] min-h-screen text-[#1a1208] pb-16 pt-6 md:pt-24">
      <div className="max-w-lg md:max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column (Navigation, Cart Card, Rules) */}
          <div className="md:col-span-5 flex flex-col gap-6 md:sticky md:top-24">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-[#78716c] hover:text-[#f97316] font-semibold text-sm w-fit transition"
              >
                <ArrowLeft size={16} />
                <span className="en">Back</span>
                <span className="ta tamil-text">பின்னால்</span>
              </button>

              <div>
                <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-ink">
                  <span className="en">Book This Cart</span>
                  <span className="ta tamil-text text-3xl">
                    வண்டி முன்பதிவு செய்யுங்கள்
                  </span>
                </h1>
                <p className="mt-1 text-sm font-bold text-[#f97316] uppercase tracking-widest">
                  {cart.nameEn}
                </p>
              </div>
            </div>

            {/* Cart Summary Card */}
            <div className="overflow-hidden rounded-2xl border border-[#f97316]/20 bg-white p-4 shadow-sm flex flex-col gap-4 transition duration-300 hover:shadow-premium">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#fff7ed]">
                {imgError || !cart.images[0] ? (
                  <div className="relative w-full h-full bg-[#1a1208] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <Image
                      src="/brand/full-logo-with-background.webp"
                      alt="Thalluvandi fallback logo"
                      fill
                      sizes="100vw"
                      className="object-contain p-6 opacity-40 z-20"
                    />
                  </div>
                ) : (
                  <Image
                    src={cart.images[0]}
                    alt={cart.nameEn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                )}
                {/* Availability Badge */}
                <span
                  className={`absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    cart.availableCount >= 2
                      ? "bg-green-500 text-white"
                      : cart.availableCount === 1
                        ? "bg-amber-400 text-black"
                        : "bg-red-500 text-white"
                  }`}
                >
                  {cart.availableCount >= 2
                    ? "AVAILABLE"
                    : cart.availableCount === 1
                      ? "LIMITED"
                      : "BOOKED"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-display text-2xl uppercase leading-tight text-ink">
                  {cart.nameEn}
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-2 border-t border-[#e5e0d8] pt-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716c]">
                      DAILY PRICE
                    </p>
                    <p className="font-display text-2xl font-bold text-[#f97316] mt-0.5">
                      ₹{cart.pricePerDay}/day
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716c]">
                      DEPOSIT AMOUNT
                    </p>
                    <p className="font-display text-2xl font-bold text-ink mt-0.5">
                      ₹{cart.depositAmount}{" "}
                      <span className="text-[10px] font-sans font-semibold text-[#78716c] uppercase tracking-normal">
                        (Refundable)
                      </span>
                    </p>
                  </div>
                </div>


              </div>
            </div>

            {/* Rental Rules (Desktop Only) */}
            <div className="hidden md:block">
              <RentalRules lang={lang} />
            </div>
          </div>

          {/* Right Column (Form Details) */}
          <div className="md:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 md:p-8 rounded-2xl border border-[#f97316]/10 shadow-premium-dark space-y-5"
            >
              <h2 className="font-display text-3xl uppercase tracking-wide text-ink border-b border-[#e5e0d8] pb-2">
                <span className="en">Your Details</span>
                <span className="ta tamil-text text-2xl">உங்கள் விவரங்கள்</span>
              </h2>

              {/* Field 1: Name */}
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold mb-1 block"
                >
                  <span className="en">Full Name *</span>
                  <span className="ta tamil-text">பெயர் *</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={placeholders.name}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-base outline-none transition"
                />
              </div>

              {/* Field 2: Phone */}
              <div className="flex flex-col">
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold mb-1 block"
                >
                  <span className="en">Phone Number *</span>
                  <span className="ta tamil-text">தொலைபேசி எண் *</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={placeholders.phone}
                  className={`w-full h-12 border focus:ring-2 rounded-xl px-4 bg-white text-base outline-none transition ${
                    phoneError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                      : "border-[#e5e0d8] focus:border-[#f97316] focus:ring-[#f97316]/40"
                  }`}
                />
                {phoneError && (
                  <span className="text-xs text-red-500 mt-1 font-semibold">
                    {phoneError}
                  </span>
                )}
              </div>

              {/* Field 3: Date */}
              <div className="flex flex-col">
                <label
                  htmlFor="date"
                  className="text-sm font-semibold mb-1 block"
                >
                  <span className="en">Required Date *</span>
                  <span className="ta tamil-text">தேவையான தேதி *</span>
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  min={todayDate}
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-base outline-none transition"
                />
              </div>

              {/* Field 4: Location */}
              <div className="flex flex-col">
                <label
                  htmlFor="location"
                  className="text-sm font-semibold mb-1 block"
                >
                  <span className="en">Location in Coimbatore *</span>
                  <span className="ta tamil-text">இடம் (கோவையில்) *</span>
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={placeholders.location}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-base outline-none transition"
                />
              </div>

              {/* Field 5: GPS Coordinates */}
              <div className="bg-orange-50/50 border border-orange-200/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                    <span className="en">GPS Coordinates (Required) *</span>
                    <span className="ta tamil-text text-[10px]">GPS இருப்பிடம் *</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-xs font-bold text-[#f97316] hover:text-[#f97316]/80 flex items-center gap-1 transition"
                  >
                    <span className="en">Auto-Detect</span>
                    <span className="ta tamil-text text-[10px]">கண்டறியவும்</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="latitude" className="text-[10px] uppercase text-[#78716c] mb-1">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      required
                      placeholder="e.g. 11.0030"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full h-10 border border-[#e5e0d8] rounded-lg px-3 text-sm bg-white text-ink outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="longitude" className="text-[10px] uppercase text-[#78716c] mb-1">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      required
                      placeholder="e.g. 77.0350"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full h-10 border border-[#e5e0d8] rounded-lg px-3 text-sm bg-white text-ink outline-none"
                    />
                  </div>
                </div>

                {geoStatus === "loading" && (
                  <p className="text-[10px] text-amber-600 animate-pulse">
                    <Text en="Detecting GPS coordinates..." ta="ஜிபிஎஸ் ஆயத்தொலைவுகள் கண்டறியப்படுகின்றன..." />
                  </p>
                )}
                {geoStatus === "success" && (
                  <p className="text-[10px] text-green-600 font-bold">
                    <Text en="Successfully populated GPS coordinates!" ta="ஜிபிஎஸ் ஆயத்தொலைவுகள் வெற்றிகரமாக பெறப்பட்டன!" />
                  </p>
                )}
                {geoStatus === "error" && (
                  <p className="text-[10px] text-red-500">
                    <Text en="Could not retrieve GPS automatically. Please input manually." ta="ஜிபிஎஸ் தானாகப் பெற முடியவில்லை. தயவுசெய்து கைமுறையாக உள்ளிடவும்." />
                  </p>
                )}
              </div>

              {/* Field 6: Details */}
              <div className="flex flex-col">
                <label
                  htmlFor="details"
                  className="text-sm font-semibold mb-1 block"
                >
                  <span className="en">Additional Details (Optional)</span>
                  <span className="ta tamil-text">
                    மேலும் விவரம் (விருப்பம்)
                  </span>
                </label>
                <textarea
                  id="details"
                  rows={3}
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder={placeholders.details}
                  className="w-full border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl p-4 bg-white text-base outline-none transition resize-none"
                />
              </div>

              {/* Rental Rules (Mobile Only) */}
              <div className="block md:hidden">
                <RentalRules lang={lang} />
              </div>

              {/* SECTION E — CHECKBOX + SUBMIT */}
              <div className="pt-4 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#e5e0d8] bg-white text-[#f97316] focus:ring-[#f97316] focus:ring-offset-white transition"
                  />
                  <span className="text-sm text-[#78716c] font-semibold group-hover:text-[#1a1208] transition">
                    <span className="en">
                      I have read and agree to all rental terms
                    </span>
                    <span className="ta tamil-text text-[11px]">
                      அனைத்து வாடகை விதிகளையும் படித்து ஒப்புக்கொள்கிறேன்
                    </span>
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition duration-200 ${
                    !isFormValid ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <MessageCircle size={20} className="shrink-0" />
                  <span className="en">Continue to WhatsApp →</span>
                  <span className="ta tamil-text text-sm tracking-normal normal-case">
                    WhatsApp-ல் தொடரவும் →
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function RentalRules({ lang }: { lang: "en" | "ta" }) {
  return (
    <div className="pt-4">
      <h3 className="text-base font-bold mb-3 border-b border-[#e5e0d8] pb-1">
        <span className="en">Rental Terms</span>
        <span className="ta tamil-text">வாடகை விதிகள்</span>
      </h3>

      {/* Rules Box */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 space-y-1.5">
        {/* EN Rules List */}
        <div className="en space-y-3">
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">1.</span>
            <span>
              Cart must be rented in the name of the person running the
              business.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">2.</span>
            <span>
              Picking up and returning the cart is entirely the renter's
              responsibility.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">3.</span>
            <span>Any damage to the cart must be paid for by the renter.</span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">4.</span>
            <span>
              Return the cart clean. ₹500 will be deducted for cleaning if
              returned dirty.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">5.</span>
            <span>
              Documents will be returned only after the cart is safely returned.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">6.</span>
            <span>Violation of rules will result in legal action.</span>
          </div>
          {/* Rule 7 Highlighted */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-xl font-medium text-sm leading-relaxed border-y border-r border-[#f97316]/10">
            <span className="text-[#f97316] font-bold mr-1 block text-xs uppercase tracking-wider mb-0.5">
              Rule 7 - Important
            </span>
            <span>
              Minimum rental period is 1 month. Early return will still be
              charged for the full month.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">8.</span>
            <span>
              The renter is responsible for transport while picking up and
              returning the cart.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed">
            <span className="text-[#f97316] font-bold mr-2">9.</span>
            <span>
              Advance amount will be refunded within 1 week of returning the
              cart.
            </span>
          </div>
        </div>

        {/* TA Rules List */}
        <div className="ta tamil-text space-y-3">
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">1.</span>
            <span>
              வண்டியில் வியாபாரம் செய்பவர் பேரில் தான் வண்டி எடுக்க வேண்டும்.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">2.</span>
            <span>வண்டி எடுத்து செல்வதும் ஒப்படைப்பதும் தங்கள் பொறுப்பு.</span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">3.</span>
            <span>
              வண்டி சேதம் அடைந்தால் அதற்குண்டான பணம் செலுத்த வேண்டும்.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">4.</span>
            <span>
              வண்டியை சுத்தமாக கழுவி கொண்டு வர வேண்டும். இல்லையெனில் ரூ.500
              பிடித்தம் செய்யப்படும்.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">5.</span>
            <span>
              வண்டியை பத்திரமாக ஒப்படைத்த பின்பே ஆவணங்கள் திரும்ப தரப்படும்.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">6.</span>
            <span>விதிகளை மீறினால் கோர்ட் நடவடிக்கை எடுக்கப்படும்.</span>
          </div>
          {/* Rule 7 Highlighted */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-xl font-medium text-sm leading-relaxed border-y border-r border-[#f97316]/10">
            <span className="text-[#f97316] font-bold mr-1 block text-xs uppercase tracking-wider mb-0.5">
              விதி 7 - முக்கிய குறிப்பு
            </span>
            <span>
              குறைந்தபட்சம் 1 மாதம் வாடகை வைத்துக்கொள்ள வேண்டும். முன்னதாக
              திரும்பினாலும் 1 மாத வாடகை வசூலிக்கப்படும்.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed pb-2 border-b border-orange-100">
            <span className="text-[#f97316] font-bold mr-2">8.</span>
            <span>
              வண்டி எடுத்துச் செல்லும் போதும் திரும்பி தரும் போதும் டெம்போ வாடகை
              தங்கள் பொறுப்பு.
            </span>
          </div>
          <div className="flex items-start text-sm leading-relaxed">
            <span className="text-[#f97316] font-bold mr-2">9.</span>
            <span>
              அட்வான்ஸ் தொகை வண்டி திரும்பிய 1 வாரத்திற்குள் தரப்படும்.
            </span>
          </div>
        </div>
      </div>

      {/* Docs Note */}
      <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex flex-col gap-1 shadow-sm">
        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block">
          <span className="en">
            Required Documents (Any One Proof is Enough)
          </span>
          <span className="ta tamil-text">
            தேவையான ஆவணங்கள் (ஏதேனும் ஒன்று மட்டும் போதுமானது)
          </span>
        </span>
        <p className="leading-relaxed">
          <span className="en">
            Please bring: Aadhaar Card, Ration Card, or PAN Card (any one of
            these) + 1 Passport size Photo
          </span>
          <span className="ta tamil-text block text-[11px] mt-0.5">
            கொண்டு வர வேண்டியது: ஆதார் கார்டு, ரேஷன் கார்டு, அல்லது பான் கார்டு
            (இதில் ஏதேனும் ஒரு ஆதாரம்) + 1 பாஸ்போர்ட் போட்டோ
          </span>
        </p>
      </div>
    </div>
  );
}
