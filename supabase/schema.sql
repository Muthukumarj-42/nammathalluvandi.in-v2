-- Namma Thalluvandi — V2 Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Custom Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('cv', 'bv', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_status') THEN
        CREATE TYPE cart_status AS ENUM ('pending_review', 'live', 'rented', 'inactive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('sent', 'cv_responded_yes', 'cv_responded_no', 'confirmed', 'completed', 'disputed');
    END IF;
END $$;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert/update on users" ON public.users FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'With Store', 'With Roof', 'Ice Cream', 'Tea Stall'
    condition TEXT NOT NULL, -- e.g., 'Used - Very Good', 'New'
    size TEXT,
    weight TEXT,
    stove_type TEXT,
    price_per_day NUMERIC NOT NULL,
    photos TEXT[] DEFAULT '{}',
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status cart_status DEFAULT 'pending_review' NOT NULL,
    verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on carts" ON public.carts FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on carts" ON public.carts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on carts" ON public.carts FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 4. Bookings Table
CREATE SEQUENCE IF NOT EXISTS booking_code_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE,
    cart_id UUID REFERENCES public.carts(id) ON DELETE SET NULL,
    bv_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cv_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    bv_latitude DOUBLE PRECISION NOT NULL,
    bv_longitude DOUBLE PRECISION NOT NULL,
    status booking_status DEFAULT 'sent' NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    escalation_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to auto-generate booking code (e.g., NTV-0001, NTV-0042)
CREATE OR REPLACE FUNCTION generate_booking_code() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_code IS NULL THEN
        NEW.booking_code := 'NTV-' || lpad(nextval('booking_code_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_generate_booking_code
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_code();

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on bookings" ON public.bookings FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on bookings" ON public.bookings FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 5. WhatsApp Messages (log table)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    direction TEXT NOT NULL, -- 'outbound' or 'inbound'
    recipient_phone TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL, -- 'sent', 'delivered', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select/insert on whatsapp_messages" ON public.whatsapp_messages FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' NOT NULL, -- 'open' or 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select/insert/update on disputes" ON public.disputes FOR ALL TO public USING (true) WITH CHECK (true);
