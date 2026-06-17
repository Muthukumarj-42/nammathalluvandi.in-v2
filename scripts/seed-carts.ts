import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// 1. Read environment variables from .env.local
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);
    
    if (urlMatch && urlMatch[1] && !supabaseUrl) {
      supabaseUrl = urlMatch[1];
    }
    if (keyMatch && keyMatch[1] && !supabaseAnonKey) {
      supabaseAnonKey = keyMatch[1];
    }
  }
} catch (err) {
  console.error("Error reading .env.local:", err);
}

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project")) {
  console.error("Please configure your actual Supabase URL and Anon Key in .env.local first.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const carts = [
  {
    id: "premium-fast-food-cart",
    name_en: "Wooden Fast Food Cart",
    name_ta: "மரத்தாலான வண்டி",
    type: ["Has Roof", "Fast Food", "No Stove", "Large"],
    price_per_day: 50,
    deposit_amount: 2500,
    available: true,
    available_count: 3,
    city: ["Coimbatore"],
    features_en: [
      "Has Roof Cover",
      "Glass Display Shelf",
      "Large Serving Counter",
      "Suitable for Fast Food & Meals",
    ],
    features_ta: [
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
    whatsapp_message_ta:
      "வணக்கம், நான் மரத்தாலான வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "covered-premium-cart",
    name_en: "Aluminium Cart",
    name_ta: "அலுமினியம் வண்டி",
    type: ["Has Roof", "No Stove", "Open Counter"],
    price_per_day: 70,
    deposit_amount: 3000,
    available: true,
    available_count: 1,
    city: ["Coimbatore"],
    features_en: [
      "Metal Roof Cover",
      "Wide Open Serving Counter",
      "Traditional Spoke Wheels",
    ],
    features_ta: [
      "உலோக மேல் கவர்",
      "அகலமான சர்விங் கவுண்டர்",
      "பாரம்பரிய சக்கரம்",
    ],
    images: [
      "/carts/covered-premium-cart/photo-1.webp",
      "/carts/covered-premium-cart/photo-2.webp",
    ],
    whatsapp_message_ta:
      "வணக்கம், நான் அலுமினியம் வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "mobile-snack-cart",
    name_en: "Steel Cart with Stove",
    name_ta: "அடுப்புடன் கூடிய வண்டி",
    type: ["Has Roof", "Has Stove", "Fast Food", "Premium"],
    price_per_day: 90,
    deposit_amount: 6000,
    available: true,
    available_count: 2,
    city: ["Coimbatore"],
    features_en: [
      "Stainless Steel Body",
      "Glass Display Case",
      "Built-in Stove Burners",
      "Has Roof Cover",
      "Suitable for Frying & Snacks",
    ],
    features_ta: [
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
    whatsapp_message_ta:
      "வணக்கம், நான் அடுப்புடன் கூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "juice-cart",
    name_en: "Large Steel Cart with Stove",
    name_ta: "பெரிய அடுப்புடன் கூடிய வண்டி",
    type: ["has Stove", "has roof", "Fast food", "premium"],
    price_per_day: 130,
    deposit_amount: 10000,
    available: true,
    available_count: 2,
    city: ["Coimbatore"],
    features_en: [
      "Stainless Steel Body",
      "Glass Display Case",
      "Built-in Stove Burners",
      "Has Roof Cover",
      "Suitable for Frying & Snacks",
    ],
    features_ta: [
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
    whatsapp_message_ta:
      "வணக்கம், நான் பெரிய அடுப்புடன் கூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "tea-coffee-cart",
    name_en: "Full Covered Lockable Cart",
    name_ta: "முழு மூடிய பூட்டு வண்டி",
    type: ["No Stove", "Full Covered", "has roof"],
    price_per_day: 90,
    deposit_amount: 5000,
    available: true,
    available_count: 2,
    city: ["Coimbatore"],
    features_en: [
      "Fully Closeable Sides",
      "Lockable for Security",
      "Metal Body with Roof",
      "Compact and Sturdy",
    ],
    features_ta: [
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
    whatsapp_message_ta:
      "வணக்கம், நான் முழு மூடிய பூட்டு வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "starter-cart-without-stove",
    name_en: "Compact Closed Cart",
    name_ta: "சிறிய மூடிய வண்டி",
    type: ["No Stove", "Full Covered", "has roof"],
    price_per_day: 90,
    deposit_amount: 5000,
    available: true,
    available_count: 1,
    city: ["Coimbatore"],
    features_en: [
      "Foldable Flaps Open as Counter",
      "Lockable Storage",
      "Compact Size, Easy to Park",
      "Budget-Friendly Starter Cart",
    ],
    features_ta: [
      "மடக்கும் கதவுகள் கவுண்டராக திறக்கும்",
      "பூட்டு சேமிப்பு வசதி",
      "சிறிய அளவு, நிறுத்த சுலபம்",
      "குறைந்த விலை ஸ்டார்டர் வண்டி",
    ],
    images: [
      "/carts/starter-cart-without-stove/photo-1.webp",
      "/carts/starter-cart-without-stove/photo-2.webp",
    ],
    whatsapp_message_ta:
      "வணக்கம், நான் சிறிய பச்சை மூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
  {
    id: "arched-roof-open-cart",
    name_en: "Compact Cart",
    name_ta: "சிறிய வண்டி",
    type: ["Has Roof", "No Stove", "Open Counter"],
    price_per_day: 120,
    deposit_amount: 2000,
    available: true,
    available_count: 1,
    city: ["Coimbatore"],
    features_en: [
      "Arched GI Metal Roof",
      "Glass Display Panel (Front)",
      "Wide Flat Serving Counter",
      "Open Frame with Display Shelf",
      "Pneumatic Rubber Tyres",
      "Ideal for Snacks, Juice & Beverages",
    ],
    features_ta: [
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
    whatsapp_message_ta:
      "வணக்கம், நான் வளைவு கூரை திறந்த வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.",
  },
];

async function seed() {
  console.log("Seeding carts into Supabase...");
  
  // Clean first or upsert
  const { data, error } = await supabase
    .from("carts")
    .upsert(carts, { onConflict: "id" });
    
  if (error) {
    console.error("Error seeding carts:", error.message);
    console.log("\n--- SQL INSERT BACKUP ---");
    console.log("If your API key does not have write access due to RLS, please run the following SQL in your Supabase SQL Editor:\n");
    generateSql();
  } else {
    console.log("Successfully seeded", carts.length, "carts into the database.");
  }
}

function generateSql() {
  const sqlLines: string[] = [];
  sqlLines.push("INSERT INTO public.carts (id, name_en, name_ta, type, price_per_day, deposit_amount, available, available_count, city, features_en, features_ta, images, whatsapp_message_ta) VALUES");
  
  const valueBlocks = carts.map(c => {
    const formatArray = (arr: string[]) => `ARRAY[${arr.map(s => `'${s.replace(/'/g, "''")}'`).join(", ")}]`;
    return `(
  '${c.id}',
  '${c.name_en.replace(/'/g, "''")}',
  '${c.name_ta.replace(/'/g, "''")}',
  ${formatArray(c.type)},
  ${c.price_per_day},
  ${c.deposit_amount},
  ${c.available},
  ${c.available_count},
  ${formatArray(c.city)},
  ${formatArray(c.features_en)},
  ${formatArray(c.features_ta)},
  ${formatArray(c.images)},
  '${c.whatsapp_message_ta.replace(/'/g, "''")}'
)`;
  });
  
  console.log(sqlLines[0]);
  console.log(valueBlocks.join(",\n") + ";");
}

seed();
