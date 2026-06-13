import type { Metadata } from "next";
import { MessageCircle, WalletCards } from "lucide-react";
import { Reveal } from "@/components/sections/reveal";

export const metadata: Metadata = {
  title: "How It Works | Namma Thalluvandi | Coimbatore Food Cart Rental",
  description:
    "Learn how to rent a food cart in Coimbatore. Fast WhatsApp booking, transparent deposit of ₹2,000 – ₹10,000, and weekly Saturday rent collection. We serve Coimbatore.",
  alternates: {
    canonical: "https://nammathalluvandi.in/how-it-works"
  },
  openGraph: {
    title: "How It Works | Namma Thalluvandi | Coimbatore Food Cart Rental",
    description: "Learn how to rent a food cart in Coimbatore. Fast WhatsApp booking, transparent deposit of ₹2,000 – ₹10,000, and weekly Saturday rent collection. We serve Coimbatore.",
    url: "https://nammathalluvandi.in/how-it-works",
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
    title: "How It Works | Namma Thalluvandi | Coimbatore Food Cart Rental",
    description: "Learn how to rent a food cart in Coimbatore. Fast WhatsApp booking, transparent deposit of ₹2,000 – ₹10,000, and weekly Saturday rent collection. We serve Coimbatore.",
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

const steps = [
  ["Browse the carts and choose your type", "முதலில் வண்டிகளைப் பாருங்கள், உங்களுக்குத் தகுந்த வண்டியைத் தேர்ந்தெடுக்கவும்"],
  ["Tap “Book This Cart” and WhatsApp opens", "“புக் செய்ய” என்பதை அழுத்தவும் — வாட்ஸ்அப் திறக்கும்"],
  ["Share your date and Coimbatore location", "வண்டி தேவைப்படும் தேதி, கோவையில் உங்கள் இடம் மற்றும் எத்தனை நாட்கள் என்பதைப் பகிரவும்"],
  ["Confirm deposit by Cash or UPI", "ரொக்கம் அல்லது UPI மூலம் முன்பணத்தை உறுதிப்படுத்தவும்"],
  ["Come to D. Nagaraj Thalluvandi at Ondipudur, Coimbatore to pick up your cart", "ஒண்டிப்புதூரில் உள்ள D. நாகராஜ் தளவண்டியில் நேரடியாக வந்து வண்டி எடுத்துச் செல்லலாம்"]
];

const faqs = [
  ["Deposit amount?", "Deposit எவ்வளவு?", "Refundable security deposit is ₹2,000 – ₹10,000 depending on the cart type and features. Confirmed on WhatsApp before booking.", "வண்டி வகையைப் பொறுத்து ₹2,000 – ₹10,000 முன்பணம் வாங்குவோம். வண்டியைத் திரும்பக் கொடுக்கும் போது இது முழுமையாகத் திருப்பித் தரப்படும்."],
  ["Damage policy?", "Damage ஆனா என்ன?", "Damage is checked during return. If needed, the repair cost is paid for by the renter or adjusted from the deposit as per Rule 3.", "வண்டியைத் திரும்பக் கொடுக்கும் போது சரிபார்ப்போம். ஏதேனும் சேதம் இருந்தால் பழுதுபார்ப்பு கட்டணம் வாடிக்கையாளர் செலுத்த வேண்டும் அல்லது முன்பணத்திலிருந்து கழிக்கப்படும்."],
  ["Minimum rental period?", "குறைந்தது எத்தனை நாள்?", "The minimum rental period is 1 month. Early return before 1 month will still be charged for the full month as per Rule 7.", "குறைந்தபட்ச வாடகை காலம் 1 மாதம் ஆகும். ஒரு மாதத்திற்கு முன்பாக வண்டியைத் திரும்பிக் கொடுத்தாலும் 1 மாத வாடகை முழுமையாக வசூலிக்கப்படும் (விதி 7)."],
  ["Payment methods?", "Payment எப்படி?", "Cash and UPI are supported. Final payment details are confirmed before booking.", "UPI அல்லது ரொக்கப் பணம் (Cash) — இரண்டிலும் செலுத்தலாம். முன்பணம் செலுத்தியதும் வண்டி டெலிவரிக்கு தயாராகும்."],
  ["What is the commission if I list my cart on Thalluvandi?", "என் வண்டி list பண்ணினா commission என்ன?", "Thalluvandi charges a small platform fee when your cart gets booked through us. The percentage is discussed before listing.", "உங்கள் வண்டியை எங்கள் தளத்தில் பதிவு செய்து வாடிக்கையாளர்கள் புக் செய்யும் போது மட்டுமே ஒரு சிறிய கட்டணம் வசூலிப்போம். இதை பதிவு செய்வதற்கு முன் தெளிவாகப் பேசிக்கொள்ளலாம்."]
];

export default function HowItWorksPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does it cost to rent a food cart in Tamil Nadu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Thalluvandi food cart rentals start from ₹50/day for basic carts and go up to ₹200/day for premium covered carts with stove. Deposit is refundable."
        }
      },
      {
        "@type": "Question",
        "name": "Where is Thalluvandi located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Thalluvandi is based at Ondipudur, Coimbatore, Tamil Nadu 641016. We serve Coimbatore regions."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book a food cart rental?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "WhatsApp us at +91 88382 92849. We respond the same day and confirm your booking within hours."
        }
      },
      {
        "@type": "Question",
        "name": "What types of food carts are available for rent?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We have 4 variants: Standard cart, cart with stove, cart with roof cover, and premium cart with both stove and roof. All available in Coimbatore."
        }
      }
    ]
  };

  return (
    <main className="bg-[#F8F6F2] pt-0 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="pb-16 pt-12 md:pb-20 md:pt-0">
        <div className="site-container">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Text en="How It Works" ta="எப்படி வாடகைக்கு எடுப்பது?" />
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-6xl uppercase leading-none text-ink md:text-8xl">
            <Text en="How to Rent a Food Cart from Thalluvandi" ta="எளிய முறையில் வாடகைக்கு தள்ளுவண்டி" />
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            <Text en="Simple WhatsApp-first rental process. WhatsApp to book, same-day response. Food cart rentals in Coimbatore." ta="புதிய தொழில் தொடங்க நினைப்பவர்களுக்கு வாட்ஸ்அப் மூலம் எளிய மற்றும் விரைவான முன்பதிவு சேவை." />
          </p>
        </div>
      </section>

      <section className="pb-20 md:pb-24">
        <div className="site-container max-w-[1000px]">
          <div className="relative">
            <div className="absolute left-7 top-8 h-[calc(100%-64px)] w-px bg-black/12" />
            {steps.map(([step, tamilStep], index) => (
              <Reveal key={step} className="relative grid grid-cols-[72px_1fr] gap-4 py-4 md:grid-cols-[92px_1fr] md:gap-6 md:py-6">
                <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-3xl text-white shadow-glow">
                  {index + 1}
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                  <h2 className="font-display text-3xl uppercase leading-none text-ink md:text-4xl">
                    <Text en={step} ta={tamilStep} />
                  </h2>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-4 rounded-2xl border border-black/10 bg-white p-6 md:grid-cols-2 md:gap-6">
            <div>
              <MessageCircle className="text-primary" />
              <h3 className="mt-4 font-display text-4xl uppercase text-ink">
                <Text en="Pre-filled inquiry" ta="விரைவான தகவல்" />
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                <Text en="Each cart opens WhatsApp with that cart name." ta="ஒவ்வொரு தள்ளுவண்டிக்கும் தனிப்பட்ட வாட்ஸ்அப் மெசேஜ் தயாராக இருக்கும்." />
              </p>
            </div>
            <div>
              <WalletCards className="text-primary" />
              <h3 className="mt-4 font-display text-4xl uppercase text-ink">
                <Text en="Clear deposit" ta="தெளிவான முன்பணம்" />
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                <Text en="Deposit is confirmed before booking." ta="முன்பதிவு செய்வதற்கு முன்பே முன்பணத் தொகை தெளிவாகத் தெரிவிக்கப்படும்." />
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="site-container max-w-[1000px]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-5xl uppercase leading-none text-ink">
            <Text en="Frequently Asked Questions" ta="அடிக்கடி கேட்கப்படும் கேள்விகள்" />
          </h2>
          <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
            {faqs.map(([question, tamilQuestion, answer, tamilAnswer]) => (
              <details key={question} className="group p-6 open:bg-[#F8F6F2]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-ink">
                  <span className="font-display text-xl uppercase tracking-[0.14em] text-ink faq-question-title">
                    <Text en={question} ta={tamilQuestion} />
                  </span>
                  <span className="text-xl text-primary group-open:hidden">+</span>
                  <span className="hidden text-xl text-primary group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-[0.95rem] leading-7 text-muted">
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
