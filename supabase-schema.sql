-- ============================================================================
-- E-Commerce Database Schema for Supabase
-- ============================================================================
-- This is the SINGLE source of truth for all database schema changes.
-- Always update this file when making schema modifications.
-- Run this file in your Supabase SQL Editor to apply changes.
-- 
-- This script handles:
-- - Creating new schemas (for fresh databases)
-- - Updating existing schemas (fixing column names, adding missing columns)
-- - Syncing existing auth users to profiles table
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Enums
-- ============================================================================

-- Create user_role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create order_status enum
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: Fix Existing Schema Issues (if any)
-- ============================================================================

-- Fix column name mismatch: rename 'mail' to 'email' if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'mail'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'email'
    ) THEN
      ALTER TABLE public.profiles RENAME COLUMN mail TO email;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Create Tables
-- ============================================================================

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ensure role column exists (in case table was created without it)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN role user_role DEFAULT 'user' NOT NULL;
  END IF;
END $$;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2), -- Product cost for profit calculation
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ensure category column exists (in case table was created without it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.products
    ADD COLUMN category TEXT;
  END IF;
END $$;

-- Ensure cost column exists (in case table was created without it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'products'
    AND column_name = 'cost'
  ) THEN
    ALTER TABLE public.products
    ADD COLUMN cost DECIMAL(10, 2);
  END IF;
END $$;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending' NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- ============================================================================
-- STEP 4: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: RLS Policies for profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STEP 7: RLS Policies for products (public read access)
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Service role can manage products" ON products;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 8: RLS Policies for orders
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: RLS Policies for order_items
-- ============================================================================

DROP POLICY IF EXISTS "Users can view items in their orders" ON order_items;
DROP POLICY IF EXISTS "Users can add items to their orders" ON order_items;

CREATE POLICY "Users can view items in their orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to their orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 10: Create Trigger Function for Auto Profile Creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 11: Create Trigger to Auto-Create Profiles on Signup
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 12: Sync Existing Auth Users to Profiles (Optional)
-- ============================================================================
-- This will create profiles for users who already exist in auth.users
-- but don't have profiles yet. Safe to run multiple times.

INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', NULL) as full_name,
  'user' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 13: Add Sample Products (Optional - remove if you want to add manually)
-- ============================================================================

INSERT INTO products (name, slug, description, price, image_url, stock) VALUES
  ('Classic T-Shirt', 'classic-t-shirt', 'Comfortable cotton t-shirt perfect for everyday wear', 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 100),
  ('Denim Jeans', 'denim-jeans', 'Premium denim jeans with a modern fit', 79.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 75),
  ('Leather Jacket', 'leather-jacket', 'Stylish leather jacket for any occasion', 199.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', 30),
  ('Running Shoes', 'running-shoes', 'Lightweight running shoes for maximum comfort', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 60),
  ('Backpack', 'backpack', 'Durable backpack with multiple compartments', 49.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 120)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Verification Queries (Optional - uncomment to verify setup)
-- ============================================================================

-- Check profiles table schema
-- SELECT 
--   column_name, 
--   data_type, 
--   column_default, 
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'profiles'
-- ORDER BY ordinal_position;

-- Check trigger status
-- SELECT 
--   trigger_name,
--   event_object_table,
--   action_statement,
--   action_timing,
--   event_manipulation
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'auth'
--   AND event_object_table = 'users'
--   AND trigger_name = 'on_auth_user_created';

-- Verify user sync
-- SELECT 
--   COUNT(*) as total_auth_users,
--   (SELECT COUNT(*) FROM public.profiles) as total_profiles
-- FROM auth.users;
