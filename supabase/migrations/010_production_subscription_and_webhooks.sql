-- ============================================================
-- Migration 010: Production-Grade Subscriptions, Payments & Webhooks
-- ============================================================

-- 1. Ensure vendor_subscriptions table has all required tracking columns
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
    plan_id TEXT NOT NULL,                         -- 'basic' | 'growth' | 'pro'
    billing_cycle TEXT NOT NULL,                   -- '1_month' | '3_months'
    amount NUMERIC NOT NULL,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'completed',       -- 'initiated' | 'completed' | 'failed' | 'cancelled' | 'pending'
    status TEXT DEFAULT 'active',                  -- 'active' | 'expired' | 'pending' | 'cancelled' | 'halted'
    max_carts INTEGER NOT NULL DEFAULT 2,          -- 2 for basic, 5 for growth, 10 for pro
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already existed
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS total_count INTEGER DEFAULT 0;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS paid_count INTEGER DEFAULT 0;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS raw_event_reference JSONB;

-- 2. Create subscription_payments table for storing each payment transaction
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.vendor_subscriptions(id) ON DELETE SET NULL,
    razorpay_payment_id TEXT UNIQUE NOT NULL,
    razorpay_order_id TEXT,
    razorpay_subscription_id TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,                          -- 'captured' | 'failed' | 'authorized' | 'refunded'
    payment_method TEXT,                           -- 'upi' | 'card' | 'netbanking' | 'wallet'
    error_code TEXT,
    error_description TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create webhook_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    razorpay_entity_id TEXT NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    processing_status TEXT DEFAULT 'processed'     -- 'processed' | 'ignored' | 'failed'
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_user_id ON public.vendor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_rzp_sub ON public.vendor_subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON public.subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment_id ON public.subscription_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_entity ON public.webhook_events(razorpay_entity_id);

-- Enable RLS
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated reads and writes for server actions and webhook workers
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
