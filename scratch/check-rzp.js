const fs = require('fs');
const Razorpay = require('razorpay');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

console.log('Using Key ID:', env.RAZORPAY_KEY_ID);
const rzp = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET
});

async function run() {
  try {
    console.log('Fetching payments from Razorpay...');
    const payments = await rzp.payments.all({ count: 5 });
    console.log('--- Latest Payments ---');
    payments.items.forEach(p => console.log({
      id: p.id,
      amount: p.amount / 100,
      status: p.status,
      email: p.email,
      contact: p.contact,
      created_at: new Date(p.created_at * 1000).toISOString(),
      notes: p.notes,
      order_id: p.order_id,
      invoice_id: p.invoice_id
    }));

    console.log('\nFetching subscriptions from Razorpay...');
    const subs = await rzp.subscriptions.all({ count: 5 });
    console.log('--- Latest Subscriptions ---');
    subs.items.forEach(s => console.log({
      id: s.id,
      plan_id: s.plan_id,
      status: s.status,
      paid_count: s.paid_count,
      current_start: s.current_start ? new Date(s.current_start * 1000).toISOString() : null,
      current_end: s.current_end ? new Date(s.current_end * 1000).toISOString() : null,
      notes: s.notes,
      short_url: s.short_url
    }));
  } catch (err) {
    console.error('Razorpay API error:', err);
  }
}

run();
