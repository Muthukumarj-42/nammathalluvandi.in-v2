-- ============================================================
-- Vendor Subscriptions & Listing Limits Schema
-- Run this in your Supabase SQL Editor (or as a migration)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
    plan_id TEXT NOT NULL,                         -- 'basic' | 'growth' | 'pro'
    billing_cycle TEXT NOT NULL,                   -- '1_month' | '3_months'
    amount NUMERIC NOT NULL,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'completed',       -- 'initiated' | 'completed' | 'failed' | 'cancelled' | 'pending'
    status TEXT DEFAULT 'active',                  -- 'active' | 'expired' | 'pending'
    max_carts INTEGER NOT NULL DEFAULT 2,          -- 2 for basic, 5 for growth, 10 for pro
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_user_id ON public.vendor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_expires_at ON public.vendor_subscriptions(expires_at);

-- Enable RLS
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON public.vendor_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
    ON public.vendor_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
    ON public.vendor_subscriptions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Also allow public select if needed for backward compatibility / anon reads
CREATE POLICY "Allow public select on vendor_subscriptions"
    ON public.vendor_subscriptions FOR SELECT
    TO public
    USING (true);
