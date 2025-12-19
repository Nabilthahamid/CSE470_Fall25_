-- ============================================================================
-- TinyShop Database Schema
-- ============================================================================
-- This file contains the complete database schema for the TinyShop application
-- Run this script in your Supabase SQL Editor to set up the database
--
-- IMPORTANT: Run the ENTIRE script from beginning to end
-- Do not run parts of it separately, as tables must exist before policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLEANUP (For re-running the script)
-- ============================================================================
-- Drop existing triggers and functions if they exist
-- This allows the script to be run multiple times safely

-- Drop trigger on auth.users (this table always exists in Supabase)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop triggers on public tables (only if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
    END IF;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Profiles Table
-- Stores user profile information linked to Supabase Auth users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Products Table
-- Stores product information for the e-commerce store
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10, 2) DEFAULT 0 CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Orders Table
-- Stores order information
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Order Items Table
-- Stores individual items within an order
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock) WHERE stock > 0;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for profiles
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-update updated_at for products
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-update updated_at for orders
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
        'user'
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- IMPORTANT: Tables must exist before creating policies
-- If you get "relation does not exist" errors, make sure tables were created successfully

-- Verify tables exist before proceeding
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RAISE EXCEPTION 'Table public.profiles does not exist. Please run the TABLES section first.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        RAISE EXCEPTION 'Table public.products does not exist. Please run the TABLES section first.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        RAISE EXCEPTION 'Table public.orders does not exist. Please run the TABLES section first.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
        RAISE EXCEPTION 'Table public.order_items does not exist. Please run the TABLES section first.';
    END IF;
END $$;

-- Drop existing policies if they exist (for re-running the script)

-- Drop policies on profiles (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "System can insert profiles on signup" ON public.profiles;
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
    END IF;
END $$;

-- Drop policies on products (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
        DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
        DROP POLICY IF EXISTS "Admins can update products" ON public.products;
        DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
    END IF;
END $$;

-- Drop policies on orders (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
        DROP POLICY IF EXISTS "Users can update own pending orders" ON public.orders;
        DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
        DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
    END IF;
END $$;

-- Drop policies on order_items (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
        DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
        DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
        DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
    END IF;
END $$;

-- Enable RLS on all tables (only if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Profiles Policies
-- ----------------------------------------------------------------------------

-- Allow system to insert profiles (for signup trigger)
-- The trigger function uses SECURITY DEFINER, but this policy ensures it works
CREATE POLICY "System can insert profiles on signup"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- Products Policies
-- ----------------------------------------------------------------------------

-- Everyone can view products
CREATE POLICY "Anyone can view products"
    ON public.products
    FOR SELECT
    USING (true);

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update products
CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- Orders Policies
-- ----------------------------------------------------------------------------

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders
CREATE POLICY "Users can update own pending orders"
    ON public.orders
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
    ON public.orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- Order Items Policies
-- ----------------------------------------------------------------------------

-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items"
    ON public.order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- SAMPLE DATA (Optional - Comment out in production)
-- ============================================================================

-- Insert sample admin user (you'll need to create the auth user first)
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--     'YOUR_ADMIN_USER_ID_HERE',
--     'admin@tinyshop.com',
--     'Admin User',
--     'admin'
-- );

-- Insert sample products
-- INSERT INTO public.products (name, slug, description, price, stock, image_url)
-- VALUES
--     (
--         'Sample Product 1',
--         'sample-product-1',
--         'This is a sample product description',
--         29.99,
--         10,
--         'https://via.placeholder.com/400'
--     ),
--     (
--         'Sample Product 2',
--         'sample-product-2',
--         'Another sample product description',
--         49.99,
--         5,
--         'https://via.placeholder.com/400'
--     );

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. This script is idempotent - it can be run multiple times safely
--    - Existing triggers are dropped before being recreated
--    - Tables use IF NOT EXISTS to prevent errors
--    - Functions use CREATE OR REPLACE
--
-- 2. After running this script, make sure to:
--    - Create your first admin user in Supabase Auth
--    - Update the admin user's role in the profiles table manually if needed
--    - Set up your environment variables in .env file
--
-- 3. To create an admin user:
--    - Sign up a user through your app
--    - Then run: UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
--
-- 4. The handle_new_user() function automatically creates a profile when a user signs up
--    with the default role of 'user'
--
-- 5. All prices are stored as DECIMAL(10, 2) for precision
--
-- 6. RLS policies ensure data security:
--    - Users can only see/modify their own data
--    - Admins have full access
--    - Products are publicly viewable but only admins can modify
--
-- 7. If you get errors about existing triggers/functions:
--    - The cleanup section at the top should handle this
--    - If errors persist, manually drop the trigger: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--
-- 8. If you get "relation does not exist" errors:
--    - Make sure you're running the ENTIRE script from the beginning
--    - Tables must be created before policies can reference them
--    - If tables don't exist, run the TABLES section first, then the rest
--    - Check that all CREATE TABLE statements executed successfully
-- ============================================================================
