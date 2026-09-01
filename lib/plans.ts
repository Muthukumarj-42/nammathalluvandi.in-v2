// lib/plans.ts
// Reusable configuration for Namma Thalluvandi cart listing plans

export type PlanTier = "basic" | "growth" | "pro";
export type BillingCycle = "1_month" | "3_months";

export interface PlanPricing {
  price: number;
  durationDays: number;
  perMonthLabelEn: string;
  perMonthLabelTa: string;
  savingsNoteEn?: string;
  savingsNoteTa?: string;
}

export interface ListingPlan {
  id: PlanTier;
  nameEn: string;
  nameTa: string;
  badgeEn: string;
  badgeTa: string;
  color: "green" | "blue" | "purple";
  accentHex: string;
  borderHex: string;
  bgHex: string;
  isRecommended?: boolean;
  maxCarts: number;
  subscriptionButtonId: string;
  pricing: Record<BillingCycle, PlanPricing>;
  featuresEn: string[];
  featuresTa: string[];
}

export const LISTING_PLANS: Record<PlanTier, ListingPlan> = {
  basic: {
    id: "basic",
    nameEn: "Basic",
    nameTa: "அடிப்படை",
    badgeEn: "🟢 BASIC",
    badgeTa: "🟢 அடிப்படை",
    color: "green",
    accentHex: "#10b981",
    borderHex: "#10b981/30",
    bgHex: "rgba(16, 185, 129, 0.05)",
    maxCarts: 2,
    subscriptionButtonId: "pl_TWnbGO0xqCqylLa",
    pricing: {
      "1_month": {
        price: 99,
        durationDays: 30,
        perMonthLabelEn: "₹99/month",
        perMonthLabelTa: "₹99/மாதம்",
      },
      "3_months": {
        price: 249,
        durationDays: 90,
        perMonthLabelEn: "₹249/3 months",
        perMonthLabelTa: "₹249/3 மாதங்கள்",
        savingsNoteEn: "Save ₹48",
        savingsNoteTa: "₹48 சேமிக்கவும்",
      },
    },
    featuresEn: [
      "Up to 2 food carts",
      "Basic photos, details & location",
      "Standard visibility on explore page",
      "Direct customer enquiries",
      "Edit listing details anytime",
      "Availability status display",
      "Direct WhatsApp enquiry from website",
      "Google Maps location added through NammaThalluvandi",
      "Location-based enquiry selection",
      "Basic listing support",
    ],
    featuresTa: [
      "2 தள்ளுவண்டிகள் வரை பட்டியலிடலாம்",
      "அடிப்படை புகைப்படங்கள், விவரங்கள் & இருப்பிடம்",
      "தேடல் பக்கத்தில் நிலையான பார்வை",
      "நேரடி வாடிக்கையாளர் விசாரணைகள்",
      "எப்போது வேண்டுமானாலும் விவரங்களை மாற்றலாம்",
      "கிடைக்கும் நிலை (Availability) காட்சி",
      "இணையதளத்தில் இருந்து நேரடி வாட்ஸ்அப் விசாரணை",
      "நம்ம தள்ளுவண்டி மூலம் கூகுள் மேப்ஸ் இருப்பிடம் சேர்ப்பு",
      "இருப்பிடம் சார்ந்த விசாரணை தேர்வு",
      "அடிப்படை பட்டியல் ஆதரவு",
    ],
  },
  growth: {
    id: "growth",
    nameEn: "Growth",
    nameTa: "வளர்ச்சி",
    badgeEn: "🔵 GROWTH",
    badgeTa: "🔵 வளர்ச்சி",
    color: "blue",
    accentHex: "#3b82f6",
    borderHex: "#3b82f6/40",
    bgHex: "rgba(59, 130, 246, 0.08)",
    isRecommended: true,
    maxCarts: 5,
    subscriptionButtonId: "pl_TWnfRDNwSuckjv",
    pricing: {
      "1_month": {
        price: 249,
        durationDays: 30,
        perMonthLabelEn: "₹249/month",
        perMonthLabelTa: "₹249/மாதம்",
      },
      "3_months": {
        price: 599,
        durationDays: 90,
        perMonthLabelEn: "₹599/3 months",
        perMonthLabelTa: "₹599/3 மாதங்கள்",
        savingsNoteEn: "Save ₹148 (Popular)",
        savingsNoteTa: "₹148 சேமிக்கவும் (பிரபலம்)",
      },
    },
    featuresEn: [
      "Everything in Basic",
      "Up to 5 food carts",
      "Higher search visibility (Top Rankings)",
      "Featured listing badge & highlight",
      "More photos & enhanced cart/owner profile",
      "Priority enquiry handling",
      "Dedicated WhatsApp enquiry support",
      "Monthly performance summary",
      "Better location-based priority",
      "Social media visibility when applicable",
      "Customer requirement notifications",
      "Featured listing during selected NTV campaigns",
    ],
    featuresTa: [
      "அடிப்படை திட்டத்தின் அனைத்து நன்மைகள்",
      "5 தள்ளுவண்டிகள் வரை பட்டியலிடலாம்",
      "உயர் தேடல் பார்வை (முன்னுரிமை இடம்)",
      "சிறப்பு பட்டியல் (Featured Listing) பேட்ஜ்",
      "அதிக புகைப்படங்கள் & சிறந்த உரிமையாளர் சுயவிவரம்",
      "முன்னுரிமை விசாரணை கையாளுதல்",
      "பிரத்யேக வாட்ஸ்அப் விசாரணை ஆதரவு",
      "மாதாந்திர செயல்திறன் அறிக்கை",
      "சிறந்த இருப்பிட முன்னுரிமை",
      "சமூக ஊடக விளம்பர வாய்ப்புகள்",
      "வாடிக்கையாளர் தேவை உடனடி அறிவிப்புகள்",
      "NTV விளம்பர பிரச்சாரங்களில் சிறப்பு இடம்",
    ],
  },
  pro: {
    id: "pro",
    nameEn: "Pro / Business",
    nameTa: "ப்ரோ / வணிகம்",
    badgeEn: "🟣 PRO / BUSINESS",
    badgeTa: "🟣 ப்ரோ / வணிகம்",
    color: "purple",
    accentHex: "#a855f7",
    borderHex: "#a855f7/40",
    bgHex: "rgba(168, 85, 247, 0.08)",
    maxCarts: 10,
    subscriptionButtonId: "pl_TWniVIcizCDktA",
    pricing: {
      "1_month": {
        price: 459,
        durationDays: 30,
        perMonthLabelEn: "₹459/month",
        perMonthLabelTa: "₹459/மாதம்",
      },
      "3_months": {
        price: 999,
        durationDays: 90,
        perMonthLabelEn: "₹999/3 months",
        perMonthLabelTa: "₹999/3 மாதங்கள்",
        savingsNoteEn: "Save ₹378 (Best Value)",
        savingsNoteTa: "₹378 சேமிக்கவும் (சிறந்த மதிப்பு)",
      },
    },
    featuresEn: [
      "Everything in Growth",
      "Up to 10 food carts",
      "Priority placement across platform",
      "Featured / Verified Business profile",
      "Manufacturer / Business showcase card",
      "Priority location selection & filtering",
      "Promotional/social media marketing boost",
      "1 AI promotional video for the listing currently",
      "Instant customer requirement notifications",
      "Advanced business/listing visibility",
      "24/7 Priority support hotline",
      "Extra visibility during all NTV festive campaigns",
    ],
    featuresTa: [
      "வளர்ச்சி திட்டத்தின் அனைத்து நன்மைகள்",
      "10 தள்ளுவண்டிகள் வரை பட்டியலிடலாம்",
      "தளத்தில் உச்ச முன்னுரிமை இடம்",
      "சரிபார்க்கப்பட்ட வணிக சுயவிவரம் (Verified)",
      "உற்பத்தியாளர் / வணிக சிறப்பு காட்சி",
      "முன்னுரிமை இருப்பிட தேர்வு & வடிகட்டுதல்",
      "சமூக ஊடக விளம்பர ஊக்கம்",
      "உங்கள் வண்டிக்கான 1 AI விளம்பர வீடியோ",
      "உடனடி வாடிக்கையாளர் தேவை அறிவிப்புகள்",
      "மேம்பட்ட வணிக & பட்டியல் தெரிவுநிலை",
      "24/7 முன்னுரிமை தொலைபேசி ஆதரவு",
      "அனைத்து NTV பண்டிகை பிரச்சாரங்களிலும் கூடுதல் தெரிவுநிலை",
    ],
  },
};

export const PLANS_LIST = Object.values(LISTING_PLANS);

export function getPlan(id: string): ListingPlan {
  return LISTING_PLANS[id as PlanTier] || LISTING_PLANS.basic;
}

export function getPlanPricing(planId: string, cycle: BillingCycle): PlanPricing {
  const plan = getPlan(planId);
  return plan.pricing[cycle] || plan.pricing["1_month"];
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
