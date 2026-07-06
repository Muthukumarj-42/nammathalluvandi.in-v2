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
}

export const filters = [
  { en: "All", ta: "அனைத்தும்" },
  { en: "With Store", ta: "அடுப்பு இருக்கு" },
  { en: "With Roof", ta: "மேல் கவர்" },
  { en: "Ice Cream", ta: "ஐஸ் கிரீம்" },
  { en: "Tea Stall", ta: "டீ கடை" },
];

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
    whatsappMessageTa: item.whatsapp_message_ta || item.whatsappMessageTa || `வணக்கம், நான் ${nameTaFinal} வாடகைக்கு எடுக்க விரும்புகிறேன்.`,
    descriptionEn: item.description_en || item.descriptionEn || item.description || "",
    descriptionTa: item.description_ta || item.descriptionTa || item.description || "",
    condition: condition,
    pricePerMonth: pricePerDay * 30,
    latitude: Number(item.latitude) || 11.0168,
    longitude: Number(item.longitude) || 76.9558,
    verified: item.verified || false
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
