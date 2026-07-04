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
}

export const filters = [
  { en: "All", ta: "அனைத்தும்" },
  { en: "With Store", ta: "அடுப்பு இருக்கு" },
  { en: "With Roof", ta: "மேல் கவர்" },
  { en: "Ice Cream", ta: "ஐஸ் கிரீம்" },
  { en: "Tea Stall", ta: "டீ கடை" },
];

function mapDbCartToCart(item: any): Cart {
  const nameTa = 
    item.type === "With Store" ? "அடுப்புடன் கூடிய வண்டி" :
    item.type === "With Roof" ? "அலுமினியம் வண்டி" :
    item.type === "Ice Cream" ? "ஐஸ் கிரீம் வண்டி" : "தேநீர் வண்டி";

  const size = item.size || "5ft x 3ft";
  const weight = item.weight || "100kg";
  const stove = item.stove_type || "None";

  return {
    id: item.id,
    nameEn: item.type,
    nameTa: nameTa,
    type: [item.type],
    pricePerDay: Math.round(Number(item.price_per_month) / 30) || 80,
    depositAmount: 2000,
    available: item.status === "live",
    availableCount: item.status === "live" ? 1 : 0,
    city: ["Coimbatore"],
    featuresEn: [
      `Size: ${size}`,
      `Weight: ${weight}`,
      `Stove Type: ${stove}`,
      item.condition ? `Condition: ${item.condition}` : "Sturdy metal build"
    ],
    featuresTa: [
      `அளவு: ${size}`,
      `எடை: ${weight}`,
      `அடுப்பு: ${stove}`,
      item.condition ? `வண்டியின் நிலை: ${item.condition}` : "உறுதியான கட்டமைப்பு"
    ],
    images: item.photos && item.photos.length > 0 ? item.photos : ["/carts/covered-premium-cart/photo-1.webp"],
    whatsappMessageTa: `வணக்கம், நான் ${nameTa} வாடகைக்கு எடுக்க விரும்புகிறேன்.`,
    descriptionEn: item.description || "",
    descriptionTa: item.description || ""
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
