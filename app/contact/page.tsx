"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, MessageCircle, PhoneCall } from "lucide-react";
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
    window.open(waUrl, "_blank");
  };

  const infoCards = [
    [
      PhoneCall,
      "Phone",
      "அழைக்க",
      <a
        href={`tel:${CALL_PHONE}`}
        key="phone-link"
        className="hover:text-primary transition font-mono"
      >
        {DISPLAY_CALL_PHONE}
      </a>,
    ],
    [
      MessageCircle,
      "WhatsApp",
      "வாட்ஸ்அப்",
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        key="wa-link"
        className="hover:text-primary transition font-mono"
      >
        {DISPLAY_RENTAL_WHATSAPP}
      </a>,
    ],
  ] as const;

  return (
    <main className="bg-[#F8F6F2] pt-16 md:pt-28">
      {/* Page Header */}
      <section className="pb-12 pt-24 md:pb-16 md:pt-0">
        <div className="site-container">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Text en="Contact" ta="தொடர்பு கொள்ள" />
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl uppercase leading-none text-ink md:text-7xl">
            <Text
              en="Contact Us — Coimbatore Tamil Nadu"
              ta="தொடர்பு கொள்ளுங்கள் — கோயம்புத்தூர்"
            />
          </h1>
          <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted">
            <Text
              en="Reach out to us for premium food cart rentals and custom manufacturing in Coimbatore."
              ta="கோயம்புத்தூரில் தள்ளுவண்டி வாடகை மற்றும் பிரத்யேக வண்டிகள் தயாரிக்க எங்களை தொடர்பு கொள்ளவும்."
            />
          </p>
        </div>
      </section>

      {/* Main Info Cards */}
      <section className="pb-10">
        <div className="site-container grid items-stretch gap-4 md:grid-cols-3 md:gap-6">
          {infoCards.map(([Icon, title, tamilTitle, renderContent]) => (
            <div
              key={title}
              className="flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div>
                <Icon className="text-primary" size={24} />
                <h2 className="mt-4 font-display text-3xl uppercase text-ink">
                  <Text en={title} ta={tamilTitle} />
                </h2>
                <div className="mt-2 text-sm font-semibold text-muted-foreground">
                  {renderContent}
                </div>
              </div>
            </div>
          ))}

          {/* Physical Address Card */}
          <div className="flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div>
              <MapPin className="text-primary" size={24} />
              <h2 className="mt-4 font-display text-3xl uppercase text-ink">
                <span className="en">D. Nagaraj Thalluvandi — Ondipudur</span>
                <span className="ta tamil-text">D. நாகராஜ் தளவண்டி — ஒண்டிப்புதூர்</span>
              </h2>
              <div className="mt-2 text-sm leading-6 text-muted-foreground">
                <div className="en">
                  6 A, Aruljothipuram Jallimedu,
                  <br />
                  Ondipudur, Coimbatore,
                  <br />
                  Tamil Nadu — 641016
                  <br />
                  D. Nagaraj Thallu Vandi — 30+ Years
                </div>
                <div className="ta tamil-text">
                  6 A, அருள்ஜோதிபுரம் ஜல்லிமேடு,
                  <br />
                  ஒண்டிப்புதூர், கோயம்புத்தூர்,
                  <br />
                  தமிழ்நாடு — 641016
                  <br />
                  D. நாகராஜ் தளவண்டி — 30+ ஆண்டுகள்
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-orange-50 w-full text-xs font-bold uppercase tracking-wider h-10"
              >
                <a
                  href="https://maps.app.goo.gl/mdeWyjcpqBQRVzR46"
                  target="_blank"
                >
                  <span className="en">Get Directions →</span>
                  <span className="ta tamil-text">வழித்தடம் பெற →</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Booking Interactive Form */}
      <section id="enquiry-form" className="py-12 bg-white border-t border-black/5">
        <div className="site-container max-w-3xl">
          <div className="rounded-2xl border border-black/10 bg-[#fffdf7] p-6 md:p-10 shadow-premium flex flex-col gap-6">
            
            <div className="text-center">
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                <Text en="Rent a Food Cart" ta="உங்களின் விவரங்கள்" />
              </h2>
              <p className="mt-1 text-sm text-[#f97316] font-bold uppercase tracking-wider">
                <Text en="Direct WhatsApp Connection" ta="வாட்ஸ்அப் நேரடி முன்பதிவு" />
              </p>
            </div>

            <form onSubmit={handleRentSubmit} className="space-y-4">
              
              {/* Field 1: Name */}
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-semibold mb-1 block">
                  <Text en="Full Name *" ta="பெயர் *" />
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  id="name"
                  required
                  value={rentFormData.name}
                  onChange={handleRentInputChange}
                  placeholder={lang === "ta" ? "உங்கள் முழு பெயர்" : "Enter your full name"}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-base outline-none transition"
                />
              </div>

              {/* Field 2: Phone */}
              <div className="flex flex-col">
                <label htmlFor="phone" className="text-sm font-semibold mb-1 block">
                  <Text en="Phone Number *" ta="கைபேசி எண் *" />
                </label>
                <input
                  suppressHydrationWarning
                  type="tel"
                  id="phone"
                  required
                  value={rentFormData.phone}
                  onChange={handleRentInputChange}
                  placeholder={lang === "ta" ? "கைபேசி எண் (10 இலக்கங்கள்)" : "Enter your mobile number"}
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

              {/* Field 3: Business Type Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="businessType" className="text-sm font-semibold mb-1 block">
                  <Text en="Business Type *" ta="தொழில் வகை *" />
                </label>
                <select
                  suppressHydrationWarning
                  id="businessType"
                  value={rentFormData.businessType}
                  onChange={handleRentInputChange}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-sm outline-none transition cursor-pointer"
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

              {/* Field 4: What do you need Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="need" className="text-sm font-semibold mb-1 block">
                  <Text en="What do you need? *" ta="உங்களுக்கு என்ன தேவை? *" />
                </label>
                <select
                  suppressHydrationWarning
                  id="need"
                  value={rentFormData.need}
                  onChange={handleRentInputChange}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-sm outline-none transition cursor-pointer"
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

              {/* Field 5: Location in Coimbatore */}
              <div className="flex flex-col">
                <label htmlFor="location" className="text-sm font-semibold mb-1 block">
                  <Text en="Location in Coimbatore *" ta="இடம் (கோவையில்) *" />
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  id="location"
                  required
                  value={rentFormData.location}
                  onChange={handleRentInputChange}
                  placeholder={lang === "ta" ? "எ.கா: ஒண்டிப்புதூர், காந்திபுரம்" : "e.g. Ondipudur, Gandhipuram"}
                  className="w-full h-12 border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl px-4 bg-white text-base outline-none transition"
                />
              </div>

              {/* Field 6: Details Message */}
              <div className="flex flex-col">
                <label htmlFor="details" className="text-sm font-semibold mb-1 block">
                  <Text en="Enquiry Message (Optional)" ta="விவரங்கள் / கேள்விகள் (விருப்பம்)" />
                </label>
                <textarea
                  suppressHydrationWarning
                  id="details"
                  rows={4}
                  value={rentFormData.details}
                  onChange={handleRentInputChange}
                  placeholder={lang === "ta" ? "வண்டி அளவு, குறிப்பிட்ட தேதி, அல்லது உங்கள் கேள்விகள்..." : "Cart size preference, required dates, or other questions..."}
                  className="w-full border border-[#e5e0d8] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/40 rounded-xl p-4 bg-white text-base outline-none transition resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                suppressHydrationWarning
                type="submit"
                disabled={!isRentFormValid}
                className={`w-full h-14 mt-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition duration-200 ${
                  !isRentFormValid ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <MessageCircle size={20} className="shrink-0" />
                <Text en="Send Rental Enquiry (WhatsApp) →" ta="வாடகை முன்பதிவு கேள்வியை அனுப்பவும் (WhatsApp) →" />
              </Button>

            </form>
          </div>
        </div>
      </section>

      {/* Google Maps Embed Section */}
      <section className="pb-16 pt-8">
        <div className="site-container">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#f97316] mb-3 text-center md:text-left">
            <Text en="📍 Our Location — Ondipudur, Coimbatore" ta="📍 எங்கள் இருப்பிடம் — ஒண்டிப்புதூர், கோயம்புத்தூர்" />
          </h2>
          <div className="relative w-full overflow-hidden rounded-2xl border border-[rgba(249,115,22,0.3)] bg-white h-[260px] md:h-[420px]">
            <iframe
              title="Thalluvandi location - Ondipudur Coimbatore"
              src="https://maps.google.com/maps?q=11.0072893,77.057818&z=17&output=embed"
              className="absolute inset-0 h-full w-full rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
