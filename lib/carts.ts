import { getAllCarts, getCartById } from "./db";

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
  condition?: string;
  pricePerMonth?: number;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  uniqueCode?: string | null;
  ownerId?: string | null;
  // Sale support
  isForRent?: boolean;
  isForSale?: boolean;
  salePrice?: number | null;
  negotiable?: boolean;
}

export const filters = [
  { en: "All", ta: "அனைத்தும்" },
  { en: "With Store", ta: "அடுப்பு இருக்கு" },
  { en: "With Roof", ta: "மேல் கவர்" },
  { en: "Ice Cream", ta: "ஐஸ் கிரீம்" },
  { en: "Tea Stall", ta: "டீ கடை" },
];

const DESCRIPTION_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  "insulated cold container box built-in. eye-catching yellow dome roof. suitable for ice cream or kulfi business.": {
    en: "Insulated cold container box built-in. Eye-catching yellow dome roof. Suitable for ice cream or kulfi business.",
    ta: "உள்ளமைக்கப்பட்ட குளிரூட்டப்பட்ட பெட்டி வசதி கொண்டது. கண்கவர் மஞ்சள் நிற வட்டக் கூரை வடிவமைப்பு. ஐஸ் கிரீம் அல்லது குல்ஃபி வியாபாரத்திற்கு மிகவும் ஏற்றது."
  },
  "premium chinese fast food cart with reinforced steel frame and dual high-pressure burners.": {
    en: "Premium Chinese fast food cart with reinforced steel frame and dual high-pressure burners.",
    ta: "வலுவூட்டப்பட்ட இரும்பு சட்டகம் மற்றும் இரண்டு அதிவேக அடுப்புகள் கொண்ட பிரீமியம் சைனீஸ் ஃபாஸ்ட் புட் வண்டி."
  },
  "elite fast food cart with double stove and stainless storage shelves. great for tiffin center or chinese fast food.": {
    en: "Elite fast food cart with double stove and stainless storage shelves. Great for tiffin center or Chinese fast food.",
    ta: "இரட்டை அடுப்பு மற்றும் ஸ்டெயின்லெஸ் ஸ்டீல் அலமாரிகள் கொண்ட சிறந்த ஃபாஸ்ட் புட் வண்டி. டிபன் சென்டர் அல்லது சைனீஸ் உணவகம் நடத்த சிறந்தது."
  },
  "aluminium frame food cart with heavy-duty metal roof. side flaps can close completely and be locked.": {
    en: "Aluminium frame food cart with heavy-duty metal roof. Side flaps can close completely and be locked.",
    ta: "அலுமினியம் சட்டகம் மற்றும் உறுதியான உலோகக் கூரை கொண்டது. பக்கவாட்டு கதவுகளை முழுமையாக மூடி பூட்டிக் கொள்ளலாம்."
  },
  "standard food cart with display cabinets and shelving. ideal for dry snacks, bakery items, or small street shops.": {
    en: "Standard food cart with display cabinets and shelving. Ideal for dry snacks, bakery items, or small street shops.",
    ta: "டிஸ்ப்ளே கேபினட்கள் மற்றும் அலமாரிகள் கொண்ட நிலையான உணவு வண்டி. ஸ்நாக்ஸ், பேக்கரி பொருட்கள் அல்லது சிறிய தெருவோர கடைகளுக்கு உகந்தது."
  },
  "full stainless steel tea and coffee station. comes with gas connection slot, wash basin, and wide front counter.": {
    en: "Full stainless steel tea and coffee station. Comes with gas connection slot, wash basin, and wide front counter.",
    ta: "முழு ஸ்டெயின்லெஸ் ஸ்டீலால் ஆன டீ மற்றும் காபி ஸ்டேஷன். கேஸ் இணைப்பு வசதி, வாஷ் பேசின் மற்றும் அகலமான முன் கவுண்டர் கொண்டது."
  },
  "movable juice and snack cart with protective vinyl canopy roof. highly mobile and weather resistant.": {
    en: "Movable juice and snack cart with protective vinyl canopy roof. Highly mobile and weather resistant.",
    ta: "பாதுகாப்பான வினைல் கூரையுடன் கூடிய நகர்த்தக்கூடிய ஜூஸ் மற்றும் ஸ்நாக்ஸ் வண்டி. எளிதில் நகர்த்தக்கூடியது மற்றும் அனைத்து தட்பவெப்ப நிலைக்கும் ஏற்றது."
  },
  "self-listed cart": {
    en: "Self-listed cart",
    ta: "சுயவிவரப் பதிவு செய்யப்பட்ட வண்டி"
  }
};

export function mapDbCartToCart(item: any): Cart {
  let typeArray: string[] = [];
  if (Array.isArray(item.type)) {
    typeArray = item.type;
  } else if (typeof item.type === "string") {
    typeArray = [item.type];
  }

  const typeStr = typeArray.join(", ").toLowerCase();
  const hasStove = typeStr.includes("stove") || typeStr.includes("store");
  const hasRoof = typeStr.includes("roof") || typeStr.includes("cover");
  const isIceCream = typeStr.includes("ice cream") || typeStr.includes("icecream");
  const isTea = typeStr.includes("tea") || typeStr.includes("coffee");

  let categoryEn = "Tea Stall";
  let nameTa = "தேநீர் வண்டி";

  if (hasStove) {
    categoryEn = "With Store";
    nameTa = "அடுப்புடன் கூடிய வண்டி";
  } else if (hasRoof) {
    categoryEn = "With Roof";
    nameTa = "அலுமினியம் வண்டி";
  } else if (isIceCream) {
    categoryEn = "Ice Cream";
    nameTa = "ஐஸ் கிரீம் வண்டி";
  } else if (isTea) {
    categoryEn = "Tea Stall";
    nameTa = "தேநீர் வண்டி";
  } else if (typeArray.length > 0) {
    categoryEn = typeArray[0];
    nameTa = item.name_ta || item.nameTa || "உணவு வண்டி";
  }

  const nameEn = item.name_en || item.nameEn || categoryEn;
  const nameTaFinal = item.name_ta || item.nameTa || nameTa;

  const size = item.size || "5ft x 3.5ft";
  const weight = item.weight || "100kg";
  const stove = item.stove_type || "None";
  const condition = item.condition || "Used - Good";

  const pricePerDay = Number(item.price_per_day) || Number(item.price_per_month) || 80;

  const rawDesc = item.description || "";
  const cleanDesc = rawDesc.trim().toLowerCase();

  let descriptionEn = rawDesc;
  let descriptionTa = rawDesc;

  const translation = DESCRIPTION_TRANSLATIONS[cleanDesc];
  if (translation) {
    descriptionEn = translation.en;
    descriptionTa = translation.ta;
  }

  return {
    id: item.id,
    nameEn: nameEn,
    nameTa: nameTaFinal,
    type: typeArray,
    pricePerDay: pricePerDay,
    depositAmount: Number(item.deposit_amount) || Number(item.depositAmount) || 2000,
    available: item.status === "live" || item.available === true,
    availableCount: Number(item.available_count) || Number(item.availableCount) || 1,
    city: Array.isArray(item.city) ? item.city : [item.city || "Coimbatore"],
    featuresEn: Array.isArray(item.features_en) ? item.features_en : (Array.isArray(item.featuresEn) ? item.featuresEn : [
      `Size: ${size}`,
      `Weight: ${weight}`,
      `Stove Type: ${stove}`,
      `Condition: ${condition}`
    ]),
    featuresTa: Array.isArray(item.features_ta) ? item.features_ta : (Array.isArray(item.featuresTa) ? item.featuresTa : [
      `அளவு: ${size}`,
      `எடை: ${weight}`,
      `அடுப்பு: ${stove}`,
      `வண்டியின் நிலை: ${condition}`
    ]),
    images: Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : 
            (Array.isArray(item.images) && item.images.length > 0 ? item.images : ["/carts/covered-premium-cart/photo-1.webp"]),
    whatsappMessageTa: item.whatsapp_message_ta || item.whatsappMessageTa || `வணக்கம், நான் ${nameTaFinal} (வண்டி ஐடி: ${item.unique_code || item.uniqueCode || item.id}) வாடகைக்கு எடுக்க விரும்புகிறேன்.`,
    descriptionEn: descriptionEn || "Self-listed cart",
    descriptionTa: descriptionTa || "சுயவிவரப் பதிவு செய்யப்பட்ட வண்டி",
    condition: condition,
    pricePerMonth: pricePerDay * 30,
    latitude: Number(item.latitude) || 11.0168,
    longitude: Number(item.longitude) || 76.9558,
    verified: item.verified || false,
    uniqueCode: item.unique_code || item.uniqueCode || null,
    ownerId: item.owner_id || item.ownerId || null,
    isForRent: item.is_for_rent !== undefined ? item.is_for_rent : true,
    isForSale: item.is_for_sale || false,
    salePrice: item.sale_price ? Number(item.sale_price) : null,
    negotiable: item.negotiable || false
  };
}

// Empty — all cart data comes exclusively from the database (Supabase)
export const carts: Cart[] = [];

export async function getCarts(): Promise<Cart[]> {
  try {
    const dbCarts = await getAllCarts();
    return dbCarts.map(mapDbCartToCart);
  } catch (err) {
    console.error("Failed to query carts in getCarts mapping:", err);
    return [];
  }
}

export async function getCart(id: string): Promise<Cart | null> {
  try {
    const dbCart = await getCartById(id);
    if (!dbCart) return null;
    return mapDbCartToCart(dbCart);
  } catch (err) {
    console.error(`Failed to query cart ${id} in getCart mapping:`, err);
    return null;
  }
}