"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, MessageCircle, PhoneCall, Clock, Zap, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CALL_PHONE,
  DISPLAY_CALL_PHONE,
  DISPLAY_RENTAL_WHATSAPP,
} from "@/lib/utils";
import { WA_NUMBER, buildWAUrl } from "@/config/whatsapp";
import { saveContactMessage } from "@/app/actions";

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

// Popular Tamil / Coimbatore Names Transliteration Dictionary
const NAME_DICT: Record<string, string> = {
  muthu: "முத்து",
  kumar: "குமார்",
  muthukumar: "முத்துக்குமார்",
  karthi: "கார்த்தி",
  karthik: "கார்த்திக்",
  karthikeyan: "கார்த்திகேயன்",
  ramesh: "ரமேஷ்",
  suresh: "சுரேஷ்",
  sathish: "சதீஷ்",
  satheesh: "சதீஷ்",
  arun: "அருண்",
  anand: "ஆனந்த்",
  vijay: "விஜய்",
  ajith: "அஜித்",
  surya: "சூர்யா",
  sanjay: "சஞ்சய்",
  selvam: "செல்வம்",
  selvan: "செல்வன்",
  selvi: "செல்வி",
  mani: "மணி",
  manikandan: "மணிகண்டன்",
  raja: "ராஜா",
  ganesh: "கணேஷ்",
  dinesh: "தினேஷ்",
  hari: "ஹரி",
  harish: "ஹரிஷ்",
  murugan: "முருகன்",
  bala: "பாலா",
  balaji: "பாலாஜி",
  siva: "சிவா",
  sivam: "சிவம்",
  devi: "தேவி",
  radha: "ராதா",
  lakshmi: "லட்சுமி",
  priya: "பிரியா",
  chitra: "சித்ரா",
  anitha: "அனிதா",
  kavitha: "கவிதா",
  divya: "திவ்யா",
  meena: "மீனா",
  geetha: "கீதா",
  sangeetha: "சங்கீதா",
  malathi: "மாலதி",
  saranya: "சரண்யா",
  mohan: "மோகன்",
  prakash: "பிரகாஷ்",
  rajesh: "ராஜேஷ்",
  senthil: "செந்தில்",
  saravanan: "சரவணன்",
  rajan: "ராஜன்",
  naveen: "கவின்",
  kavin: "கவின்",
  guna: "குணா",
  subash: "சுபாஷ்",
  vignesh: "விக்னேஷ்",
  gokul: "கோகுல்",
  madhavan: "மாதவன்",
  prabhu: "பிரபு",
  anbu: "அன்பு",
  sakthi: "சக்தி",
  vel: "வேல்",
  velu: "வேலு",
  vasanth: "வசந்த்",
  deepak: "தீபக்",
  shankar: "சங்கர்",
  sankar: "சங்கர்",
  ram: "ராம்",
  raman: "ராமன்",
  krishnan: "கிருஷ்ணன்",
  krishna: "கிருஷ்ணா",
  gopal: "கோபால்",
};

// Coimbatore Neighborhoods / Locations Dictionary
const LOCATION_DICT: Record<string, string> = {
  ondipudur: "ஒண்டிப்புதூர்",
  singanallur: "சிங்காநல்லூர்",
  ramanathapuram: "ராமநாதபுரம்",
  gandhipuram: "காந்திபுரம்",
  peelamedu: "பீளமேடு",
  hopes: "ஹோப்ஸ்",
  saravanampatti: "சரவணம்பட்டி",
  kalapatti: "கலாப்பட்டி",
  kovaipudur: "கோவைப்புதூர்",
  kuniyamuthur: "குனியமுத்தூர்",
  sundarapuram: "சுந்தராபுரம்",
  podanur: "போத்தனூர்",
  ukkadam: "உக்கடம்",
  townhall: "டவுன் ஹால்",
  "town hall": "டவுன் ஹால்",
  rspuram: "ஆர்.எஸ். புரம்",
  "r.s. puram": "ஆர்.எஸ். புரம்",
  "rs puram": "ஆர்.எஸ். புரம்",
  "saibaba colony": "சாய்பாபா காலனி",
  saibaba: "சாய்பாபா காலனி",
  ganapathy: "கணபதி",
  vadavalli: "வடவள்ளி",
  thudiyalur: "துடியலூர்",
  periyanaickenpalayam: "பெரியநாயக்கன்பாளையம்",
  sulur: "சூலூர்",
  karumathampatti: "கருமத்தம்பட்டி",
  kurumbapalayam: "குரும்பபாளையம்",
  chinniampalayam: "சின்னிம்பாளையம்",
  pappampatti: "பாப்பம்பட்டி",
  neelambur: "நீலாம்பூர்",
  goldwins: "கோல்ட்வின்ஸ்",
  lakshmipuram: "லட்சுமிபுரம்",
  jallimedu: "ஜல்லிமேடு",
  aruljothipuram: "அருள்ஜோதிபுரம்",
  coimbatore: "கோயம்புத்தூர்",
  kovai: "கோவை",
};

// Common Rental / Food Cart English-to-Tamil Translation Dictionary
const COMMON_WORDS_DICT: Record<string, string> = {
  hello: "வணக்கம்",
  hi: "வணக்கம்",
  thanks: "நன்றி",
  "thank you": "நன்றி",
  please: "தயவுசெய்து",
  need: "தேவை",
  want: "வேண்டும்",
  rent: "வாடகை",
  rental: "வாடகைக்கு",
  cart: "வண்டி",
  carts: "வண்டிகள்",
  food: "உணவு",
  tea: "டீ",
  coffee: "காபி",
  juice: "ஜூஸ்",
  milkshake: "மில்க்ஷேக்",
  stove: "அடுப்பு",
  burner: "பர்னர்",
  burners: "பர்னர்கள்",
  size: "அளவு",
  price: "விலை",
  deposit: "முன்பணம்",
  location: "இடம்",
  delivery: "டெலிவரி",
  steel: "ஸ்டீல்",
  wheels: "சக்கரங்கள்",
  light: "லைட்",
  clean: "சுத்தம்",
  plate: "தட்டு",
  plates: "தட்டுகள்",
  cover: "மேல் கவர்",
  roof: "மேல் கூரை",
  custom: "பிரத்யேக",
  design: "வடிவமைப்பு",
  order: "ஆர்டர்",
  days: "நாட்கள்",
  day: "நாள்",
  month: "மாதம்",
  months: "மாதங்கள்",
  week: "வாரம்",
  weeks: "வாரங்கள்",
  business: "தொழில்",
  shop: "கடை",
  inquiry: "விசாரணை",
  details: "விவரங்கள்",
  message: "செய்தி",
  expected: "எதிர்பார்க்கும்",
  available: "கிடைக்கக்கூடியது",
  "not available": "கிடைக்கவில்லை",
  yes: "ஆம்",
  no: "இல்லை",
  one: "ஒன்று",
  two: "இரண்டு",
  three: "மூன்று",
  four: "நான்கு",
  five: "ஐந்து",
  stovecart: "அடுப்பு வண்டி",
  stove_cart: "அடுப்பு வண்டி",
  juicecart: "ஜூஸ் வண்டி",
  teacart: "டீ வண்டி",
  brand: "பிராண்ட்",
  new: "புதிய",
  old: "பழைய",
};

// Syllable-by-syllable rule-based phonetic sound transliterator for custom names
function phoneticTransliteration(word: string): string {
  if (!word) return "";
  let t = word.toLowerCase().trim();

  // Suffixes and common patterns
  t = t.replace(/senthil/g, "செந்தில்");
  t = t.replace(/prakash/g, "பிரகாஷ்");
  t = t.replace(/prabhu/g, "பிரபு");
  t = t.replace(/shankar/g, "சங்கர்");
  t = t.replace(/krish/g, "கிருஷ்");
  t = t.replace(/raj/g, "ராஜ்");
  t = t.replace(/kumar/g, "குமார்");
  t = t.replace(/selva/g, "செல்வ");
  
  t = t.replace(/an$/g, "ன்");
  t = t.replace(/am$/g, "ம்");
  t = t.replace(/ar$/g, "ர்");
  t = t.replace(/al$/g, "ல்");
  t = t.replace(/as$/g, "ாஸ்");
  t = t.replace(/esh$/g, "ேஷ்");
  t = t.replace(/ish$/g, "ிஷ்");
  t = t.replace(/ith$/g, "ித்");
  t = t.replace(/anth$/g, "ந்த்");

  // Consonant clusters
  t = t.replace(/tha/g, "த");
  t = t.replace(/thi/g, "தி");
  t = t.replace(/thu/g, "து");
  t = t.replace(/the/g, "தே");
  t = t.replace(/tho/g, "தொ");
  t = t.replace(/thee/g, "தீ");
  t = t.replace(/th/g, "த்");

  t = t.replace(/ka/g, "க");
  t = t.replace(/ki/g, "கி");
  t = t.replace(/ku/g, "கு");
  t = t.replace(/ke/g, "கே");
  t = t.replace(/ko/g, "கோ");
  t = t.replace(/kee/g, "கீ");
  t = t.replace(/k/g, "க்");

  t = t.replace(/sa/g, "ச");
  t = t.replace(/si/g, "சி");
  t = t.replace(/su/g, "சு");
  t = t.replace(/se/g, "செ");
  t = t.replace(/so/g, "சொ");
  t = t.replace(/see/g, "சீ");
  t = t.replace(/s/g, "ஸ்");

  t = t.replace(/ma/g, "ம");
  t = t.replace(/mi/g, "மி");
  t = t.replace(/mu/g, "மு");
  t = t.replace(/me/g, "மே");
  t = t.replace(/mo/g, "மோ");
  t = t.replace(/mee/g, "மீ");
  t = t.replace(/m/g, "ம்");

  t = t.replace(/va/g, "வ");
  t = t.replace(/vi/g, "வி");
  t = t.replace(/vu/g, "வு");
  t = t.replace(/ve/g, "வெ");
  t = t.replace(/vo/g, "வொ");
  t = t.replace(/vee/g, "வீ");
  t = t.replace(/v/g, "வ்");

  t = t.replace(/ra/g, "ர");
  t = t.replace(/ri/g, "ரி");
  t = t.replace(/ru/g, "ரு");
  t = t.replace(/re/g, "ரே");
  t = t.replace(/ro/g, "ரோ");
  t = t.replace(/ree/g, "ரீ");
  t = t.replace(/r/g, "ர்");

  t = t.replace(/na/g, "ன");
  t = t.replace(/ni/g, "னி");
  t = t.replace(/nu/g, "னு");
  t = t.replace(/ne/g, "னே");
  t = t.replace(/no/g, "னோ");
  t = t.replace(/nee/g, "நீ");
  t = t.replace(/n/g, "ன்");

  t = t.replace(/pa/g, "ப");
  t = t.replace(/pi/g, "பி");
  t = t.replace(/pu/g, "பு");
  t = t.replace(/pe/g, "பெ");
  t = t.replace(/po/g, "பொ");
  t = t.replace(/pee/g, "பீ");
  t = t.replace(/p/g, "ப்");

  t = t.replace(/la/g, "ல");
  t = t.replace(/li/g, "லி");
  t = t.replace(/lu/g, "லு");
  t = t.replace(/le/g, "லெ");
  t = t.replace(/lo/g, "லொ");
  t = t.replace(/lee/g, "லீ");
  t = t.replace(/l/g, "ல்");

  t = t.replace(/ya/g, "ய");
  t = t.replace(/yi/g, "யி");
  t = t.replace(/yu/g, "யு");
  t = t.replace(/ye/g, "யே");
  t = t.replace(/yo/g, "யோ");
  t = t.replace(/y/g, "ய்");

  t = t.replace(/ja/g, "ஜ");
  t = t.replace(/ji/g, "ஜி");
  t = t.replace(/ju/g, "ஜு");
  t = t.replace(/je/g, "ஜே");
  t = t.replace(/jo/g, "ஜோ");
  t = t.replace(/j/g, "ஜ்");

  t = t.replace(/da/g, "ட");
  t = t.replace(/di/g, "டி");
  t = t.replace(/du/g, "டு");
  t = t.replace(/de/g, "டெ");
  t = t.replace(/do/g, "டொ");
  t = t.replace(/d/g, "ட்");

  t = t.replace(/ha/g, "ஹ");
  t = t.replace(/hi/g, "ஹி");
  t = t.replace(/hu/g, "ஹு");
  t = t.replace(/he/g, "ஹெ");
  t = t.replace(/ho/g, "ஹொ");
  t = t.replace(/h/g, "ஹ்");

  // Initial vowels
  t = t.replace(/^a/g, "அ");
  t = t.replace(/^aa/g, "ஆ");
  t = t.replace(/^i/g, "இ");
  t = t.replace(/^ee/g, "ஈ");
  t = t.replace(/^u/g, "உ");
  t = t.replace(/^oo/g, "ஊ");
  t = t.replace(/^e/g, "எ");
  t = t.replace(/^ae/g, "ஏ");
  t = t.replace(/^o/g, "ஒ");
  t = t.replace(/^oo/g, "ஓ");

  // Medial vowel marks
  t = t.replace(/a/g, "ா");
  t = t.replace(/i/g, "ி");
  t = t.replace(/u/g, "ு");
  t = t.replace(/e/g, "ெ");
  t = t.replace(/o/g, "ொ");

  return t;
}

// Phonetically transliterates renter names to Tamil
function transliterateNameToTamil(nameStr: string): string {
  const clean = nameStr.trim();
  if (!clean) return "";

  const parts = clean.split(/\s+/);
  const translatedParts = parts.map(part => {
    const lower = part.toLowerCase().replace(/[^a-z]/g, "");
    if (NAME_DICT[lower]) {
      return NAME_DICT[lower];
    }
    return phoneticTransliteration(lower);
  });

  return translatedParts.join(" ");
}

// Translates locations matching dictionary
function translateLocationToTamil(locationStr: string): string {
  const clean = locationStr.trim().toLowerCase();
  if (!clean) return "";

  if (LOCATION_DICT[clean]) {
    return LOCATION_DICT[clean];
  }

  for (const [key, value] of Object.entries(LOCATION_DICT)) {
    if (clean.includes(key)) {
      return value;
    }
  }

  return locationStr;
}

// Word-by-word translator for common inquiry terms
function translateTextToTamil(textStr: string): string {
  const clean = textStr.trim();
  if (!clean) return "";

  const words = clean.split(/\s+/);
  const translatedWords = words.map(word => {
    const stripped = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (COMMON_WORDS_DICT[stripped]) {
      const prefix = word.match(/^[^a-zA-Z]*/) || "";
      const suffix = word.match(/[^a-zA-Z]*$/) || "";
      return prefix + COMMON_WORDS_DICT[stripped] + suffix;
    }
    return word;
  });

  return translatedWords.join(" ");
}

export default function ContactPage() {
  const [lang, setLang] = useState<"en" | "ta">("en");

  // Sync language toggle dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
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

  // Rent Form State
  const [rentFormData, setRentFormData] = useState({
    name: "",
    phone: "",
    businessType: "Tea", // Tea, Juice, FastFood, Snacks, Other
    need: "rent", // rent, custom, other
    location: "",
    details: "",
  });

  const [phoneError, setPhoneError] = useState("");

  const handleRentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setRentFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "phone") {
      const digits = value.replace(/\D/g, "");
      if (value && digits.length !== 10) {
        setPhoneError(
          lang === "ta"
            ? "தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்"
            : "Phone number must be exactly 10 digits"
        );
      } else {
        setPhoneError("");
      }
    }
  };

  const isRentFormValid =
    rentFormData.name.trim() !== "" &&
    rentFormData.phone.replace(/\D/g, "").length === 10 &&
    rentFormData.location.trim() !== "" &&
    phoneError === "";

  // This message goes to 91 88382 92849, which must ALWAYS be in Tamil.
  // Performs smart name, location, and keyword conversion if the user enters details in English.
  const rentCompiledMessage = useMemo(() => {
    const rawDetails = rentFormData.details.trim() !== "" ? rentFormData.details.trim() : "இல்லை";
    const translatedDetails = rawDetails !== "இல்லை" ? translateTextToTamil(rawDetails) : "இல்லை";
    const translatedLocation = translateLocationToTamil(rentFormData.location);
    const translatedName = transliterateNameToTamil(rentFormData.name);
    
    const needText = 
      rentFormData.need === "rent" ? "வண்டி வாடகைக்கு எடுக்க" :
      rentFormData.need === "custom" ? "பிரத்யேக வண்டி தயாரிக்க/வாங்க" : "பொதுவான கேள்விகள்";
      
    const businessText =
      rentFormData.businessType === "Tea" ? "டீ / காபி கடை" :
      rentFormData.businessType === "Juice" ? "ஜூஸ் / மில்க்ஷேக் வண்டி" :
      rentFormData.businessType === "FastFood" ? "ஃபாஸ்ட் ஃபுட் / காரசார கடை" :
      rentFormData.businessType === "Snacks" ? "ஸ்நாக்ஸ் / சாட் வண்டி" : "மற்ற உணவு தொழில்";

    // Show dual clarity for name, location and details
    const nameDisplay = translatedName.toLowerCase() !== rentFormData.name.toLowerCase()
      ? `${translatedName} (${rentFormData.name.trim()})`
      : rentFormData.name.trim();

    const detailsDisplay = rawDetails !== "இல்லை" && translatedDetails.toLowerCase() !== rawDetails.toLowerCase()
      ? `${translatedDetails} (${rawDetails})`
      : rawDetails;

    const locationDisplay = translatedLocation.toLowerCase() !== rentFormData.location.toLowerCase()
      ? `${translatedLocation} (${rentFormData.location})`
      : rentFormData.location;

    return `வணக்கம் தள்ளுவண்டி குழுவினரே,

நான் ஒரு புதிய வாடகை விசாரணை செய்ய விரும்புகிறேன்:

பெயர்: ${nameDisplay}
கைபேசி எண்: ${rentFormData.phone.trim()}
தொழில் வகை: ${businessText}
தேவை: ${needText}
இடம் (கோவையில்): ${locationDisplay}
கூடுதல் விவரம் / கேள்வி: ${detailsDisplay}`;
  }, [rentFormData]);

  const handleRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRentFormValid) return;
    
    // Save contact message in Supabase
    try {
      await saveContactMessage({
        name: rentFormData.name.trim(),
        phone: rentFormData.phone.trim(),
        message: rentCompiledMessage,
      });
    } catch (err) {
      console.error("Failed to save contact message to database:", err);
    }
    
    const waUrl = buildWAUrl(WA_NUMBER, rentCompiledMessage);
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  };

  return (
    <main className="bg-[#0a0a08] pt-14 md:pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center border-b border-[#ffb690]/10 overflow-hidden bg-[#160c06] pt-8 pb-16 md:py-24 px-6">
        <div className="absolute inset-0 opacity-10 map-grid"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background"></div>
        
        <div className="relative z-10 site-container max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Hero Content */}
          <div className="text-left flex flex-col items-start">
            <span className="font-display text-sm tracking-[0.2em] text-[#f97316] bg-[#f97316]/10 px-4 py-1.5 uppercase mb-6 border border-[#f97316]/20 rounded-full">
              ★ <Text en="FOOD CART MARKETPLACE" ta="உணவு வண்டி சந்தை" /> ★
            </span>
            <h1 className="font-display text-5xl md:text-7xl uppercase mb-6 tracking-tighter leading-none text-[#fffdf7]">
              THALLUVANDI<br />
              <span className="text-[#f97316]"><Text en="PREMIUM RENTAL" ta="பிரீமியம் வாடகை" /></span>
            </h1>
            <p className="font-sans text-lg md:text-xl text-[#f6ded3]/80 leading-relaxed mb-8">
              <Text 
                en="Find the right cart for your street business. High quality, premium models, and verified vendors — active in Coimbatore and Tiruppur." 
                ta="உங்கள் தெரு வணிகத்திற்கு சரியான வண்டியைத் தேர்ந்தெடுங்கள். சிறந்த தரம், பிரீமியம் மாடல்கள் மற்றும் சரிபார்க்கப்பட்ட விற்பனையாளர்கள் — கோயம்புத்தூர் மற்றும் திருப்பூரில்." 
              />
            </p>
            <a 
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              className="inline-flex items-center gap-3 bg-[#1c110b] text-[#ffb690] hover:text-[#f6ded3] px-8 py-4 font-display text-xl hover:bg-[#45362f] transition-all active:scale-95 border border-[#ffb690]/20 rounded-2xl"
            >
              <MessageCircle size={20} className="shrink-0" />
              <Text en="CHAT ON WHATSAPP" ta="வாட்ஸ்அப்பில் சாட் செய்ய" />
            </a>
          </div>

          {/* Right Side: Company Logo */}
          <div className="flex justify-center md:justify-end items-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-[#251913]/30 rounded-3xl border border-[#ffb690]/15 shadow-premium overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#f97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image 
                src="/brand/full-logo.webp" 
                alt="Thalluvandi Logo" 
                width={280} 
                height={280} 
                className="object-contain max-w-[85%] max-h-[85%] transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute font-display text-3xl font-black uppercase tracking-[0.15em] text-[#f97316] select-none pointer-events-none text-center">
                THALLUVANDI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Hours Strip */}
      <div className="bg-[#160c06] py-4 border-y border-[#ffb690]/10">
        <div className="site-container flex flex-wrap justify-between items-center gap-4 text-xs font-bold tracking-widest text-[#e0c0b1]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#ffb690]" />
            <Text en="OPERATING HOURS: MON-SUN 09:00 AM - 10:00 PM" ta="செயல்படும் நேரம்: திங்கள்-ஞாயிறு காலை 09:00 - இரவு 10:00" />
          </div>
          <div className="hidden md:block h-4 w-[1px] bg-[#ffb690]/20"></div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#ffb690]" />
            <Text en="RESPONSE TIME: WITHIN 15 MINUTES" ta="பதில் அளிக்கும் நேரம்: 15 நிமிடங்களுக்குள்" />
          </div>
          <div className="hidden md:block h-4 w-[1px] bg-[#ffb690]/20"></div>
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[#ffb690]" />
            <Text en="SERVING COIMBATORE & TIRUPPUR" ta="சேவை இடம்: கோயம்புத்தூர் & திருப்பூர்" />
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <section className="site-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone Card */}
          <div className="bg-[#291d16] border border-[#ffb690]/15 p-8 group hover:border-[#ffb690]/40 transition-all duration-300">
            <div className="text-[#ffb690] mb-6">
              <PhoneCall size={36} />
            </div>
            <h3 className="font-display text-2xl uppercase mb-2 tracking-wider text-ink">
              <Text en="DIRECT LINE" ta="நேரடி அழைப்பு" />
            </h3>
            <p className="font-sans text-sm text-[#e0c0b1] mb-6">
              <Text en="Immediate assistance for bookings and order inquiries." ta="முன்பதிவுகள் மற்றும் ஆர்டர் விசாரணைகளுக்கு உடனடியாக அழைக்கவும்." />
            </p>
            <a 
              href={`tel:${CALL_PHONE}`}
              className="font-display text-3xl text-secondary hover:text-[#ffdd75] transition-colors"
            >
              {DISPLAY_CALL_PHONE}
            </a>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-[#291d16] border border-[#ffb690]/15 p-8 group hover:border-[#ffb690]/40 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-[#ffb690]/10 text-[#ffb690] px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
                <Text en="FASTEST" ta="மிக விரைவு" />
              </div>
            </div>
            <div className="text-[#ffb690] mb-6">
              <MessageCircle size={36} />
            </div>
            <h3 className="font-display text-2xl uppercase mb-2 tracking-wider text-ink">
              <Text en="WHATSAPP CHAT" ta="வாட்ஸ்அப் சாட்" />
            </h3>
            <p className="font-sans text-sm text-[#e0c0b1] mb-6">
              <Text en="Share locations, send photos, and get instant updates." ta="இருப்பிடத்தை பகிர, புகைப்படங்கள் அனுப்ப மற்றும் உடனடி விவரங்கள் பெற." />
            </p>
            <a 
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              className="font-display text-3xl text-secondary hover:text-[#ffdd75] transition-colors font-mono"
            >
              {DISPLAY_RENTAL_WHATSAPP}
            </a>
          </div>

          {/* Physical Address / Headquarters Card */}
          <div className="bg-[#291d16] border border-[#ffb690]/15 p-8 group hover:border-[#ffb690]/40 transition-all duration-300">
            <div className="text-[#ffb690] mb-6">
              <MapPin size={36} />
            </div>
            <h3 className="font-display text-2xl uppercase mb-2 tracking-wider text-ink">
              <Text en="HEADQUARTERS" ta="தலைமையகம்" />
            </h3>
            <p className="font-sans text-sm text-[#e0c0b1] mb-4">
              <Text en="D. Nagaraj Thalluvandi — Ondipudur (30+ Years)" ta="D. நாகராஜ் தள்ளுவண்டி — ஒண்டிப்புதூர் (30+ ஆண்டுகள்)" />
            </p>
            <div className="font-sans text-xs leading-6 text-[#e0c0b1]/80 mb-6">
              <div className="en">
                6 A, Aruljothipuram Jallimedu, Ondipudur, Coimbatore, Tamil Nadu — 641016
              </div>
              <div className="ta tamil-text">
                6 A, அருள்ஜோதிபுரம் ஜல்லிமேடு, ஒண்டிப்புதூர், கோயம்புத்தூர், தமிழ்நாடு — 641016
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/mdeWyjcpqBQRVzR46"
              target="_blank"
              className="font-display text-sm tracking-wider text-secondary hover:text-[#ffdd75] border-b border-secondary/30 pb-1 transition-all"
            >
              <Text en="GET DIRECTIONS →" ta="வழித்தடம் பெற →" />
            </a>
          </div>
        </div>
      </section>

      {/* Message and Map Section */}
      <section className="site-container py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch border-t border-[#ffb690]/10">
        {/* Form Column */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="font-display text-4xl uppercase mb-4 text-ink">
              <Text en="SEND US A MESSAGE" ta="விவரங்களை அனுப்பவும்" />
            </h2>
            <p className="font-sans text-sm text-[#e0c0b1] mb-8">
              <Text 
                en="For business inquiries, vendor partnerships, or rentals, please fill out the form below. Our team will reach out within 24 hours." 
                ta="தொழில் விசாரணைகள், கூட்டாண்மை அல்லது தள்ளுவண்டி வாடகைகளுக்கு, கீழே உள்ள படிவத்தை நிரப்பவும். எங்கள் குழு 24 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்ளும்." 
              />
            </p>
            
            <form onSubmit={handleRentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field 1: Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold tracking-widest text-[#e0c0b1] block">
                    <Text en="FULL NAME *" ta="முழு பெயர் *" />
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={rentFormData.name}
                    onChange={handleRentInputChange}
                    placeholder={lang === "ta" ? "உங்கள் முழு பெயர்" : "Karthik Raja"}
                    className="w-full bg-[#251913] border-0 border-b border-[#e0c0b1]/30 py-3 px-3 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none"
                  />
                </div>

                {/* Field 2: Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-bold tracking-widest text-[#e0c0b1] block">
                    <Text en="PHONE NUMBER *" ta="கைபேசி எண் *" />
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={rentFormData.phone}
                    onChange={handleRentInputChange}
                    placeholder={lang === "ta" ? "கைபேசி எண் (10 இலக்கங்கள்)" : "+91 00000 00000"}
                    className={`w-full bg-[#251913] border-0 border-b py-3 px-3 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:ring-0 focus:outline-none transition-colors ${
                      phoneError
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#e0c0b1]/30 focus:border-[#f97316]"
                    }`}
                  />
                  {phoneError && (
                    <span className="text-xs text-red-400 mt-1 block font-semibold">
                      {phoneError}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field 3: Business Type */}
                <div className="space-y-2">
                  <label htmlFor="businessType" className="text-xs font-bold tracking-widest text-[#e0c0b1] block">
                    <Text en="BUSINESS TYPE *" ta="தொழில் வகை *" />
                  </label>
                  <select
                    id="businessType"
                    value={rentFormData.businessType}
                    onChange={handleRentInputChange}
                    className="w-full bg-[#251913] border-0 border-b border-[#e0c0b1]/30 py-3 px-2 text-[#f6ded3] focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    {lang === "ta" ? (
                      <>
                        <option value="Tea">டீ / காபி கடை</option>
                        <option value="Juice">ஜூஸ் / மில்க்ஷேக் வண்டி</option>
                        <option value="FastFood">ஃபாஸ்ட் ஃபுட் / காரசார கடை</option>
                        <option value="Snacks">ஸ்நாக்ஸ் / சாட் வண்டி</option>
                        <option value="Other">மற்ற உணவு தொழில்</option>
                      </>
                    ) : (
                      <>
                        <option value="Tea">Tea / Coffee Stall</option>
                        <option value="Juice">Juice / Milkshake Cart</option>
                        <option value="FastFood">Fast Food / Chinese Stall</option>
                        <option value="Snacks">Snacks / Chaat Cart</option>
                        <option value="Other">Other Business</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Field 4: Need */}
                <div className="space-y-2">
                  <label htmlFor="need" className="text-xs font-bold tracking-widest text-[#e0c0b1] block">
                    <Text en="WHAT DO YOU NEED? *" ta="உங்களுக்கு என்ன தேவை? *" />
                  </label>
                  <select
                    id="need"
                    value={rentFormData.need}
                    onChange={handleRentInputChange}
                    className="w-full bg-[#251913] border-0 border-b border-[#e0c0b1]/30 py-3 px-2 text-[#f6ded3] focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    {lang === "ta" ? (
                      <>
                        <option value="rent">தள்ளுவண்டி வாடகைக்கு எடுக்க</option>
                        <option value="custom">பிரத்யேக வண்டி தயாரிக்க/வாங்க</option>
                        <option value="other">பொதுவான கேள்விகள்</option>
                      </>
                    ) : (
                      <>
                        <option value="rent">Rent a Food Cart</option>
                        <option value="custom">Custom Cart Design/Order</option>
                        <option value="other">General Question</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Field 5: Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="text-xs font-bold tracking-widest text-[#e0c0b1] block">
                  <Text en="LOCATION IN COIMBATORE *" ta="இடம் (கோவையில்) *" />
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  value={rentFormData.location}
                  onChange={handleRentInputChange}
                  placeholder={lang === "ta" ? "எ.கா: ஒண்டிப்புதூர், காந்திபுரம்" : "e.g. Ondipudur, Gandhipuram"}
                  className="w-full bg-[#251913] border-0 border-b border-[#e0c0b1]/30 py-3 px-3 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Field 6: Details Message */}
              <div className="space-y-2">
                <label htmlFor="details" className="text-xs font-bold tracking-widest text-[#e0c0b1] block">
                  <Text en="ENQUIRY MESSAGE (OPTIONAL)" ta="விவரங்கள் / கேள்விகள் (விருப்பம்)" />
                </label>
                <textarea
                  id="details"
                  rows={4}
                  value={rentFormData.details}
                  onChange={handleRentInputChange}
                  placeholder={lang === "ta" ? "வண்டி அளவு, குறிப்பிட்ட தேதி, அல்லது உங்கள் கேள்விகள்..." : "Cart size preference, required dates, or other questions..."}
                  className="w-full bg-[#251913] border-0 border-b border-[#e0c0b1]/30 py-3 px-3 text-[#f6ded3] placeholder-[#e0c0b1]/40 focus:border-[#f97316] transition-colors focus:ring-0 focus:outline-none resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!isRentFormValid}
                className={`w-full md:w-auto bg-[#f97316] hover:bg-[#e2640e] text-white px-12 py-4 font-display text-2xl tracking-wider uppercase active:scale-95 transition-all ${
                  !isRentFormValid ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <Text en="SUBMIT TO WHATSAPP →" ta="வாட்ஸ்அப்பிற்கு அனுப்பவும் →" />
              </button>
            </form>
          </div>
        </div>

        {/* Map Column */}
        <div className="relative h-full min-h-[400px] border border-[#ffb690]/25 overflow-hidden bg-[#291d16]">
          <iframe
            title="Thalluvandi location - Ondipudur Coimbatore"
            src="https://maps.google.com/maps?q=11.0072893,77.057818&z=17&output=embed"
            className="absolute inset-0 h-full w-full opacity-60 grayscale invert contrast-125 border-none"
            loading="lazy"
          />
          {/* Editorial grid overlay for map */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-[#0a0a08]"></div>
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full border border-[#f97316]"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
