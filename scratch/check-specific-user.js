const path = require('path');
const fs = require('fs');
const { createClient } = require('c:\\Users\\muthu\\Websites\\nammathalluvandi.in-v2\\node_modules\\@supabase\\supabase-js');

const envPath = 'c:\\Users\\muthu\\Websites\\nammathalluvandi.in-v2\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\n]+)["']?/);

const supabaseUrl = urlMatch[1];
const supabaseAnonKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const targetId = '47f97871-37f0-4f5b-9283-a462c44bdcdd';
  
  const { data: pData, error: pError } = await supabase.from('profiles').select('*').eq('id', targetId);
  console.log("Profile check:", pData, pError);

  const { data: rData, error: rError } = await supabase.from('user_roles').select('*').eq('user_id', targetId);
  console.log("User roles check:", rData, rError);

  const { data: vData, error: vError } = await supabase.from('vendor_profiles').select('*').eq('id', targetId);
  console.log("Vendor profile check:", vData, vError);

  const { data: cData, error: cError } = await supabase.from('carts').select('*').eq('owner_id', targetId);
  console.log("Carts check:", cData, cError);
}

run();
