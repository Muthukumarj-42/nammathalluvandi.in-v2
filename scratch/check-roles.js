const path = require('path');
const fs = require('fs');
const { createClient } = require('c:\\Users\\muthu\\Websites\\nammathalluvandi.in-v2\\node_modules\\@supabase\\supabase-js');

const envPath = 'c:\\Users\\muthu\\Websites\\nammathalluvandi.in-v2\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);

if (!urlMatch || !keyMatch) {
  console.error("Could not find Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseAnonKey = keyMatch[1];

console.log("PARSED CREDENTIALS:");
console.log("URL:", supabaseUrl);
console.log("KEY PREVIEW:", supabaseAnonKey.substring(0, 15) + "...");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking profiles...");
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) console.error("Profiles error:", pError);
  else console.log("Profiles:", profiles);

  console.log("\nChecking user_roles...");
  const { data: userRoles, error: rError } = await supabase.from('user_roles').select('*, roles(*)');
  if (rError) console.error("User roles error:", rError);
  else console.log("User roles:", userRoles);

  console.log("\nChecking vendor_profiles...");
  const { data: vendorProfiles, error: vError } = await supabase.from('vendor_profiles').select('*');
  if (vError) console.error("Vendor profiles error:", vError);
  else console.log("Vendor profiles:", vendorProfiles);
}

run();
