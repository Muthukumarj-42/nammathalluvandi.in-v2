-- Database Schema for Namma Thalluvandi V2
-- Run this in your Supabase SQL Editor

-- 1. Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    type TEXT[] DEFAULT '{}',
    price_per_day NUMERIC NOT NULL,
    deposit_amount NUMERIC NOT NULL,
    available BOOLEAN DEFAULT true,
    available_count INTEGER DEFAULT 1,
    city TEXT[] DEFAULT '{}',
    features_en TEXT[] DEFAULT '{}',
    features_ta TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    whatsapp_message_ta TEXT,
    description_en TEXT,
    description_ta TEXT,
    status TEXT DEFAULT 'live',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to carts
CREATE POLICY "Allow public read access on carts" 
ON public.carts FOR SELECT 
TO public 
USING (true);

-- Allow public insert access to carts (for 'publish' page, pending review)
CREATE POLICY "Allow public insert on carts" 
ON public.carts FOR INSERT 
TO public 
WITH CHECK (true);

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id TEXT REFERENCES public.carts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    duration TEXT,
    details TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to insert bookings
CREATE POLICY "Allow public insert on bookings" 
ON public.bookings FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for contact messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public to insert contact messages
CREATE POLICY "Allow public insert on contact_messages" 
ON public.contact_messages FOR INSERT 
TO public 
WITH CHECK (true);
