// data/sale-carts.ts

export interface SaleCart {
  id: string;
  nameEn: string;
  type: string;
  price: number;
  condition: string; // "New" | "Used - Very Good" | "Used - Good"
  location: string;
  descriptionEn?: string;
  features?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  negotiable?: boolean;
}

// Temporary static sample data.
// Later this can be replaced with a real Supabase table (e.g. is_for_sale = true carts).
const SALE_CARTS: SaleCart[] = [
  {
    id: "sale-001",
    nameEn: "Tea & Coffee Cart - Stainless Steel",
    type: "Tea & Coffee",
    price: 35000,
    condition: "Used - Very Good",
    location: "Coimbatore",
    descriptionEn: "Full stainless steel tea and coffee station with gas connection slot and wide front counter.",
    features: ["Stainless Steel Body", "Gas Slot", "Wash Basin"],
    images: ["/carts/covered-premium-cart/photo-1.webp"],
    latitude: 11.0168,
    longitude: 76.9558,
    verified: true,
    negotiable: true,
  },
  {
    id: "sale-002",
    nameEn: "Ice Cream Cart - Insulated Box",
    type: "Ice Cream",
    price: 42000,
    condition: "New",
    location: "Tiruppur",
    descriptionEn: "Insulated cold container box built-in with eye-catching yellow dome roof.",
    features: ["Insulated Box", "Dome Roof", "Ice Cream Ready"],
    images: ["/carts/covered-premium-cart/photo-1.webp"],
    latitude: 11.1085,
    longitude: 77.3411,
    verified: false,
    negotiable: false,
  },
  {
    id: "sale-003",
    nameEn: "Fast Food Cart - Chinese Setup",
    type: "With Store",
    price: 55000,
    condition: "Used - Good",
    location: "Coimbatore",
    descriptionEn: "Premium Chinese fast food cart with reinforced steel frame and dual high-pressure burners.",
    features: ["Reinforced Frame", "Dual Burner", "Storage Shelves"],
    images: ["/carts/covered-premium-cart/photo-1.webp"],
    latitude: 11.02,
    longitude: 76.96,
    verified: true,
    negotiable: true,
  },
];

export async function getSaleCarts(): Promise<SaleCart[]> {
  // Static data for now — no backend/payment system per PRD.
  // Swap this out later for a real DB query (e.g. getAllCarts().filter(isForSale)).
  return SALE_CARTS;
}