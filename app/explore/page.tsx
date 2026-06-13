export const runtime = "edge";

import type { Metadata } from "next";
import { MessageCircle, PenTool, Truck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartExplorer } from "@/components/sections/cart-explorer";
import { customCartMessage } from "@/lib/utils";
import { WA_NUMBER, buildWAUrl } from "@/config/whatsapp";

export const metadata: Metadata = {
  title: "Food Carts for Rent in Coimbatore | Namma Thalluvandi | Thallu Vandi Vadagai",
  description:
    "Browse rental thallu vandis in Coimbatore. Tea carts, juice carts, stove carts, covered premium carts. Starting ₹50/day. WhatsApp to book instantly.",
  keywords: [
    "d nagaraj thalluvandi ondipudur",
    "ondipudur thallu vandi rental",
    "thallu vandi ondipudur coimbatore",
    "D நாகராஜ் தளவண்டி ஒண்டிப்புதூர்"
  ],
  alternates: {
    canonical: "https://nammathalluvandi.in/explore"
  },
  openGraph: {
    title: "Food Carts for Rent in Coimbatore | Namma Thalluvandi | Thallu Vandi Vadagai",
    description: "Browse rental thallu vandis in Coimbatore. Tea carts, juice carts, stove carts, covered premium carts. Starting ₹50/day. WhatsApp to book instantly.",
    url: "https://nammathalluvandi.in/explore",
    siteName: "Namma Thalluvandi",
    images: [
      {
        url: "https://nammathalluvandi.in/brand/full-logo-with-background.webp",
        width: 1200,
        height: 630,
        alt: "Namma Thalluvandi logo"
      }
    ],
    locale: "ta_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Carts for Rent in Coimbatore | Namma Thalluvandi | Thallu Vandi Vadagai",
    description: "Browse rental thallu vandis in Coimbatore. Tea carts, juice carts, stove carts, covered premium carts. Starting ₹50/day. WhatsApp to book instantly.",
    images: ["https://nammathalluvandi.in/brand/full-logo-with-background.webp"]
  }
};

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

export default function ExplorePage() {
  return (
    <main className="pt-0 md:pt-20">
      <CartExplorer />

      {/* Redesigned Custom Manufacturing teaser section */}
      <section className="py-16 md:py-24 bg-white border-t border-black/10">
        <div className="site-container">
          <div className="grid gap-8 md:grid-cols-[0.4fr_0.6fr]">
            {/* Left Column (40%) */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316] font-semibold">
                  <span className="en">CUSTOM MANUFACTURING</span>
                  <span className="ta tamil-text">தனிப்பயன் தயாரிப்பு</span>
                </p>
                <h2 className="mt-3 font-display text-4xl uppercase leading-none text-ink md:text-5xl">
                  <span className="en">CUSTOMIZE YOUR CART & OWN IT</span>
                  <span className="ta tamil-text">உங்களுக்கே ஒரு வண்டி — நீங்களே வடிவமையுங்கள்!</span>
                </h2>
                <p className="mt-4 text-base leading-7 text-muted">
                  <span className="en">Build your own customized food cart based on your business needs. Delivery in 2–4 weeks.</span>
                  <span className="ta tamil-text">உங்கள் தேவைக்கேற்ப தனிப்பட்ட உணவு வண்டி. 2-4 வாரங்களில் டெலிவரி.</span>
                </p>
              </div>

              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f97316]">
                  <span className="en">ESTIMATED RANGE</span>
                  <span className="ta tamil-text">மதிப்பிடப்பட்ட விலை</span>
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-ink whitespace-nowrap">₹30,000 – ₹70,000+</p>
              </div>

              <Button asChild size="lg" className="mt-6 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white">
                <a href={buildWAUrl(WA_NUMBER, customCartMessage)} target="_blank">
                  <MessageCircle size={18} /> 
                  <span className="en">🔧 REQUEST CUSTOM CART</span>
                  <span className="ta tamil-text">🔧 தனிப்பயன் வண்டிக்கு கேட்க</span>
                </a>
              </Button>
            </div>

            {/* Right Column (60%) */}
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {/* DESIGN Card */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <PenTool className="text-[#f97316]" size={24} />
                  <h3 className="mt-4 font-display text-xl uppercase font-bold text-ink">
                    <span className="en">DESIGN</span>
                    <span className="ta tamil-text">வடிவமைப்பு</span>
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Tell us the size you need</span>
                      <span className="ta tamil-text">தேவையான அளவு சொல்லுங்கள்</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Choose counter layout</span>
                      <span className="ta tamil-text">கவுண்டர் வடிவமைப்பு தேர்வு</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Plan your branding space</span>
                      <span className="ta tamil-text">உங்கள் பிராண்ட் இடம் திட்டமிடுங்கள்</span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* BUILD Card */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <Wrench className="text-[#f97316]" size={24} />
                  <h3 className="mt-4 font-display text-xl uppercase font-bold text-ink">
                    <span className="en">BUILD</span>
                    <span className="ta tamil-text">கட்டுமானம்</span>
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Quality steel material</span>
                      <span className="ta tamil-text">தரமான ஸ்டீல் பொருள்</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Stove setup (optional)</span>
                      <span className="ta tamil-text">அடுப்பு அமைப்பு (விருப்பம்)</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Storage & cover options</span>
                      <span className="ta tamil-text">சேமிப்பு மற்றும் மூடி விருப்பங்கள்</span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* DELIVER Card */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <Truck className="text-[#f97316]" size={24} />
                  <h3 className="mt-4 font-display text-xl uppercase font-bold text-ink">
                    <span className="en">DELIVER</span>
                    <span className="ta tamil-text">டெலிவரி</span>
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Ready in 2-4 weeks</span>
                      <span className="ta tamil-text">2-4 வாரங்களில் தயார்</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Direct delivery in Coimbatore</span>
                      <span className="ta tamil-text">கோயம்புத்தூரில் நேரடி டெலிவரி</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#f97316] font-bold">•</span>
                    <span>
                      <span className="en">Fully checked before handover</span>
                      <span className="ta tamil-text">கையளிப்பதற்கு முன் முழு சரிபார்ப்பு</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#F8F6F2] border-t border-black/10">
        <div className="site-container max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316] text-center font-semibold">
            <Text en="FAQ" ta="கேள்வி பதில்" />
          </p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none text-ink text-center md:text-5xl">
            <Text en="Cart Rentals FAQ" ta="வண்டி வாடகை கேள்வி பதில்" />
          </h2>

          <div className="mt-12 space-y-4">
            {exploreFaqs.map(([question, tamilQuestion, answer, tamilAnswer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-black/10 bg-white p-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-ink font-bold">
                  <h3 className="font-display text-xl uppercase tracking-wide leading-tight">
                    <Text en={question} ta={tamilQuestion} />
                  </h3>
                  <span className="shrink-0 rounded-full bg-orange-50 border border-orange-200/50 p-1.5 text-primary group-open:-rotate-180 transition duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-[0.95rem] leading-7 text-muted border-t border-black/5 pt-3">
                  <Text en={answer} ta={tamilAnswer} />
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const exploreFaqs = [
  [
    "Deposit amount?",
    "முன்பணம் எவ்வளவு?",
    "Refundable security deposit is ₹2,000 – ₹10,000 depending on the cart type, model features, and built-in equipment. This amount is completely refunded within 1 week of cart return.",
    "வண்டி வகை, மாடல் மற்றும் வசதிகளைப் பொறுத்து ₹2,000 முதல் ₹10,000 வரை முன்பணம் (Deposit) பெறப்படும். வண்டியை பத்திரமாகத் திரும்பக் கொடுக்கும் போது இது 1 வாரத்திற்குள் முழுமையாகத் திருப்பித் தரப்படும்.",
  ],
  [
    "How and when is the daily rent collected?",
    "வாடகை எப்போது, எப்படி வசூலிக்கப்படும்?",
    "The daily rent is accumulated and collected weekly, mostly on Saturdays. Alternatively, we will discuss and inform you of the exact rent collection schedule during booking.",
    "தினசரி வாடகை வாரந்தோறும் கணக்கிடப்பட்டு, பெரும்பாலும் சனிக்கிழமைகளில் வசூலிக்கப்படும். அல்லது வண்டி முன்பதிவு செய்யும் போது எப்போது வசூலிக்கப்படும் என்ற விவரம் உங்களுக்குத் தெளிவுபடுத்தப்படும்.",
  ],
  [
    "Are there different cart prices?",
    "வண்டி வாடகை விலைகள் வெவ்வேறா?",
    "Yes. Daily rentals range from ₹50/day up to ₹150/day depending on the size of the cart, built-in stove burners, roof covers, and premium materials used.",
    "ஆம். வண்டியின் அளவு, அடுப்பு வசதி, மேல் கவர் மற்றும் பயன்படுத்தப்படும் ஸ்டீல் தரத்தைப் பொறுத்து ஒரு நாள் வாடகை ₹50 முதல் ₹150 வரை மாறுபடும்.",
  ],
  [
    "Is transport included in the daily rent?",
    "போக்குவரத்து வாடகையில் அடங்குமா?",
    "No. Transporting (picking up from Ondipudur and returning) the cart is entirely the renter's responsibility. You can easily rent a local tempo for transport.",
    "இல்லை. வண்டியை ஒண்டிப்புதூரிலிருந்து எடுத்துச் செல்வதும், திரும்பக் கொண்டு வந்து ஒப்படைப்பதும் வாடிக்கையாளரின் பொறுப்பாகும். இதற்கு உள்ளூர் டெம்போக்களை வாடகைக்கு எடுத்துப் பயன்படுத்திக் கொள்ளலாம்.",
  ],
  [
    "What is the minimum rental period?",
    "குறைந்தபட்ச வாடகை காலம் எவ்வளவு?",
    "The minimum rental period is 1 month as per our standard terms. Early return before 1 month will still be charged for the full month's rental.",
    "எங்கள் விதிகளின்படி குறைந்தபட்ச வாடகை காலம் 1 மாதம் ஆகும். ஒரு மாதத்திற்கு முன்பாக வண்டியைத் திரும்பிக் கொடுத்தாலும் 1 மாத வாடகை முழுமையாக வசூலிக்கப்படும்.",
  ],
];
