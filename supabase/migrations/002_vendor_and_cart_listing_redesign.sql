-- ============================================================
-- Vendor Profile + Cart Listing Redesign
-- Run this in your Supabase SQL Editor (or as a migration)
-- Adds columns needed by the redesigned /vendor/register and
-- /publish pages. Existing columns (shop_name, business_category,
-- phone, address, upi, gst on vendor_profiles; type, weight,
-- description, price_per_day on carts) are kept as-is for
-- backward compatibility with already-approved vendors/listings.
-- ============================================================

-- 1. VENDOR PROFILES — new intake fields
ALTER TABLE vendor_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS area TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS cart_count TEXT,      -- '1' | '2-3' | '4-5' | '5+'
  ADD COLUMN IF NOT EXISTS about_text TEXT;

-- status is a free-text column (no CHECK constraint) so the new
-- 'pending_review' value the redesigned page writes just works
-- alongside the existing 'pending' | 'approved' | 'rejected' values.

-- 2. CARTS — new listing fields
ALTER TABLE carts
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS min_rental_period TEXT,  -- 'daily' | 'weekly' | '1_month' | '3_months'
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS equipment TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS area TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT;

-- owner_id (-> profiles) is kept as the source of truth for
-- ownership/RLS; vendor_id is populated alongside it purely so the
-- "Listing as" vendor card can join straight to vendor_profiles.

-- 3. STORAGE — vendor profile photo bucket
-- (the existing "carts" bucket, created previously outside SQL, is
-- reused for cart photos — no new bucket needed there)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-profiles', 'vendor-profiles', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read access to vendor profile photos'
  ) THEN
    CREATE POLICY "Public read access to vendor profile photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'vendor-profiles');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload their vendor profile photo'
  ) THEN
    CREATE POLICY "Authenticated users can upload their vendor profile photo"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'vendor-profiles');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated users can update their vendor profile photo'
  ) THEN
    CREATE POLICY "Authenticated users can update their vendor profile photo"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'vendor-profiles');
  END IF;
END $$;
