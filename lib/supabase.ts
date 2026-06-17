import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isDbConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  !supabaseUrl.includes("your-project") && 
  !supabaseAnonKey.includes("your-supabase-anon-key") &&
  supabaseUrl !== "" &&
  supabaseAnonKey !== "";

if (!isDbConfigured) {
  console.warn("Supabase credentials are not configured. Bypassing database operations and using local static fallback.");
}

// Initialize with valid format dummy values if not configured, to prevent startup crashes.
export const supabase = createClient(
  isDbConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isDbConfigured ? supabaseAnonKey : "placeholder-key"
);
