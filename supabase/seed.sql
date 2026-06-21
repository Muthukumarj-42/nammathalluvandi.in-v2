-- Seed data for Namma Thalluvandi V2 Carts table
-- Run this in your Supabase SQL Editor AFTER running schema.sql

INSERT INTO public.carts (
    id, name_en, name_ta, type, price_per_day, deposit_amount, 
    available, available_count, city, features_en, features_ta, 
    images, whatsapp_message_ta
) VALUES 
(
    'premium-fast-food-cart', 
    'Wooden Fast Food Cart', 
    'மரத்தாலான வண்டி', 
    ARRAY['Has Roof', 'Fast Food', 'No Stove', 'Large'], 
    50, 
    2500, 
    true, 
    3, 
    ARRAY['Coimbatore'], 
    ARRAY['Has Roof Cover', 'Glass Display Shelf', 'Large Serving Counter', 'Suitable for Fast Food & Meals'], 
    ARRAY['மேல் கவர் இருக்கு', 'கண்ணாடி டிஸ்பிளே ஷெல்ஃப்', 'பெரிய சர்விங் கவுண்டர்', 'ஃபாஸ்ட் புட் & சாப்பாட்டிற்கு ஏற்றது'], 
    ARRAY['/carts/premium-fast-food-cart-with-stove/photo-1.webp', '/carts/premium-fast-food-cart-with-stove/photo-2.webp', '/carts/premium-fast-food-cart-with-stove/photo-3.webp'], 
    'வணக்கம், நான் மரத்தாலான வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
),
(
    'covered-premium-cart', 
    'Aluminium Cart', 
    'அலுமினியம் வண்டி', 
    ARRAY['Has Roof', 'No Stove', 'Open Counter'], 
    70, 
    3000, 
    true, 
    1, 
    ARRAY['Coimbatore'], 
    ARRAY['Metal Roof Cover', 'Wide Open Serving Counter', 'Traditional Spoke Wheels'], 
    ARRAY['உலோக மேல் கவர்', 'அகலமான சர்விங் கவுண்டர்', 'பாரம்பரிய சக்கரம்'], 
    ARRAY['/carts/covered-premium-cart/photo-1.webp', '/carts/covered-premium-cart/photo-2.webp'], 
    'வணக்கம், நான் அலுமினியம் வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
),
(
    'mobile-snack-cart', 
    'Steel Cart with Stove', 
    'அடுப்புடன் கூடிய வண்டி', 
    ARRAY['Has Roof', 'Has Stove', 'Fast Food', 'Premium'], 
    90, 
    6000, 
    true, 
    2, 
    ARRAY['Coimbatore'], 
    ARRAY['Stainless Steel Body', 'Glass Display Case', 'Built-in Stove Burners', 'Has Roof Cover', 'Suitable for Frying & Snacks'], 
    ARRAY['ஸ்டெயின்லஸ் ஸ்டீல் உடல்', 'கண்ணாடி டிஸ்பிளே கேஸ்', 'உள்ளே அடுப்பு வசதி', 'மேல் கவர் இருக்கு', 'வறுக்க & ஸ்நாக்ஸ் விற்க ஏற்றது'], 
    ARRAY['/carts/mobile-snack-cart/photo-1.webp', '/carts/mobile-snack-cart/photo-2.webp', '/carts/mobile-snack-cart/photo-3.webp'], 
    'வணக்கம், நான் அடுப்புடன் கூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
),
(
    'juice-cart', 
    'Large Steel Cart with Stove', 
    'பெரிய அடுப்புடன் கூடிய வண்டி', 
    ARRAY['has Stove', 'has roof', 'Fast food', 'premium'], 
    130, 
    10000, 
    true, 
    2, 
    ARRAY['Coimbatore'], 
    ARRAY['Stainless Steel Body', 'Glass Display Case', 'Built-in Stove Burners', 'Has Roof Cover', 'Suitable for Frying & Snacks'], 
    ARRAY['ஸ்டெயின்லஸ் ஸ்டீல் உடல்', 'கண்ணாடி டிஸ்பிளே கேஸ்', 'உள்ளே அடுப்பு வசதி', 'மேல் கவர் இருக்கு', 'வறுக்க & ஸ்நாக்ஸ் விற்க ஏற்றது'], 
    ARRAY['/carts/juice-cart/photo-1.webp', '/carts/juice-cart/photo-2.webp', '/carts/juice-cart/photo-3.webp'], 
    'வணக்கம், நான் பெரிய அடுப்புடன் கூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
),
(
    'tea-coffee-cart', 
    'Full Covered Lockable Cart', 
    'முழு மூடிய பூட்டு வண்டி', 
    ARRAY['No Stove', 'Full Covered', 'has roof'], 
    90, 
    5000, 
    true, 
    2, 
    ARRAY['Coimbatore'], 
    ARRAY['Fully Closeable Sides', 'Lockable for Security', 'Metal Body with Roof', 'Compact and Sturdy'], 
    ARRAY['பக்கங்கள் முழுமையாக மூடலாம்', 'பூட்டி வைக்கும் வசதி', 'உலோக உடல் கூரையுடன்', 'சிறிய மற்றும் உறுதியான'], 
    ARRAY['/carts/tea-coffee-cart/photo-1.webp', '/carts/tea-coffee-cart/photo-2.webp', '/carts/tea-coffee-cart/photo-3.webp'], 
    'வணக்கம், நான் முழு மூடிய பூட்டு வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
),
(
    'starter-cart-without-stove', 
    'Compact Closed Cart', 
    'சிறிய மூடிய வண்டி', 
    ARRAY['No Stove', 'Full Covered', 'has roof'], 
    90, 
    5000, 
    true, 
    1, 
    ARRAY['Coimbatore'], 
    ARRAY['Foldable Flaps Open as Counter', 'Lockable Storage', 'Compact Size, Easy to Park', 'Budget-Friendly Starter Cart'], 
    ARRAY['மடக்கும் கதவுகள் கவுண்டராக திறக்கும்', 'பூட்டு சேமிப்பு வசதி', 'சிறிய அளவு, நிறுத்த சுலபம்', 'குறைந்த விலை ஸ்டார்டர் வண்டி'], 
    ARRAY['/carts/starter-cart-without-stove/photo-1.webp', '/carts/starter-cart-without-stove/photo-2.webp'], 
    'வணக்கம், நான் சிறிய பச்சை மூடிய வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
),
(
    'arched-roof-open-cart', 
    'Compact Cart', 
    'சிறிய வண்டி', 
    ARRAY['Has Roof', 'No Stove', 'Open Counter'], 
    120, 
    2000, 
    true, 
    1, 
    ARRAY['Coimbatore'], 
    ARRAY['Arched GI Metal Roof', 'Glass Display Panel (Front)', 'Wide Flat Serving Counter', 'Open Frame with Display Shelf', 'Pneumatic Rubber Tyres', 'Ideal for Snacks, Juice & Beverages'], 
    ARRAY['வளைவு உலோக கூரை', 'கண்ணாடி முன் டிஸ்பிளே பேனல்', 'அகலமான சர்விங் கவுண்டர்', 'திறந்த பிரேம் டிஸ்பிளே ஷெல்ஃப்', 'ரப்பர் டயர் சக்கரம்', 'ஸ்நாக்ஸ், ஜூஸ் & பானங்களுக்கு ஏற்றது'], 
    ARRAY['/carts/arched-roof-open-cart/photo-1.webp', '/carts/arched-roof-open-cart/photo-2.webp', '/carts/arched-roof-open-cart/photo-3.webp'], 
    'வணக்கம், நான் வளைவு கூரை திறந்த வண்டி வாடகைக்கு எடுக்க விரும்புகிறேன்.'
)
ON CONFLICT (id) DO NOTHING;
