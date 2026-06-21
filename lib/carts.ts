import { supabase, isDbConfigured } from "./supabase";

export interface Cart {
  id: string;
  nameEn: string;
  nameTa: string;
  type: string[];
  pricePerDay: number;
  depositAmount: number;
  available: boolean;
  availableCount: number;
  city: string[];
  featuresEn: string[];
  featuresTa: string[];
  images: string[];
  whatsappMessageTa: string;
  descriptionEn?: string;
  descriptionTa?: string;
}

export const carts: Cart[] = [
  {
    id: "premium-fast-food-cart",
    nameEn: "Wooden Fast Food Cart",
    nameTa: "மரத்தாலான வண்டி",
    type: ["Has Roof", "Fast Food", "No Stove", "Large"],
    pricePerDay: 50,
    depositAmount: 2500,
    available: true,
    availableCount: 3,
    city: ["Coimbatore"],
    featuresEn: [
      "Has Roof Cover",
      "Glass Display Shelf",
      "Large Serving Counter",
      "Suitable for Fast Food & Meals",
    ],
    featuresTa: [
      "மேல் கவர் இருக்கு",
      "கண்ணாடி டிஸ்பிளே ஷெல்ஃப்",
      "பெரிய சர்விங் கவுண்டர்",
      "ஃபாஸ்ட் புட் & சாப்பாட்டிற்கு ஏற்றது",
    ],
    images: [
      "/carts/premium-fast-food-cart-with-stove/photo-1.webp",
      "/carts/premium-fast-food-cart-with-stove/photo-2.webp",
      "/carts/premium-fast-food-cart-with-stove/photo-3.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் மரத்தாலான வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "covered-premium-cart",
    nameEn: "Aluminium Cart",
    nameTa: "அலுமினியம் வண்டி",
    type: ["Has Roof", "No Stove", "Open Counter"],
    pricePerDay: 70,
    depositAmount: 3000,
    available: true,
    availableCount: 1,
    city: ["Coimbatore"],
    featuresEn: [
      "Metal Roof Cover",
      "Wide Open Serving Counter",
      "Traditional Spoke Wheels",
    ],
    featuresTa: [
      "உலோக மேல் கவர்",
      "அகலமான சர்விங் கவுண்டர்",
      "பாரம்பரிய சக்கரம்",
    ],
    images: [
      "/carts/covered-premium-cart/photo-1.webp",
      "/carts/covered-premium-cart/photo-2.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் அலுமினியம் வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "mobile-snack-cart",
    nameEn: "Steel Cart with Stove",
    nameTa: "அடுப்புடன் கூடிய வண்டி",
    type: ["Has Roof", "Has Stove", "Fast Food", "Premium"],
    pricePerDay: 90,
    depositAmount: 6000,
    available: true,
    availableCount: 2,
    city: ["Coimbatore"],
    featuresEn: [
      "Stainless Steel Body",
      "Glass Display Case",
      "Built-in Stove Burners",
      "Has Roof Cover",
      "Suitable for Frying & Snacks",
    ],
    featuresTa: [
      "ஸ்டெயின்லஸ் ஸ்டீல் உடல்",
      "கண்ணாடி டிஸ்பிளே கேஸ்",
      "உள்ளே அடுப்பு வசதி",
      "மேல் கவர் இருக்கு",
      "வறுக்க & ஸ்நாக்ஸ் விற்க ஏற்றது",
    ],
    images: [
      "/carts/mobile-snack-cart/photo-1.webp",
      "/carts/mobile-snack-cart/photo-2.webp",
      "/carts/mobile-snack-cart/photo-3.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் அடுப்புடன் கூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "juice-cart",
    nameEn: "Large Steel Cart with Stove",
    nameTa: "பெரிய அடுப்புடன் கூடிய வண்டி",
    type: ["has Stove", "has roof", "Fast food", "premium"],
    pricePerDay: 130,
    depositAmount: 10000,
    available: true,
    availableCount: 2,
    city: ["Coimbatore"],
    featuresEn: [
      "Stainless Steel Body",
      "Glass Display Case",
      "Built-in Stove Burners",
      "Has Roof Cover",
      "Suitable for Frying & Snacks",
    ],
    featuresTa: [
      "ஸ்டெயின்லஸ் ஸ்டீல் உடல்",
      "கண்ணாடி டிஸ்பிளே கேஸ்",
      "உள்ளே அடுப்பு வசதி",
      "மேல் கவர் இருக்கு",
      "வறுக்க & ஸ்நாக்ஸ் விற்க ஏற்றது",
    ],
    images: [
      "/carts/juice-cart/photo-1.webp",
      "/carts/juice-cart/photo-2.webp",
      "/carts/juice-cart/photo-3.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் பெரிய அடுப்புடன் கூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "tea-coffee-cart",
    nameEn: "Full Covered Lockable Cart",
    nameTa: "முழு மூடிய பூட்டு வண்டி",
    type: ["No Stove", "Full Covered", "has roof"],
    pricePerDay: 90,
    depositAmount: 5000,
    available: true,
    availableCount: 2,
    city: ["Coimbatore"],
    featuresEn: [
      "Fully Closeable Sides",
      "Lockable for Security",
      "Metal Body with Roof",
      "Compact and Sturdy",
    ],
    featuresTa: [
      "பக்கங்கள் முழுமையாக மூடலாம்",
      "பூட்டி வைக்கும் வசதி",
      "உலோக உடல் கூரையுடன்",
      "சிறிய மற்றும் உறுதியான",
    ],
    images: [
      "/carts/tea-coffee-cart/photo-1.webp",
      "/carts/tea-coffee-cart/photo-2.webp",
      "/carts/tea-coffee-cart/photo-3.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் முழு மூடிய பூட்டு வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "starter-cart-without-stove",
    nameEn: "Compact Closed Cart",
    nameTa: "சிறிய மூடிய வண்டி",
    type: ["No Stove", "Full Covered", "has roof"],
    pricePerDay: 90,
    depositAmount: 5000,
    available: true,
    availableCount: 1,
    city: ["Coimbatore"],
    featuresEn: [
      "Foldable Flaps Open as Counter",
      "Lockable Storage",
      "Compact Size, Easy to Park",
      "Budget-Friendly Starter Cart",
    ],
    featuresTa: [
      "மடக்கும் கதவுகள் கவுண்டராக திறக்கும்",
      "பூட்டு சேமிப்பு வசதி",
      "சிறிய அளவு, நிறுத்த சுலபம்",
      "குறைந்த விலை ஸ்டார்டர் வண்டி",
    ],
    images: [
      "/carts/starter-cart-without-stove/photo-1.webp",
      "/carts/starter-cart-without-stove/photo-2.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் சிறிய பச்சை மூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "arched-roof-open-cart",
    nameEn: "Compact Cart",
    nameTa: "சிறிய வண்டி",
    type: ["Has Roof", "No Stove", "Open Counter"],
    pricePerDay: 120,
    depositAmount: 2000,
    available: true,
    availableCount: 1,
    city: ["Coimbatore"],
    featuresEn: [
      "Arched GI Metal Roof",
      "Glass Display Panel (Front)",
      "Wide Flat Serving Counter",
      "Open Frame with Display Shelf",
      "Pneumatic Rubber Tyres",
      "Ideal for Snacks, Juice & Beverages",
    ],
    featuresTa: [
      "வளைவு உலோக கூரை",
      "கண்ணாடி முன் டிஸ்பிளே பேனல்",
      "அகலமான சர்விங் கவுண்டர்",
      "திறந்த பிரேம் டிஸ்பிளே ஷெல்ஃப்",
      "ரப்பர் டயர் சக்கரம்",
      "ஸ்நாக்ஸ், ஜூஸ் & பானங்களுக்கு ஏற்றது",
    ],
    images: [
      "/carts/arched-roof-open-cart/photo-1.webp",
      "/carts/arched-roof-open-cart/photo-2.webp",
      "/carts/arched-roof-open-cart/photo-3.webp",
    ],
    whatsappMessageTa:
      "வணக்கம், நான் வளைவு கூரை திறந்த வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
];

export const filters = [
  { en: "All", ta: "அனைத்தும்" },
  { en: "Has Stove", ta: "அடுப்பு இருக்கு" },
  { en: "No Stove", ta: "அடுப்பு இல்லை" },
  { en: "Has Roof", ta: "மேல் கவர்" },
  { en: "Full Covered", ta: "முழு மூடியது" },
  { en: "Premium", ta: "பிரீமியம்" },
  { en: "Fast Food", ta: "ஃபாஸ்ட் ஃபுட்" },
];

export async function getCarts(): Promise<Cart[]> {
  if (!isDbConfigured) {
    return carts;
  }
  try {
    const { data, error } = await supabase
      .from("carts")
      .select("*")
      .order("id");

    if (error) {
      console.warn("Supabase fetch error, using static fallback:", error.message);
      return carts;
    }
    if (!data || data.length === 0) {
      return carts;
    }

    return data.map((item: any) => ({
      id: item.id,
      nameEn: item.name_en,
      nameTa: item.name_ta,
      type: item.type || [],
      pricePerDay: Number(item.price_per_day),
      depositAmount: Number(item.deposit_amount),
      available: item.available,
      availableCount: item.available_count,
      city: item.city || [],
      featuresEn: item.features_en || [],
      featuresTa: item.features_ta || [],
      images: item.images || [],
      whatsappMessageTa: item.whatsapp_message_ta || "",
      descriptionEn: item.description_en || "",
      descriptionTa: item.description_ta || "",
    }));
  } catch (err) {
    console.error("Failed to query carts table, using static fallback:", err);
    return carts;
  }
}

export async function getCart(id: string): Promise<Cart | null> {
  if (!isDbConfigured) {
    return carts.find((cart) => cart.id === id) || null;
  }
  try {
    const { data, error } = await supabase
      .from("carts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.warn(`Supabase fetch error for cart ${id}, using static fallback:`, error.message);
      return carts.find((cart) => cart.id === id) || null;
    }
    if (!data) {
      return carts.find((cart) => cart.id === id) || null;
    }

    return {
      id: data.id,
      nameEn: data.name_en,
      nameTa: data.name_ta,
      type: data.type || [],
      pricePerDay: Number(data.price_per_day),
      depositAmount: Number(data.deposit_amount),
      available: data.available,
      availableCount: data.available_count,
      city: data.city || [],
      featuresEn: data.features_en || [],
      featuresTa: data.features_ta || [],
      images: data.images || [],
      whatsappMessageTa: data.whatsapp_message_ta || "",
      descriptionEn: data.description_en || "",
      descriptionTa: data.description_ta || "",
    };
  } catch (err) {
    console.error(`Failed to query cart ${id}, using static fallback:`, err);
    return carts.find((cart) => cart.id === id) || null;
  }
}
