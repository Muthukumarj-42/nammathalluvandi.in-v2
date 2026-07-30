-- 006_create_otp_verifications.sql
-- Create OTP verification table for WhatsApp authentication

CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for quick lookups by phone number and timestamp sorting
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone ON public.otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_created_at ON public.otp_verifications(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Allow public inserts and selects for validation processes
CREATE POLICY "Allow public insert on otp_verifications" ON public.otp_verifications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select on otp_verifications" ON public.otp_verifications FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on otp_verifications" ON public.otp_verifications FOR UPDATE TO public USING (true) WITH CHECK (true);
