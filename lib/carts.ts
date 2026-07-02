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

// Static fallback array to maintain compatibility with legacy components (like unused cart-explorer.tsx)
export const carts: Cart[] = [
  {
    id: "premium-fast-food-cart",
    nameEn: "Wooden Fast Food Cart",
    nameTa: "மரத்தாலான வண்டி",
    type: ["With Store"],
    pricePerDay: 80,
    depositAmount: 2000,
    available: true,
    availableCount: 1,
    city: ["Coimbatore"],
    featuresEn: ["Size: 6ft x 4ft", "Weight: 120kg", "Stove Type: Double Stove"],
    featuresTa: ["அளவு: 6ft x 4ft", "எடை: 120kg", "அடுப்பு: Double Stove"],
    images: ["/carts/premium-fast-food-cart-with-stove/photo-1.webp"],
    whatsappMessageTa: "வணக்கம், நான் மரத்தாலான வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
    descriptionEn: "Elite fast food cart with double stove",
    descriptionTa: "அடுப்புடன் கூடிய சிறந்த தள்ளுவண்டி"
  }
];

export async function getCarts(): Promise<Cart[]> {
  try {
    const dbCarts = await getAllCarts();
    if (dbCarts.length === 0) return carts;
    return dbCarts.map(mapDbCartToCart);
  } catch (err) {
    console.error("Failed to query carts in getCarts mapping:", err);
    return carts;
  }
}

export async function getCart(id: string): Promise<Cart | null> {
  try {
    const dbCart = await getCartById(id);
    if (!dbCart) {
      return carts.find(c => c.id === id) || null;
    }
    return mapDbCartToCart(dbCart);
  } catch (err) {
    console.error(`Failed to query cart ${id} in getCart mapping:`, err);
    return carts.find(c => c.id === id) || null;
  }
}
