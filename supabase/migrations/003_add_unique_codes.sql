-- 1. Add unique_code column to carts & vendor_profiles if they do not exist
ALTER TABLE public.carts ADD COLUMN IF NOT EXISTS unique_code TEXT UNIQUE;
ALTER TABLE public.vendor_profiles ADD COLUMN IF NOT EXISTS unique_code TEXT UNIQUE;

-- 2. Create RTO code resolver function
CREATE OR REPLACE FUNCTION public.get_rto_code(district TEXT)
RETURNS INT AS $$
DECLARE
  d TEXT;
BEGIN
  IF district IS NULL THEN
    RETURN 99;
  END IF;
  d := lower(trim(district));
  IF d LIKE '%chennai%' THEN RETURN 1;
  ELSIF d LIKE '%coimbatore%' THEN RETURN 37;
  ELSIF d LIKE '%erode%' THEN RETURN 33;
  ELSIF d LIKE '%tiruppur%' OR d LIKE '%tirupur%' THEN RETURN 39;
  ELSIF d LIKE '%salem%' THEN RETURN 27;
  ELSIF d LIKE '%trichy%' OR d LIKE '%tiruchirappalli%' THEN RETURN 45;
  ELSIF d LIKE '%madurai%' THEN RETURN 58;
  ELSIF d LIKE '%thanjavur%' THEN RETURN 49;
  ELSIF d LIKE '%kanchipuram%' THEN RETURN 21;
  ELSIF d LIKE '%vellore%' THEN RETURN 23;
  ELSIF d LIKE '%tiruvannamalai%' THEN RETURN 25;
  ELSIF d LIKE '%villupuram%' THEN RETURN 32;
  ELSIF d LIKE '%cuddalore%' THEN RETURN 31;
  ELSIF d LIKE '%pudukkottai%' THEN RETURN 55;
  ELSIF d LIKE '%tiruvarur%' THEN RETURN 50;
  ELSIF d LIKE '%nagapattinam%' THEN RETURN 51;
  ELSIF d LIKE '%krishnagiri%' THEN RETURN 24;
  ELSIF d LIKE '%dharmapuri%' THEN RETURN 29;
  ELSIF d LIKE '%namakkal%' THEN RETURN 28;
  ELSIF d LIKE '%tirunelveli%' THEN RETURN 72;
  ELSIF d LIKE '%thoothukudi%' THEN RETURN 69;
  ELSIF d LIKE '%tindivanam%' THEN RETURN 16;
  ELSIF d LIKE '%chengalpattu%' THEN RETURN 19;
  ELSIF d LIKE '%thiruvallur%' OR d LIKE '%tiruvallur%' THEN RETURN 20;
  ELSIF d LIKE '%ulundurpet%' THEN RETURN 15;
  ELSIF d LIKE '%tambaram%' THEN RETURN 11;
  ELSIF d LIKE '%poonamallee%' THEN RETURN 12;
  ELSIF d LIKE '%ambattur%' THEN RETURN 13;
  ELSIF d LIKE '%sholinganallur%' THEN RETURN 14;
  ELSIF d LIKE '%redhills%' THEN RETURN 18;
  ELSIF d LIKE '%meenambakkam%' THEN RETURN 22;
  ELSE RETURN 99;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Create vendor unique code generator
CREATE OR REPLACE FUNCTION public.generate_vendor_unique_code()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INT;
BEGIN
  IF NEW.unique_code IS NULL THEN
    SELECT COALESCE(COUNT(*), 0) + 1 INTO seq_num FROM public.vendor_profiles;
    NEW.unique_code := 'ntv-0' || lpad(seq_num::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_vendor_unique_code ON public.vendor_profiles;
CREATE TRIGGER trg_generate_vendor_unique_code
  BEFORE INSERT ON public.vendor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_vendor_unique_code();

-- 4. Create cart unique code generator
CREATE OR REPLACE FUNCTION public.generate_cart_unique_code()
RETURNS TRIGGER AS $$
DECLARE
  rto_val INT;
  seq_num INT;
BEGIN
  IF NEW.unique_code IS NULL THEN
    rto_val := public.get_rto_code(NEW.district);
    SELECT COALESCE(COUNT(*), 0) + 1 INTO seq_num 
      FROM public.carts 
      WHERE unique_code LIKE 'ntv-' || rto_val || '%';
    NEW.unique_code := 'ntv-' || rto_val || lpad(seq_num::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_cart_unique_code ON public.carts;
CREATE TRIGGER trg_generate_cart_unique_code
  BEFORE INSERT ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_cart_unique_code();

-- 5. Backfill existing data
DO $$
DECLARE
  v RECORD;
  i INT := 1;
BEGIN
  FOR v IN SELECT id FROM public.vendor_profiles WHERE unique_code IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.vendor_profiles 
      SET unique_code = 'ntv-0' || lpad(i::text, 4, '0') 
      WHERE id = v.id;
    i := i + 1;
  END LOOP;
END $$;

DO $$
DECLARE
  c RECORD;
  rto_val INT;
  seq_num INT;
BEGIN
  FOR c IN SELECT id, district, created_at FROM public.carts WHERE unique_code IS NULL ORDER BY created_at ASC LOOP
    rto_val := public.get_rto_code(c.district);
    SELECT COALESCE(COUNT(*), 0) + 1 INTO seq_num 
      FROM public.carts 
      WHERE unique_code LIKE 'ntv-' || rto_val || '%' AND id <> c.id;
    UPDATE public.carts 
      SET unique_code = 'ntv-' || rto_val || lpad(seq_num::text, 4, '0') 
      WHERE id = c.id;
  END LOOP;
END $$;
