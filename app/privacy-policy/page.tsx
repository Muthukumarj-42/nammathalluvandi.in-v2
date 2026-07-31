// app/privacy-policy/page.tsx
// Privacy Policy Page for Namma Thalluvandi

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Namma Thalluvandi",
  description: "Understand how Namma Thalluvandi collects, uses, protects, and manages your personal data and WhatsApp OTP verification inputs.",
  alternates: {
    canonical: "https://nammathalluvandi.in/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Namma Thalluvandi",
    description: "Understand how Namma Thalluvandi collects, uses, protects, and manages your personal data and WhatsApp OTP verification inputs.",
    url: "https://nammathalluvandi.in/privacy-policy",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Namma Thalluvandi",
    description: "Understand how Namma Thalluvandi collects, uses, protects, and manages your personal data.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

const SECTIONS = [
  { id: "introduction", labelEn: "1. Introduction", labelTa: "1. அறிமுகம்" },
  { id: "info-collect", labelEn: "2. Information We Collect", labelTa: "2. நாங்கள் சேகரிக்கும் தகவல்கள்" },
  { id: "info-use", labelEn: "3. How We Use Information", labelTa: "3. நாங்கள் பயன்படுத்தும் முறை" },
  { id: "whatsapp-otp", labelEn: "4. WhatsApp OTP & Login", labelTa: "4. வாட்ஸ்அப் OTP மற்றும் லாகின்" },
  { id: "third-party", labelEn: "5. Third-Party Services", labelTa: "5. மூன்றாம் தரப்பு சேவைகள்" },
  { id: "cookies", labelEn: "6. Cookies & Tracking", labelTa: "6. குக்கீகள் மற்றும் கண்காணிப்பு" },
  { id: "retention", labelEn: "7. Data Retention & Security", labelTa: "7. தரவு பாதுகாப்பு மற்றும் சேமிப்பு" },
  { id: "user-rights", labelEn: "8. Your Rights & Choices", labelTa: "8. உங்கள் உரிமைகள் மற்றும் விருப்பங்கள்" },
  { id: "contact-us", labelEn: "9. Contact Us", labelTa: "9. எங்களை தொடர்பு கொள்ள" }
];

export default function PrivacyPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Namma Thalluvandi",
    "description": "Namma Thalluvandi privacy protection details, data safety norms, and Meta WhatsApp OTP processing regulations.",
    "url": "https://nammathalluvandi.in/privacy-policy",
    "inLanguage": ["en", "ta"],
    "publisher": {
      "@type": "Organization",
      "name": "Namma Thalluvandi",
      "url": "https://nammathalluvandi.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nammathalluvandi.in/logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-white min-h-screen text-[#1a1208] pb-20 pt-6 md:pt-24 font-sans antialiased">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header Banner */}
          <div className="border-b border-gray-100 pb-8 mb-10">
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-[#1a3d2e] font-black">
              <span className="en">Privacy Policy</span>
              <span className="ta tamil-text font-semibold">தனியுரிமைக் கொள்கை</span>
            </h1>
            <p className="mt-3 text-sm text-[#6b7d72] font-semibold flex gap-2">
              <span>
                <span className="en">Last Updated: July 31, 2026</span>
                <span className="ta tamil-text">கடைசியாக புதுப்பிக்கப்பட்டது: ஜூலை 31, 2026</span>
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Sticky Sidebar (Table of Contents) */}
            <aside aria-label="Table of Contents" className="hidden lg:block lg:col-span-4 sticky top-24 bg-[#f5f0e6]/50 p-6 rounded-2xl border border-[#e8dfc8] shadow-sm">
              <h2 className="font-display text-lg uppercase tracking-wider text-[#1a3d2e] font-bold border-b border-[#e8dfc8]/60 pb-3 mb-4">
                <span className="en">Table of Contents</span>
                <span className="ta tamil-text text-base">பொருளடக்கம்</span>
              </h2>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block py-2 px-3 text-sm text-[#6b7d72] hover:text-[#e8732c] hover:bg-white rounded-lg transition font-medium border border-transparent hover:border-[#e8dfc8]/40"
                  >
                    <span className="en">{sec.labelEn}</span>
                    <span className="ta tamil-text">{sec.labelTa}</span>
                  </a>
                ))}
              </nav>
            </aside>

            {/* Privacy Policy Content */}
            <article className="lg:col-span-8 space-y-12 leading-7 text-gray-700">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">1. Introduction</span>
                  <span className="ta tamil-text text-xl font-bold">1. அறிமுகம்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    Welcome to Namma Thalluvandi ("we," "our," or "us"). We operate the online platform 
                    <a href="https://nammathalluvandi.in" className="text-[#e8732c] hover:underline font-semibold mx-1">https://nammathalluvandi.in</a> 
                    connecting food cart owners (Vendors) with street food entrepreneurs (Renters) primarily in Coimbatore, Tiruppur, and expanding across Tamil Nadu.
                  </p>
                  <p className="ta tamil-text text-base">
                    நம்ம தள்ளுவண்டி ("நாங்கள்", "எங்கள்" அல்லது "எங்களை") தங்களை அன்புடன் வரவேற்கிறது. நாங்கள் கோயம்புத்தூர் மற்றும் திருப்பூர் மாவட்டங்களை முதன்மையாகக் கொண்டு, தமிழகம் முழுவதும் உணவு தள்ளுவண்டி உரிமையாளர்களையும் (உரிமையாளர்கள்) தள்ளுவண்டி வாடகைக்கு எடுக்க விரும்பும் தெரு உணவு தொழில்முனைவோரையும் (வாடிக்கையாளர்கள்) இணைக்கும் 
                    <a href="https://nammathalluvandi.in" className="text-[#e8732c] hover:underline font-semibold mx-1">https://nammathalluvandi.in</a> 
                    என்ற தளத்தை நடத்தி வருகிறோம்.
                  </p>
                  <p className="en">
                    We are dedicated to safeguarding your personal data in accordance with the Information Technology Act, 2000 of India, 
                    DPDP Act 2023, and GDPR guidelines where applicable. This Privacy Policy details how we collect, process, and protect your data.
                  </p>
                  <p className="ta tamil-text text-base">
                    இந்தியாவின் தகவல் தொழில்நுட்பச் சட்டம் 2000, தனிநபர் தரவுப் பாதுகாப்பு மசோதா மற்றும் பிற பாதுகாப்பு வழிகாட்டுதல்களின்படி உங்கள் தனிப்பட்ட தரவைப் பாதுகாக்க நாங்கள் கடமைப்பட்டுள்ளோம். இந்த தனியுரிமைக் கொள்கை உங்கள் தரவை நாங்கள் எவ்வாறு சேகரிக்கிறோம், செயலாக்குகிறோம் மற்றும் பாதுகாக்கிறோம் என்பதை விளக்குகிறது.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="info-collect" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">2. Information We Collect</span>
                  <span className="ta tamil-text text-xl font-bold">2. நாங்கள் சேகரிக்கும் தகவல்கள்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">We collect personal data directly from you or automatically during navigation:</p>
                  <p className="ta tamil-text text-base">நாங்கள் உங்களிடமிருந்து நேரடியாக அல்லது தானியங்கி முறையில் பின்வரும் தகவல்களைச் சேகரிக்கிறோம்:</p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>
                        <span className="en">Identity Data:</span>
                        <span className="ta tamil-text">அடையாள தரவு:</span>
                      </strong>
                      <span className="en"> Full name and Google avatar profiles when using social sign-in features.</span>
                      <span className="ta tamil-text"> நீங்கள் கூகுள் லாகின் மூலம் உள்நுழையும்போது உங்கள் பெயர் மற்றும் கூகுள் சுயவிவரப் படம்.</span>
                    </li>
                    <li>
                      <strong>
                        <span className="en">Contact Information:</span>
                        <span className="ta tamil-text">தொடர்பு தகவல்:</span>
                      </strong>
                      <span className="en"> Phone number, email address, WhatsApp numbers, and physical location coordinates.</span>
                      <span className="ta tamil-text"> உங்கள் தொலைபேசி எண், மின்னஞ்சல் முகவரி, வாட்ஸ்அப் எண்கள் மற்றும் இருப்பிட ஒருங்கிணைப்புகள் (கோயம்புத்தூர் & திருப்பூர் பகுதி).</span>
                    </li>
                    <li>
                      <strong>
                        <span className="en">Booking & Transactional Data:</span>
                        <span className="ta tamil-text">வாடகை விவரங்கள்:</span>
                      </strong>
                      <span className="en"> Cart preferences, requested rental dates, rental duration history, location targets, and messages sent via WhatsApp.</span>
                      <span className="ta tamil-text"> நீங்கள் வாடகைக்கு எடுக்கத் தேர்ந்தெடுக்கும் வண்டி, வாடகைத் தேதி, வாடகை காலம் மற்றும் எங்கள் தளம் வழியே அனுப்பப்படும் வாட்ஸ்அப் செய்திகள்.</span>
                    </li>
                    <li>
                      <strong>
                        <span className="en">Technical Data:</span>
                        <span className="ta tamil-text">தொழில்நுட்ப தரவு:</span>
                      </strong>
                      <span className="en"> Device configurations, IP address, operating system, and analytics tracking data.</span>
                      <span className="ta tamil-text"> நீங்கள் பயன்படுத்தும் சாதனம், ஐபி முகவரி (IP Address), இயக்க முறைமை மற்றும் பகுப்பாய்வு தரவு.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* How We Use Information */}
              <section id="info-use" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">3. How We Use Information</span>
                  <span className="ta tamil-text text-xl font-bold">3. நாங்கள் பயன்படுத்தும் முறை</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">We process your personal information to deliver our rental services efficiently:</p>
                  <p className="ta tamil-text text-base">உங்களுக்கு சிறந்த சேவையை வழங்குவதற்காக உங்கள் தனிப்பட்ட தகவல்களைப் பயன்படுத்துகிறோம்:</p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="en">To facilitate fast, automated bookings between renters and vendors.</span>
                      <span className="ta tamil-text">உரிமையாளர்களுக்கும் வாடிக்கையாளர்களுக்கும் இடையே விரைவான வாடகைகளை எளிதாக்க.</span>
                    </li>
                    <li>
                      <span className="en">To authenticate users and verify mobile numbers via secure WhatsApp OTP templates.</span>
                      <span className="ta tamil-text">பயனர்களை உறுதிப்படுத்தவும், வாட்ஸ்அப் OTP மூலம் தொலைபேசி எண்ணைச் சரிபார்க்கவும்.</span>
                    </li>
                    <li>
                      <span className="en">To map local cart positions in Coimbatore and Tiruppur using coordinates.</span>
                      <span className="ta tamil-text">இருப்பிட ஒருங்கிணைப்புகளைப் பயன்படுத்தி தள்ளுவண்டிகளின் சரியான இடங்களைக் கண்டறிய.</span>
                    </li>
                    <li>
                      <span className="en">To enhance platform safety, block fraudulent accounts, and prevent listing abuses.</span>
                      <span className="ta tamil-text">தளத்தின் பாதுகாப்பை மேம்படுத்தவும், ஏமாற்றுக்காரர்களைத் தடுக்கவும்.</span>
                    </li>
                    <li>
                      <span className="en">To introduce future features such as digital payment integrations, review logs, and notification feeds.</span>
                      <span className="ta tamil-text">வருங்காலத்தில் வரவிருக்கும் கட்டண வசதிகள், மதிப்புரைகள் மற்றும் அறிவிப்புகளுக்காக.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* WhatsApp OTP & Login */}
              <section id="whatsapp-otp" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">4. WhatsApp OTP & Login</span>
                  <span className="ta tamil-text text-xl font-bold">4. வாட்ஸ்அப் OTP மற்றும் லாகின்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    To maintain trust and eliminate spam, we require mobile validation using the Meta WhatsApp Cloud API. 
                    When booking a cart, an OTP code is generated, sent to your registered number, and stored temporarily inside our database. 
                    This verifies that you own the number before you are redirected to WhatsApp to contact the cart owner.
                  </p>
                  <p className="ta tamil-text text-base">
                    நம்பகத்தன்மையை உறுதிப்படுத்தவும், போலி பதிவுகளைத் தவிர்க்கவும், மெட்டா வாட்ஸ்அப் கிளவுட் API (Meta WhatsApp Cloud API) மூலமாக மொபைல் சரிபார்ப்பைக் கட்டாயமாக்குகிறோம். 
                    நீங்கள் முன்பதிவு செய்யும்போது, ஒரு கடவுச்சொல் (OTP) உருவாக்கப்பட்டு உங்கள் எண்ணுக்கு அனுப்பப்படும். இது நீங்கள் அந்த எண்ணின் உண்மையான உரிமையாளர் என்பதை உறுதிப்படுத்துகிறது.
                  </p>
                  <p className="en">
                    Google Sign-In is utilized for passwordless authentication. We only fetch your basic profile (Name, Email, Profile Picture) 
                    and securely manage authentication tokens on the client-side via Supabase.
                  </p>
                  <p className="ta tamil-text text-base">
                    கடவுச்சொல் இல்லாத உள்நுழைவுக்கு (Login) கூகுள் உள்நுழைவு (Google Sign-In) பயன்படுத்தப்படுகிறது. நாங்கள் உங்கள் பெயர், மின்னஞ்சல் மற்றும் படங்களை மட்டுமே சேகரித்து சுபாபேஸ் (Supabase) வழியே பாதுகாக்கிறோம்.
                  </p>
                </div>
              </section>

              {/* Third-Party Services */}
              <section id="third-party" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">5. Third-Party Services</span>
                  <span className="ta tamil-text text-xl font-bold">5. மூன்றாம் தரப்பு சேவைகள்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">We share collected data with third-party service providers who assist us in operating our platform:</p>
                  <p className="ta tamil-text text-base">எங்கள் தளத்தை சீராக இயக்க உதவும் பின்வரும் மூன்றாம் தரப்பு நிறுவனங்களுடன் உங்கள் தரவைப் பகிர்கிறோம்:</p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Supabase:</strong>
                      <span className="en"> Data hosting, user session persistence, and secure Deno Edge Functions operations.</span>
                      <span className="ta tamil-text"> தரவு சேமிப்பு மற்றும் பாதுகாப்பு பராமரிப்பு.</span>
                    </li>
                    <li>
                      <strong>Vercel:</strong>
                      <span className="en"> Frontend compilation delivery and hosting environments.</span>
                      <span className="ta tamil-text"> இணையதள ஹோஸ்டிங் மற்றும் வேகமான கட்டமைப்பு வழங்கல்.</span>
                    </li>
                    <li>
                      <strong>Meta (WhatsApp Cloud API):</strong>
                      <span className="en"> Processing of transactional and verification OTP templates.</span>
                      <span className="ta tamil-text"> வாட்ஸ்அப் OTP மற்றும் முன்பதிவு அறிவிப்புகளை அனுப்புதல்.</span>
                    </li>
                    <li>
                      <strong>Google:</strong>
                      <span className="en"> Social authentication workflows and optional tracking analytics.</span>
                      <span className="ta tamil-text"> கூகுள் லாகின் மற்றும் இணையதள பகுப்பாய்வு.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">6. Cookies & Tracking</span>
                  <span className="ta tamil-text text-xl font-bold">6. குக்கீகள் மற்றும் கண்காணிப்பு</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    We use cookies and local storage to optimize user sessions and retain filled data (such as listing progress steps). 
                    You can control cookie settings in your browser, but disabling them may limit some interactive features.
                  </p>
                  <p className="ta tamil-text text-base">
                    பயனர் அமர்வுகளை மேம்படுத்தவும், நீங்கள் பூர்த்தி செய்த விவரங்களை நினைவில் கொள்ளவும் (உதாரணமாக முன்பதிவு அல்லது பதிவேற்ற படிவம்) நாங்கள் குக்கீகள் (Cookies) மற்றும் லோக்கல் ஸ்டோரேஜை (Local Storage) பயன்படுத்துகிறோம். 
                    உங்கள் உலாவியில் குக்கீகளின் அமைப்புகளை மாற்றலாம், ஆனால் அவை முடக்கப்பட்டால் தளத்தின் சில அம்சங்கள் சரியாக வேலை செய்யாமல் போகலாம்.
                  </p>
                </div>
              </section>

              {/* Data Retention & Security */}
              <section id="retention" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">7. Data Retention & Security</span>
                  <span className="ta tamil-text text-xl font-bold">7. தரவு பாதுகாப்பு மற்றும் சேமிப்பு</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    We implement industry-standard secure socket layers (SSL) and database encryption to guard your information. 
                    OTP logs are automatically expired and deleted from database storage within 10 minutes. 
                    General user and listing data are stored as long as your account is active.
                  </p>
                  <p className="ta tamil-text text-base">
                    உங்கள் தகவல்களைப் பாதுகாக்க எலக்ட்ரானிக் குறியாக்க (SSL) முறைகள் மற்றும் தரவுத்தள பாதுகாப்புகளைப் பயன்படுத்துகிறோம். 
                    வாட்ஸ்அப் OTP பதிவுகள் 10 நிமிடங்களில் தரவுத்தளத்திலிருந்து தானாகவே நீக்கப்படும். 
                    உங்கள் கணக்கு பயன்பாட்டில் இருக்கும் வரை உங்கள் பொதுவான கணக்கு விவரங்கள் சேமிக்கப்படும்.
                  </p>
                </div>
              </section>

              {/* Your Rights & Choices */}
              <section id="user-rights" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">8. Your Rights & Choices</span>
                  <span className="ta tamil-text text-xl font-bold">8. உங்கள் உரிமைகள் மற்றும் விருப்பங்கள்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">You hold the following rights regarding the personal information we process:</p>
                  <p className="ta tamil-text text-base">நாங்கள் செயலாக்கும் உங்கள் தனிப்பட்ட தகவல்கள் குறித்து உங்களுக்கு பின்வரும் உரிமைகள் உள்ளன:</p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="en">Access to view the data we store on your profile.</span>
                      <span className="ta tamil-text">நாங்கள் சேமித்துள்ள உங்கள் விவரங்களைக் கோரிப் பார்க்க.</span>
                    </li>
                    <li>
                      <span className="en">Correction or update of incorrect phone numbers or coordinates.</span>
                      <span className="ta tamil-text">தவறான தொலைபேசி எண்கள் அல்லது முகவரிகளைத் திருத்த.</span>
                    </li>
                    <li>
                      <span className="en">Request erasure/deletion of your personal data from our servers.</span>
                      <span className="ta tamil-text">எங்கள் சேவையகங்களிலிருந்து உங்கள் தரவை முழுமையாக நீக்கக் கோர.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Contact Us */}
              <section id="contact-us" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">9. Contact Us</span>
                  <span className="ta tamil-text text-xl font-bold">9. எங்களை தொடர்பு கொள்ள</span>
                </h2>
                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="en">
                    For any questions regarding this Privacy Policy or to exercise your rights, please reach out to us:
                  </p>
                  <p className="ta tamil-text text-base">
                    இந்தக் தனியுரிமைக் கொள்கை அல்லது உங்கள் உரிமைகளைப் பயன்படுத்துவது தொடர்பாக ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்:
                  </p>
                  
                  <div className="mt-3 text-sm space-y-1 text-gray-800">
                    <p className="font-bold text-[#1a3d2e]">Namma Thalluvandi</p>
                    <p>Coimbatore, Tamil Nadu, India</p>
                    <p>
                      <strong>Email:</strong> 
                      <a href="mailto:support@nammathalluvandi.in" className="text-[#e8732c] hover:underline ml-1">support@nammathalluvandi.in</a>
                    </p>
                    <p>
                      <strong>Website:</strong> 
                      <a href="https://nammathalluvandi.in" className="text-[#e8732c] hover:underline ml-1">https://nammathalluvandi.in</a>
                    </p>
                  </div>
                </div>
              </section>

            </article>

          </div>
        </div>
      </main>
    </>
  );
}
