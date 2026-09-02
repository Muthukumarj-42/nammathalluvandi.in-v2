const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function check() {
  try {
    const { data: webhooks, error: errW } = await supabase.from('webhook_events').select('*').order('processed_at', { ascending: false }).limit(5);
    console.log('--- Webhook Events ---', errW ? 'ERR: ' + errW.message : JSON.stringify(webhooks, null, 2));

    const { data: payments, error: errP } = await supabase.from('subscription_payments').select('*').order('created_at', { ascending: false }).limit(5);
    console.log('--- Subscription Payments ---', errP ? 'ERR: ' + errP.message : JSON.stringify(payments, null, 2));

    const { data: subs, error: errS } = await supabase.from('vendor_subscriptions').select('*').order('created_at', { ascending: false }).limit(5);
    console.log('--- Vendor Subscriptions ---', errS ? 'ERR: ' + errS.message : JSON.stringify(subs, null, 2));

    const { data: users, error: errU } = await supabase.from('profiles').select('*').limit(5);
    console.log('--- Profiles ---', errU ? 'ERR: ' + errU.message : JSON.stringify(users, null, 2));

    const { data: vendors, error: errV } = await supabase.from('vendor_profiles').select('*').limit(5);
    console.log('--- Vendor Profiles ---', errV ? 'ERR: ' + errV.message : JSON.stringify(vendors, null, 2));
  } catch (e) {
    console.error('Fatal:', e);
  }
}

check();
