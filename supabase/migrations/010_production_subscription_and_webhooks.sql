-- ============================================================
-- Migration 010: Production-Grade Subscriptions, Payments & Webhooks
-- Run this in your Supabase SQL Editor
-- Completely self-contained and safe for any Supabase project
-- ============================================================

-- 1. Ensure vendor_profiles exists first so there are no dependency errors
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    shop_name TEXT,
    business_category TEXT,
    description TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    profile_photo_url TEXT,
    address TEXT,
    area TEXT,
    district TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create vendor_subscriptions with all production columns
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    vendor_id UUID,
    plan_id TEXT NOT NULL DEFAULT 'basic',
    billing_cycle TEXT NOT NULL DEFAULT '1_month',
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'completed',
    status TEXT DEFAULT 'active',
    max_carts INTEGER NOT NULL DEFAULT 2,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    razorpay_subscription_id TEXT,
    razorpay_order_id TEXT,
    razorpay_customer_id TEXT,
    razorpay_plan_id TEXT,
    total_count INTEGER DEFAULT 0,
    paid_count INTEGER DEFAULT 0,
    payment_method TEXT,
    raw_event_reference JSONB,
    current_start TIMESTAMPTZ,
    current_end TIMESTAMPTZ,
    charge_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    resumed_at TIMESTAMPTZ,
    invoice_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if vendor_subscriptions already existed
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS total_count INTEGER DEFAULT 0;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS paid_count INTEGER DEFAULT 0;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS raw_event_reference JSONB;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS current_start TIMESTAMPTZ;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS current_end TIMESTAMPTZ;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS charge_at TIMESTAMPTZ;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS resumed_at TIMESTAMPTZ;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS invoice_id TEXT;

-- 3. Create subscription_payments table for storing payment transactions
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    vendor_id TEXT,
    subscription_id UUID,
    razorpay_payment_id TEXT UNIQUE NOT NULL,
    razorpay_order_id TEXT,
    razorpay_subscription_id TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,
    payment_method TEXT,
    error_code TEXT,
    error_description TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create webhook_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    razorpay_entity_id TEXT NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    processing_status TEXT DEFAULT 'processed'
);

-- 5. Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_user_id ON public.vendor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_rzp_sub ON public.vendor_subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_rzp_ord ON public.vendor_subscriptions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment_id ON public.subscription_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_entity ON public.webhook_events(razorpay_entity_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 7. Policies for public & authenticated access (avoids RLS blocking server operations)
DROP POLICY IF EXISTS "Allow all access to vendor_profiles" ON public.vendor_profiles;
CREATE POLICY "Allow all access to vendor_profiles"
    ON public.vendor_profiles FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to vendor_subscriptions" ON public.vendor_subscriptions;
CREATE POLICY "Allow all access to vendor_subscriptions"
    ON public.vendor_subscriptions FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to subscription_payments" ON public.subscription_payments;
CREATE POLICY "Allow all access to subscription_payments"
    ON public.subscription_payments FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to webhook_events" ON public.webhook_events;
CREATE POLICY "Allow all access to webhook_events"
    ON public.webhook_events FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
