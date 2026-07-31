// app/terms-and-conditions/page.tsx
// Terms & Conditions Page for Namma Thalluvandi

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Namma Thalluvandi",
  description: "Read the Terms & Conditions of Namma Thalluvandi, detailing marketplace usage policies, booking disclaimers, and renter eligibility rules.",
  alternates: {
    canonical: "https://nammathalluvandi.in/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | Namma Thalluvandi",
    description: "Read the Terms & Conditions of Namma Thalluvandi, detailing marketplace usage policies, booking disclaimers, and renter eligibility rules.",
    url: "https://nammathalluvandi.in/terms-and-conditions",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | Namma Thalluvandi",
    description: "Read the Terms & Conditions of Namma Thalluvandi, detailing marketplace usage policies, booking disclaimers, and renter eligibility rules.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

const SECTIONS = [
  { id: "acceptance", labelEn: "1. Acceptance of Terms", labelTa: "1. விதிமுறைகளை ஒப்புக்கொள்ளுதல்" },
  { id: "eligibility", labelEn: "2. Eligibility & Accounts", labelTa: "2. தகுதி மற்றும் பயனர் கணக்குகள்" },
  { id: "disclaimers", labelEn: "3. Rental Disclaimers", labelTa: "3. வாடகை பொறுப்புத் துறப்பு" },
  { id: "vendor-rules", labelEn: "4. Vendor Responsibilities", labelTa: "4. உரிமையாளர்களின் கடமைகள்" },
  { id: "payments", labelEn: "5. Payments & Cancellations", labelTa: "5. கட்டணங்கள் மற்றும் ரத்து செய்தல்" },
  { id: "intellectual", labelEn: "6. Intellectual Property", labelTa: "6. அறிவுசார் சொத்துரிமை" },
  { id: "prohibited", labelEn: "7. Prohibited Activities", labelTa: "7. தடைசெய்யப்பட்ட செயல்கள்" },
  { id: "termination", labelEn: "8. Account Termination", labelTa: "8. கணக்கு முடக்கம்" },
  { id: "governing-law", labelEn: "9. Governing Law", labelTa: "9. ஆளும் சட்டம் & தீர்வு" },
  { id: "contact-info", labelEn: "10. Contact Details", labelTa: "10. தொடர்பு முகவரி" }
];

export default function TermsAndConditionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms and Conditions - Namma Thalluvandi",
    "description": "Namma Thalluvandi legal terms, rental guidelines, cancelation rules, and governing laws of Tamil Nadu.",
    "url": "https://nammathalluvandi.in/terms-and-conditions",
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
              <span className="en">Terms & Conditions</span>
              <span className="ta tamil-text font-semibold">விதிமுறைகள் மற்றும் நிபந்தனைகள்</span>
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

            {/* Terms and Conditions Content */}
            <article className="lg:col-span-8 space-y-12 leading-7 text-gray-700">
              
              {/* Section 1: Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">1. Acceptance of Terms</span>
                  <span className="ta tamil-text text-xl font-bold">1. விதிமுறைகளை ஒப்புக்கொள்ளுதல்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    By accessing or using the Namma Thalluvandi website (
                    <a href="https://nammathalluvandi.in" className="text-[#e8732c] hover:underline font-semibold mx-1">https://nammathalluvandi.in</a>
                    ), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all of these terms, please do not use this site.
                  </p>
                  <p className="ta tamil-text text-base">
                    நம்ம தள்ளுவண்டி இணையதளத்தை (
                    <a href="https://nammathalluvandi.in" className="text-[#e8732c] hover:underline font-semibold mx-1">https://nammathalluvandi.in</a>
                    ) அணுகுவதன் அல்லது பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள் மற்றும் நிபந்தனைகளை முழுமையாக ஏற்றுக்கொள்ள ஒப்புக்கொள்கிறீர்கள். இந்த விதிமுறைகளில் உங்களுக்கு உடன்பாடு இல்லை எனில், இந்தத் தளத்தைப் பயன்படுத்த வேண்டாம்.
                  </p>
                </div>
              </section>

              {/* Section 2: Eligibility & Accounts */}
              <section id="eligibility" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">2. Eligibility & Accounts</span>
                  <span className="ta tamil-text text-xl font-bold">2. தகுதி மற்றும் பயனர் கணக்குகள்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    To register an account or request cart rentals on this platform, you must be at least 18 years of age and hold legal authority to enter into contract agreements in India.
                  </p>
                  <p className="ta tamil-text text-base">
                    எங்கள் தளத்தில் கணக்கு தொடங்க அல்லது வண்டி வாடகைக்குக் கோர, நீங்கள் குறைந்தபட்சம் 18 வயது நிரம்பியவராகவும், இந்தியாவில் சட்டப்பூர்வ ஒப்பந்தங்களில் ஈடுபட தகுதியுடையவராகவும் இருக்க வேண்டும்.
                  </p>
                  <p className="en">
                    You are solely responsible for maintaining the confidentiality of your credentials (including your phone number used for OTP logins) and all actions occurring under your registered profile.
                  </p>
                  <p className="ta tamil-text text-base">
                    உங்களது கணக்கு விவரங்களின் இரகசியத்தன்மையை (OTP உள்நுழைவுக்காகப் பயன்படுத்தப்படும் உங்கள் தொலைபேசி எண் உட்பட) மற்றும் உங்கள் கணக்கின் கீழ் நடக்கும் அனைத்துச் செயல்களுக்கும் நீங்களே முழுப் பொறுப்பாவீர்கள்.
                  </p>
                </div>
              </section>

              {/* Section 3: Rental Disclaimers */}
              <section id="disclaimers" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">3. Booking & Rental Disclaimers</span>
                  <span className="ta tamil-text text-xl font-bold">3. வாடகை பொறுப்புத் துறப்பு</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    Namma Thalluvandi functions strictly as an interactive listing platform matching street food vendors with entrepreneurs. 
                    We are **NOT** a direct rental service, and we do not own or maintain the food carts listed on this platform unless explicitly specified.
                  </p>
                  <p className="ta tamil-text text-base">
                    நம்ம தள்ளுவண்டி என்பது தள்ளுவண்டி உரிமையாளர்களையும் வாடிக்கையாளர்களையும் இணைக்கும் ஒரு இடைமுக தளம் மட்டுமே ஆகும். 
                    நாங்கள் நேரடியாக வண்டிகளை வாடகைக்கு வழங்குவதில்லை. இந்தத் தளத்தில் பட்டியலிடப்பட்டுள்ள தள்ளுவண்டிகள் உரிமையாளர்களுக்குச் சொந்தமானவை.
                  </p>
                  <p className="en">
                    All rental terms (such as rent, deposit, maintenance, shipping, location changes, and food safety compliance) are strictly negotiated and finalized directly between the Vendor and the Renter. 
                    Namma Thalluvandi shall not be liable for cart defects, disputes, or losses resulting from these agreements.
                  </p>
                  <p className="ta tamil-text text-base">
                    வாடகைத் தொகை, முன்பணம் (Deposit), பராமரிப்பு, வண்டி போக்குவரத்து மற்றும் உணவுப் பாதுகாப்பு விதிமுறைகள் அனைத்தும் வண்டி உரிமையாளருக்கும் வாடிக்கையாளருக்கும் இடையே நேரடியாகப் பேசப்பட்டு முடிவு செய்யப்பட வேண்டியவை. இவற்றில் ஏற்படும் எந்த ஒரு பிரச்சனைக்கும் நம்ம தள்ளுவண்டி பொறுப்பாகாது.
                  </p>
                </div>
              </section>

              {/* Section 4: Vendor Responsibilities */}
              <section id="vendor-rules" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">4. Vendor Responsibilities</span>
                  <span className="ta tamil-text text-xl font-bold">4. உரிமையாளர்களின் கடமைகள்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    Vendors publishing carts on the platform must guarantee that all listed cart specifications, conditions, price metrics (daily price, refundable deposit, negotiable toggles), and photographs are accurate.
                  </p>
                  <p className="ta tamil-text text-base">
                    தளத்தில் தங்கள் வண்டிகளைப் பட்டியலிடும் உரிமையாளர்கள், வண்டியின் தரம், வாடகைத் தொகை, திரும்பப் பெறக்கூடிய முன்பணம் (Refundable Deposit) மற்றும் புகைப்படங்கள் ஆகியவை உண்மையானவை என்பதை உறுதிப்படுத்த வேண்டும்.
                  </p>
                  <p className="en">
                    We reserve the right to review, edit, or remove any thalluvandi listings that violate local regulations, contain misleading descriptions, or receive multiple customer complaints.
                  </p>
                  <p className="ta tamil-text text-base">
                    தவறான விவரங்களைக் கொண்ட அல்லது வாடிக்கையாளர்களிடமிருந்து அதிக புகார்களைப் பெறும் வண்டிகளைத் திருத்த அல்லது தளத்திலிருந்து நீக்க எங்களுக்கு முழு உரிமை உண்டு.
                  </p>
                </div>
              </section>

              {/* Section 5: Payments & Cancellations */}
              <section id="payments" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">5. Payments & Cancellations</span>
                  <span className="ta tamil-text text-xl font-bold">5. கட்டணங்கள் மற்றும் ரத்து செய்தல்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    Currently, Namma Thalluvandi does not process direct digital payments on the website. 
                    All rental payments (deposits or monthly rents) must be handled directly between the parties. 
                    Payment gateway integrations introduced in future upgrades will be subject to additional transactional terms.
                  </p>
                  <p className="ta tamil-text text-base">
                    தற்போது, நம்ம தள்ளுவண்டி இணையதளத்தின் மூலம் நேரடியாக எவ்வித பணப் பரிவர்த்தனையையும் மேற்கொள்வதில்லை. 
                    வாடகைத் தொகைகள் மற்றும் முன்பணம் அனைத்தும் நேரடியாகவே வழங்கப்பட வேண்டும். எதிர்காலத்தில் இணையதளம் வழி கட்டண வசதி அறிமுகப்படுத்தப்பட்டால், அதற்கான கூடுதல் விதிமுறைகள் தனியாக அறிவிக்கப்படும்.
                  </p>
                  <p className="en">
                    Refunds, cancelation options, and rental contract terminations are governed by the private agreement signed between the Vendor and the Renter. We are not responsible for enforcing cancellations or managing deposit refunds.
                  </p>
                  <p className="ta tamil-text text-base">
                    முன்பதிவு ரத்து மற்றும் முன்பணம் திரும்பப் பெறுதல் ஆகியவை இரு தரப்பினருக்கும் இடையே கையெழுத்திடப்பட்ட ஒப்பந்தத்தின் அடிப்படையிலானது.
                  </p>
                </div>
              </section>

              {/* Section 6: Intellectual Property */}
              <section id="intellectual" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">6. Intellectual Property</span>
                  <span className="ta tamil-text text-xl font-bold">6. அறிவுசார் சொத்துரிமை</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    The logos, brand names, codebases, design guidelines, layouts, assets, and text materials displayed on Namma Thalluvandi 
                    are the exclusive intellectual property of Namma Thalluvandi and are protected under Indian copyright and trademark regulations.
                  </p>
                  <p className="ta tamil-text text-base">
                    நம்ம தள்ளுவண்டி தளத்தில் உள்ள முத்திரைகள், சின்னங்கள், லோகோக்கள், வடிவமைப்பு முறைகள், இணையதள குறியீடுகள் மற்றும் உரை பொருட்கள் அனைத்தும் நம்ம தள்ளுவண்டியின் முழு சொத்துரிமைக்கு உட்பட்டவை.
                  </p>
                </div>
              </section>

              {/* Section 7: Prohibited Activities */}
              <section id="prohibited" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">7. Prohibited Activities</span>
                  <span className="ta tamil-text text-xl font-bold">7. தடைசெய்யப்பட்ட செயல்கள்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">Users are strictly prohibited from:</p>
                  <p className="ta tamil-text text-base">எங்கள் தளத்தில் பின்வரும் செயல்களைச் செய்யக் கண்டிப்பாகத் தடைவிதிக்கப்பட்டுள்ளது:</p>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="en">Publishing false, duplicate, or outdated food cart listings.</span>
                      <span className="ta tamil-text">போலியான, தவறான அல்லது காலாவதியான தள்ளுவண்டி விவரங்களை பதிவிடுவது.</span>
                    </li>
                    <li>
                      <span className="en">Attempting to bypass WhatsApp OTP checks or sending automated spam requests.</span>
                      <span className="ta tamil-text">வாட்ஸ்அப் OTP முறைகளைத் தவிர்க்க முயல்வது அல்லது தானியங்கி ஸ்பேம் செய்திகளை அனுப்புவது.</span>
                    </li>
                    <li>
                      <span className="en">Using listing photos that do not belong to the actual cart.</span>
                      <span className="ta tamil-text">உண்மையான வண்டிக்குச் சொந்தமில்லாத புகைப்படங்களைப் பயன்படுத்துவது.</span>
                    </li>
                    <li>
                      <span className="en">Violating local municipal laws regarding street vending in Coimbatore and Tiruppur.</span>
                      <span className="ta tamil-text">கோவை மற்றும் திருப்பூர் மாநகராட்சி தெருவோர வியாபார விதிகளை மீறுவது.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 8: Account Termination */}
              <section id="termination" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">8. Account Termination</span>
                  <span className="ta tamil-text text-xl font-bold">8. கணக்கு முடக்கம்</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    We hold absolute authority to suspend or permanently block your access to Namma Thalluvandi without prior notice 
                    if you violate any conditions, default on verified details, or engage in suspicious rental behaviors.
                  </p>
                  <p className="ta tamil-text text-base">
                    எங்கள் விதிமுறைகளை மீறுவது அல்லது சந்தேகத்திற்குரிய செயல்களில் ஈடுபடுவது போன்ற காரணங்களுக்காக, முன்னறிவிப்பின்றி உங்களது கணக்கை தற்காலிகமாகவோ அல்லது நிரந்தரமாகவோ முடக்க எங்களுக்கு முழு உரிமை உண்டு.
                  </p>
                </div>
              </section>

              {/* Section 9: Governing Law */}
              <section id="governing-law" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">9. Governing Law & Dispute Resolution</span>
                  <span className="ta tamil-text text-xl font-bold">9. ஆளும் சட்டம் மற்றும் தகராறு தீர்வு</span>
                </h2>
                <div className="space-y-4">
                  <p className="en">
                    These Terms and Conditions are governed by and construed in accordance with the laws of India and the State of Tamil Nadu. 
                    Any legal disputes arising from the usage of Namma Thalluvandi shall be subject to the exclusive jurisdiction of the courts located in Coimbatore, Tamil Nadu, India.
                  </p>
                  <p className="ta tamil-text text-base">
                    இந்த விதிமுறைகள் மற்றும் நிபந்தனைகள் இந்தியச் சட்டங்கள் மற்றும் தமிழ்நாடு மாநில சட்டங்களுக்கு உட்பட்டவை. 
                    நம்ம தள்ளுவண்டி பயன்பாடு தொடர்பாக எழும் எந்தவொரு சட்டப் பிரச்சனைகளும் கோவை நீதிமன்றத்தின் பிரத்தியேக அதிகார வரம்பிற்கு உட்பட்டது.
                  </p>
                </div>
              </section>

              {/* Section 10: Contact Details */}
              <section id="contact-info" className="scroll-mt-28">
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#1a3d2e] font-black border-b border-gray-100 pb-2 mb-4">
                  <span className="en">10. Contact Details</span>
                  <span className="ta tamil-text text-xl font-bold">10. தொடர்பு முகவரி</span>
                </h2>
                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="en">
                    For support, general inquiries, or clarification regarding these Terms, please write to us at:
                  </p>
                  <p className="ta tamil-text text-base">
                    இந்த விதிமுறைகள் குறித்த சந்தேகங்கள் அல்லது பொதுவான கேள்விகளுக்கு எங்களை இங்கு தொடர்பு கொள்ளவும்:
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
