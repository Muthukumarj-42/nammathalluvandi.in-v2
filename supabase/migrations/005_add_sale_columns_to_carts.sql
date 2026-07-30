-- 005_add_sale_columns_to_carts.sql
-- Add columns to support listing carts for rent, sale, or both

ALTER TABLE public.carts 
  ADD COLUMN IF NOT EXISTS is_for_rent BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS sale_price NUMERIC,
  ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT false NOT NULL;

-- Allow price_per_day to be nullable, in case a cart is listed ONLY for sale
ALTER TABLE public.carts ALTER COLUMN price_per_day DROP NOT NULL;
