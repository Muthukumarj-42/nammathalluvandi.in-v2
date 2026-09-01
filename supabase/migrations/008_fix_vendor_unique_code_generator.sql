-- ============================================================
-- Fix Vendor & Cart Unique Code Collision
-- Run this in your Supabase SQL Editor (or as a migration)
-- ============================================================

-- 1. Create a dedicated sequence for vendor unique codes
CREATE SEQUENCE IF NOT EXISTS vendor_unique_code_seq START WITH 1;

-- Synchronize sequence with current maximum existing vendor code
DO $$
DECLARE
  max_vendor_seq INT;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(unique_code, '\D', '', 'g'), '')::INT), 0)
  INTO max_vendor_seq
  FROM public.vendor_profiles;

  IF max_vendor_seq > 0 THEN
    PERFORM setval('vendor_unique_code_seq', max_vendor_seq);
  END IF;
END $$;

-- 2. Self-healing collision-free vendor unique code generator trigger
CREATE OR REPLACE FUNCTION public.generate_vendor_unique_code()
RETURNS TRIGGER AS $$
DECLARE
  candidate_code TEXT;
  code_exists BOOLEAN;
  seq_num INT;
BEGIN
  -- If unique_code is already provided and non-empty, keep it
  IF NEW.unique_code IS NOT NULL AND NEW.unique_code <> '' THEN
    RETURN NEW;
  END IF;

  -- If this is an UPDATE and OLD has a unique_code, preserve it
  IF TG_OP = 'UPDATE' AND OLD.unique_code IS NOT NULL AND OLD.unique_code <> '' THEN
    NEW.unique_code := OLD.unique_code;
    RETURN NEW;
  END IF;

  -- Loop to guarantee an absolutely unique code that does not exist in the table
  LOOP
    seq_num := nextval('vendor_unique_code_seq');
    candidate_code := 'ntv-0' || lpad(seq_num::text, 4, '0');
    
    SELECT EXISTS (
      SELECT 1 FROM public.vendor_profiles WHERE unique_code = candidate_code
    ) INTO code_exists;
    
    IF NOT code_exists THEN
      NEW.unique_code := candidate_code;
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_vendor_unique_code ON public.vendor_profiles;
CREATE TRIGGER trg_generate_vendor_unique_code
  BEFORE INSERT OR UPDATE ON public.vendor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_vendor_unique_code();

-- 3. Also make Cart unique code generator collision-free
CREATE OR REPLACE FUNCTION public.generate_cart_unique_code()
RETURNS TRIGGER AS $$
DECLARE
  rto_val INT;
  candidate_code TEXT;
  code_exists BOOLEAN;
  seq_num INT;
BEGIN
  -- If unique_code is already provided and non-empty, keep it
  IF NEW.unique_code IS NOT NULL AND NEW.unique_code <> '' THEN
    RETURN NEW;
  END IF;

  -- If this is an UPDATE and OLD has a unique_code, preserve it
  IF TG_OP = 'UPDATE' AND OLD.unique_code IS NOT NULL AND OLD.unique_code <> '' THEN
    NEW.unique_code := OLD.unique_code;
    RETURN NEW;
  END IF;

  rto_val := public.get_rto_code(NEW.district);
  
  -- Find next sequence number for this RTO region that does not collide
  SELECT COALESCE(MAX(NULLIF(regexp_replace(substring(unique_code from 7), '\D', '', 'g'), '')::INT), 0) + 1
  INTO seq_num
  FROM public.carts
  WHERE unique_code LIKE 'ntv-' || rto_val || '%';

  LOOP
    candidate_code := 'ntv-' || rto_val || lpad(seq_num::text, 4, '0');
    
    SELECT EXISTS (
      SELECT 1 FROM public.carts WHERE unique_code = candidate_code
    ) INTO code_exists;
    
    IF NOT code_exists THEN
      NEW.unique_code := candidate_code;
      EXIT;
    END IF;
    
    seq_num := seq_num + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_cart_unique_code ON public.carts;
CREATE TRIGGER trg_generate_cart_unique_code
  BEFORE INSERT OR UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_cart_unique_code();
