"use client";

import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, MapPin, Navigation, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WA_PUBLISH, buildWAUrl } from "@/config/whatsapp";
import { saveCart } from "@/app/actions";

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

export default function PublishPage() {
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  // Publish Form State
  const [publishFormData, setPublishFormData] = useState({
    name: "",
    phone: "",
    cartType: "With Store", // With Store, With Roof, Ice Cream, Tea Stall, Other
    condition: "New", // New, Used - Very Good, Used - Good, Fair
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

  const handlePublishInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setPublishFormData((prev) => ({ ...prev, [id]: value }));

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

  // Auto-detect current coordinates using Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPublishFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeoStatus("success");
      },
      (error) => {
        console.error("Error fetching location:", error);
        setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isPublishFormValid =
    publishFormData.name.trim() !== "" &&
    publishFormData.phone.replace(/\D/g, "").length === 10 &&
    publishFormData.location.trim() !== "" &&
    publishFormData.expectedRent.trim() !== "" &&
    publishFormData.latitude.trim() !== "" &&
    publishFormData.longitude.trim() !== "" &&
    phoneError === "";

  // Compiles structured message to admin WhatsApp
  const publishCompiledMessage = useMemo(() => {
    const extraDetails = publishFormData.details.trim() !== "" ? publishFormData.details.trim() : "None";
    
    return `Hello Thalluvandi team,

I want to list my food cart for rent (V2 Listing Request):

Name: ${publishFormData.name.trim()}
Phone: ${publishFormData.phone.trim()}
Cart Type: ${publishFormData.cartType}
Condition: ${publishFormData.condition}
Size: ${publishFormData.size}
Weight: ${publishFormData.weight}
Stove Type: ${publishFormData.stoveType}
Expected Monthly Rent: ₹${publishFormData.expectedRent.trim()}
Location: ${publishFormData.location.trim()}
Coordinates: Lat ${publishFormData.latitude}, Lng ${publishFormData.longitude}
Description: ${extraDetails}`;
  }, [publishFormData]);

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPublishFormValid) return;
    
    try {
      await saveCart({
        nameEn: publishFormData.cartType,
        nameTa: publishFormData.cartType,
        type: publishFormData.cartType,
        pricePerDay: Number(publishFormData.expectedRent) || 2000,
        depositAmount: 2000, // standard default deposit
        availableCount: 1,
        descriptionEn: publishFormData.details,
        descriptionTa: publishFormData.details,
        vendorName: publishFormData.name,
        vendorPhone: publishFormData.phone,
        vendorLocation: publishFormData.location,
        latitude: Number(publishFormData.latitude),
        longitude: Number(publishFormData.longitude),
        condition: publishFormData.condition,
        size: publishFormData.size,
        weight: publishFormData.weight,
        stoveType: publishFormData.stoveType,
      });
      
      alert(lang === "ta" ? "வண்டி பதிவு படிவம் சமர்ப்பிக்கப்பட்டது! சரிபார்ப்பிற்குப் பிறகு இது நேரலையில் இருக்கும்." : "Cart listing submitted! It will be live after admin review.");
    } catch (err) {
      console.error("Failed to save cart to backend:", err);
    }

    const waUrl = buildWAUrl(WA_PUBLISH, publishCompiledMessage);
    window.open(waUrl, "_blank");
  };

  return (
    <main className="bg-[#F8F6F2] pt-16 md:pt-28">
      <section className="pb-20 pt-24 md:pb-24 md:pt-0">
        <div className="site-container grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-12 items-start">
          <div className="flex flex-col justify-between h-full py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Text en="Vendor Network [V2]" ta="வண்டி உரிமையாளர் நெட்வொர்க் [V2]" />
              </p>
              <h1 className="mt-3 font-display text-5xl uppercase leading-none text-ink md:text-7xl">
                <Text en="List Your Thallu Vandi Across Tamil Nadu" ta="தமிழ்நாடு முழுவதும் உங்கள் வண்டியை பதிவு செய்யுங்கள்" />
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
                <Text en="Quick Listing Form [V2]" ta="விரைவு பதிவு படிவம் [V2]" />
              </h2>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              
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
                    value={publishFormData.name}
                    onChange={handlePublishInputChange}
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
                    value={publishFormData.phone}
                    onChange={handlePublishInputChange}
                    placeholder={lang === "ta" ? "10 இலக்கங்கள்" : "10 digits"}
                    className={`w-full h-12 border focus:ring-2 rounded-xl px-4 bg-white text-base outline-none transition ${
                      phoneError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                        : "border-[#e5e0d8] focus:border-primary focus:ring-primary/40"
                    }`}
                  />
                  {phoneError && (
                    <span className="text-xs text-red-500 mt-1 font-semibold">{phoneError}</span>
                  )}
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
                    value={publishFormData.cartType}
                    onChange={handlePublishInputChange}
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
                    value={publishFormData.condition}
                    onChange={handlePublishInputChange}
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
                    value={publishFormData.size}
                    onChange={handlePublishInputChange}
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
                    value={publishFormData.weight}
                    onChange={handlePublishInputChange}
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
                    value={publishFormData.stoveType}
                    onChange={handlePublishInputChange}
                    placeholder="e.g. Single Burner"
                    className="w-full h-10 border border-[#e5e0d8] rounded-lg px-2 bg-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Expected Rent & Location Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="expectedRent" className="text-xs font-bold uppercase tracking-wider mb-1 block">
                    <Text en="Expected Monthly Rent (₹) *" ta="மாத வாடகை (₹) *" />
                  </label>
                  <input
                    type="number"
                    id="expectedRent"
                    required
                    value={publishFormData.expectedRent}
                    onChange={handlePublishInputChange}
                    placeholder="e.g. 2500"
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
                    value={publishFormData.location}
                    onChange={handlePublishInputChange}
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
                      required
                      placeholder="e.g. 11.0028"
                      value={publishFormData.latitude}
                      onChange={handlePublishInputChange}
                      className="w-full h-10 border border-[#e5e0d8] rounded-lg px-3 text-sm bg-white"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="longitude" className="text-[10px] uppercase text-muted mb-1">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      required
                      placeholder="e.g. 77.0347"
                      value={publishFormData.longitude}
                      onChange={handlePublishInputChange}
                      className="w-full h-10 border border-[#e5e0d8] rounded-lg px-3 text-sm bg-white"
                    />
                  </div>
                </div>

                {geoStatus === "loading" && (
                  <p className="text-[10px] text-amber-600 animate-pulse">Fetching GPS coordinates from browser...</p>
                )}
                {geoStatus === "success" && (
                  <p className="text-[10px] text-green-600 font-bold">Successfully populated GPS coordinates!</p>
                )}
                {geoStatus === "error" && (
                  <p className="text-[10px] text-red-500">Could not retrieve GPS coordinates automatically. Please input manually.</p>
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
                  value={publishFormData.details}
                  onChange={handlePublishInputChange}
                  placeholder="Shelves description, burner details..."
                  className="w-full border border-[#e5e0d8] focus:border-primary focus:ring-2 focus:ring-primary/40 rounded-xl p-4 bg-white text-base outline-none transition resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={!isPublishFormValid}
                className={`w-full h-14 bg-error hover:bg-error/90 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition duration-200 ${
                  !isPublishFormValid ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <Text en="Submit Listing Request" ta="வண்டியை பதிவு செய்" />
              </Button>

            </form>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="site-container">
          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
            <h2 className="font-display text-5xl uppercase leading-none text-ink">
              <Text en="Why list on V2 platform?" ta="ஏன் வி2 தளத்தில் பதிவு செய்ய வேண்டும்?" />
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
