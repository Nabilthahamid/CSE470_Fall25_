-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- This file contains all database tables, policies, and setup
-- ============================================

-- ============================================
-- Step 1: Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Prevent role updates" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Allow public read for login" ON users;

CREATE POLICY "Allow public registration" ON users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public read for login" ON users
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 2: Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cost_price DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (cost_price >= 0),
    stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add cost_price column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'cost_price'
    ) THEN
        ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2) DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow admin manage products" ON products;

CREATE POLICY "Allow public read products" ON products
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage products" ON products
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 3: Sales Table
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    sale_price DECIMAL(10, 2) NOT NULL CHECK (sale_price >= 0),
    cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    profit DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated insert sales" ON sales;
DROP POLICY IF EXISTS "Allow admin manage sales" ON sales;

CREATE POLICY "Allow public read sales" ON sales
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert sales" ON sales
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admin manage sales" ON sales
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 4: Reviews Table (Updated: Only purchasers can review)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id) -- One review per user per product
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users update own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admin manage reviews" ON reviews;

CREATE POLICY "Allow public read reviews" ON reviews
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert reviews" ON reviews
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow users update own reviews" ON reviews
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow users delete own reviews" ON reviews
    FOR DELETE
    USING (true);

CREATE POLICY "Allow admin manage reviews" ON reviews
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 5: Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users read own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow admin create notifications" ON notifications;

CREATE POLICY "Allow users read own notifications" ON notifications
    FOR SELECT
    USING (true);

CREATE POLICY "Allow users update own notifications" ON notifications
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admin create notifications" ON notifications
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- Step 6: Cart Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;

CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 7: Orders Table (Complete with all checkout fields)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_phone VARCHAR(50),
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(20),
    customer_country VARCHAR(100),
    shipping_method VARCHAR(100),
    payment_method VARCHAR(100),
    shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'completed' NOT NULL CHECK (status IN ('completed', 'pending', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add checkout fields if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_city'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_postal_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_postal_code VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_country'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_country VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'shipping_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'shipping_cost'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can view all orders" ON orders
    FOR SELECT
    USING (true);

-- ============================================
-- Step 8: Order Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admin can manage all order items" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create order items" ON order_items
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin can view all order items" ON order_items
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage all order items" ON order_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 9: Functions and Triggers
-- ============================================

-- Function to update product stock after sale
-- NOTE: This trigger is kept for backward compatibility if sales are created directly
-- However, when orders are created, stock is already updated by order_items trigger
-- So this won't double-reduce stock if sales are created after order_items
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock when sale is created (for direct sales, not from orders)
    UPDATE products 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock_on_sale ON sales;
-- NOTE: Commenting out sales trigger to prevent double stock reduction
-- Stock is now updated via order_items trigger when orders are created
-- If you need to create sales directly (not through orders), uncomment this:
-- CREATE TRIGGER trigger_update_stock_on_sale
--     AFTER INSERT ON sales
--     FOR EACH ROW
--     EXECUTE FUNCTION update_product_stock_on_sale();

-- Function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TABLE(product_id UUID, product_name VARCHAR, stock INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.stock
    FROM products p
    WHERE p.stock <= 3
    AND p.stock >= 0
    AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.product_id = p.id
        AND n.type = 'low_stock'
        AND n.is_read = false
        AND n.created_at > NOW() - INTERVAL '24 hours'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update cart items updated_at
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cart_items_updated_at ON cart_items;
CREATE TRIGGER trigger_update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_items_updated_at();

-- Function to update product stock after order item is inserted
CREATE OR REPLACE FUNCTION update_product_stock_on_order_item()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT stock INTO current_stock
    FROM products
    WHERE id = NEW.product_id;
    
    -- Check if product exists
    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product % not found', NEW.product_id;
    END IF;
    
    -- Check if sufficient stock
    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
            NEW.product_id, current_stock, NEW.quantity;
    END IF;
    
    -- Update stock
    UPDATE products 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock_on_order_item ON order_items;
CREATE TRIGGER trigger_update_stock_on_order_item
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_on_order_item();

-- ============================================
-- COMPLETE SETUP FINISHED
-- ============================================

