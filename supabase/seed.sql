-- Seed data for Namma Thalluvandi V2 database
-- Run this in your Supabase SQL Editor AFTER running schema.sql

-- 1. Seed Users (Admins, CVs, BVs)
-- Note: Using hardcoded UUIDs so references remain consistent across multiple runs
INSERT INTO public.users (id, role, name, phone) VALUES
-- Admin (Muthu)
('a1111111-1111-1111-1111-111111111111', 'admin', 'Muthu Admin', '918838292849'),
-- Cart Vendors (CV)
('c2222222-2222-2222-2222-222222222222', 'cv', 'Nagaraj Thalluvandi', '919876543210'),
('c3333333-3333-3333-3333-333333333333', 'cv', 'Karthik Carts', '919876543211'),
('c4444444-4444-4444-4444-444444444444', 'cv', 'Senthil Carts Tiruppur', '919876543212'),
-- Business Vendors (BV)
('b5555555-5555-5555-5555-555555555555', 'bv', 'Ramesh Snacks', '919876543213'),
('b6666666-6666-6666-6666-666666666666', 'bv', 'Suresh Coffee', '919876543214')
ON CONFLICT (phone) DO NOTHING;

-- 2. Seed Carts
INSERT INTO public.carts (
    id, owner_id, type, condition, size, weight, stove_type, 
    price_per_month, photos, description, latitude, longitude, status, verified
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'c2222222-2222-2222-2222-222222222222',
    'With Store',
    'New',
    '6ft x 4ft',
    '120kg',
    'Double Burner High-Pressure Stove',
    2500,
    ARRAY['/carts/premium-fast-food-cart-with-stove/photo-1.webp', '/carts/premium-fast-food-cart-with-stove/photo-2.webp'],
    'Elite fast food cart with double stove and stainless storage shelves. Great for tiffin center or Chinese fast food.',
    11.0028, -- Ondipudur, Coimbatore
    77.0347,
    'live',
    true
),
(
    'e0000000-0000-0000-0000-000000000002',
    'c2222222-2222-2222-2222-222222222222',
    'With Roof',
    'Used - Very Good',
    '5ft x 3.5ft',
    '95kg',
    'None',
    1800,
    ARRAY['/carts/covered-premium-cart/photo-1.webp'],
    'Aluminium frame food cart with heavy-duty metal roof. Side flaps can close completely and be locked.',
    11.0183, -- Gandhipuram, Coimbatore
    76.9693,
    'live',
    true
),
(
    'e0000000-0000-0000-0000-000000000003',
    'c3333333-3333-3333-3333-333333333333',
    'Ice Cream',
    'New',
    '4ft x 3ft',
    '80kg',
    'None',
    2200,
    ARRAY['/carts/mobile-snack-cart/photo-1.webp'],
    'Insulated cold container box built-in. Eye-catching yellow dome roof. Suitable for ice cream or kulfi business.',
    11.0267, -- Peelamedu, Coimbatore
    77.0089,
    'live',
    true
),
(
    'e0000000-0000-0000-0000-000000000004',
    'c4444444-4444-4444-4444-444444444444',
    'Tea Stall',
    'Used - Good',
    '6ft x 4.5ft',
    '150kg',
    'Single Burner Commercial Stove',
    3000,
    ARRAY['/carts/juice-cart/photo-1.webp'],
    'Full stainless steel tea and coffee station. Comes with gas connection slot, wash basin, and wide front counter.',
    11.1085, -- Tiruppur Junction
    77.3411,
    'live',
    true
),
(
    'e0000000-0000-0000-0000-000000000005',
    'c3333333-3333-3333-3333-333333333333',
    'With Store',
    'Used - Good',
    '5ft x 3ft',
    '110kg',
    'Double Stove',
    2400,
    ARRAY['/carts/tea-coffee-cart/photo-1.webp'],
    'Compact fast food cart with double burner stove and side glass panels. Needs a minor shelf repair.',
    11.0006, -- Singanallur, Coimbatore
    77.0222,
    'pending_review',
    false
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Bookings
INSERT INTO public.bookings (
    id, booking_code, cart_id, bv_id, cv_id, bv_latitude, bv_longitude, status, assigned_at, escalation_count
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'NTV-0001',
    'e0000000-0000-0000-0000-000000000001',
    'b5555555-5555-5555-5555-555555555555',
    'c2222222-2222-2222-2222-222222222222',
    11.0030,
    77.0350,
    'confirmed',
    timezone('utc'::text, now() - interval '2 hours'),
    0
),
(
    'd0000000-0000-0000-0000-000000000002',
    'NTV-0002',
    'e0000000-0000-0000-0000-000000000002',
    'b6666666-6666-6666-6666-666666666666',
    'c2222222-2222-2222-2222-222222222222',
    11.0200,
    76.9700,
    'sent',
    timezone('utc'::text, now() - interval '10 minutes'),
    0
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed WhatsApp Messages
INSERT INTO public.whatsapp_messages (
    id, booking_id, direction, recipient_phone, message_body, status
) VALUES
(
    'w0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'outbound',
    '919876543210',
    'Namma Thalluvandi V2: New Booking request NTV-0002. Price: ₹1800/month. Customer Ramesh needs it near Gandhipuram. Reply YES or NO.',
    'delivered'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Disputes
INSERT INTO public.disputes (
    id, booking_id, reported_by, description, status
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'b5555555-5555-5555-5555-555555555555',
    'Stove burner knob is missing. Renter requested a replacement or discount.',
    'open'
)
ON CONFLICT (id) DO NOTHING;
