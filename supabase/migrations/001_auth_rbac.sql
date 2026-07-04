-- ============================================================
-- Thalluvandi Auth + RBAC Schema
-- Run this in your Supabase SQL Editor (or as a migration)
-- ============================================================

-- 1. USER PROFILES (mirrors auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  provider TEXT DEFAULT 'email',       -- 'google' | 'email'
  status TEXT DEFAULT 'active',        -- 'active' | 'suspended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
  ('BUYER',      'Default role for all new users — can browse, wishlist, and order'),
  ('VENDOR',     'Cart owners — can list carts, manage inventory, view bookings'),
  ('ADMIN',      'Platform administrators — can manage users, products, and orders'),
  ('SUPER_ADMIN','Full platform access including role assignment and platform settings')
ON CONFLICT (name) DO NOTHING;

-- 3. USER_ROLES (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- 4. PERMISSIONS (optional but recommended for fine-grained control)
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

INSERT INTO permissions (name) VALUES
  ('VIEW_PRODUCTS'),
  ('BUY_PRODUCTS'),
  ('CREATE_PRODUCTS'),
  ('UPDATE_PRODUCTS'),
  ('DELETE_PRODUCTS'),
  ('VIEW_USERS'),
  ('EDIT_USERS'),
  ('VIEW_ORDERS'),
  ('MANAGE_ORDERS'),
  ('MANAGE_SETTINGS'),
  ('ASSIGN_ROLES')
ON CONFLICT (name) DO NOTHING;

-- 5. ROLE_PERMISSIONS
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 6. VENDOR PROFILES (role-specific extra data)
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  shop_name TEXT,
  business_category TEXT,             -- 'tea_coffee' | 'juice' | 'fast_food' | 'snacks' | 'fruits' | 'others'
  description TEXT,
  phone TEXT,
  address TEXT,
  upi TEXT,
  gst TEXT,
  status TEXT DEFAULT 'pending',      -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Vendor profiles: vendor owners can CRUD their own
CREATE POLICY "Vendors can view own vendor profile"
  ON vendor_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Vendors can insert own vendor profile"
  ON vendor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Vendors can update own vendor profile"
  ON vendor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles: users can view their own roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vendor_profiles_updated_at
  BEFORE UPDATE ON vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (via trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  buyer_role_id INTEGER;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, name, avatar, provider, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.app_metadata->>'provider', 'email'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Assign BUYER role
  SELECT id INTO buyer_role_id FROM public.roles WHERE name = 'BUYER';
  IF buyer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, buyer_role_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires on every new auth.users row
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
