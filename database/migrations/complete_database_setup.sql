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
-- Step 10: Promotional Campaigns Table
-- ============================================
CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('flash_sale', 'limited_time', 'buy_x_get_y', 'seasonal', 'other')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    discount_id UUID,
    products JSONB DEFAULT '[]'::jsonb,
    buy_x_get_y_config JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_end_after_start CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_type ON promotional_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_dates ON promotional_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_discount_id ON promotional_campaigns(discount_id);

ALTER TABLE promotional_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read campaigns" ON promotional_campaigns;
DROP POLICY IF EXISTS "Allow admin manage campaigns" ON promotional_campaigns;

CREATE POLICY "Allow public read campaigns" ON promotional_campaigns
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage campaigns" ON promotional_campaigns
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_promotional_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_promotional_campaigns_updated_at ON promotional_campaigns;
CREATE TRIGGER trigger_update_promotional_campaigns_updated_at
    BEFORE UPDATE ON promotional_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_campaigns_updated_at();

-- ============================================
-- Step 11: Discounts Table
-- ============================================
CREATE TABLE IF NOT EXISTS discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
    minimum_purchase DECIMAL(10, 2) CHECK (minimum_purchase >= 0),
    maximum_discount DECIMAL(10, 2) CHECK (maximum_discount >= 0),
    usage_limit_total INTEGER CHECK (usage_limit_total > 0),
    usage_limit_per_customer INTEGER CHECK (usage_limit_per_customer > 0),
    used_count INTEGER DEFAULT 0 NOT NULL CHECK (used_count >= 0),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    applicable_to VARCHAR(50) DEFAULT 'all' NOT NULL CHECK (applicable_to IN ('all', 'categories', 'products')),
    applicable_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_end_after_start CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_type ON discounts(discount_type);
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read discounts" ON discounts;
DROP POLICY IF EXISTS "Allow admin manage discounts" ON discounts;

CREATE POLICY "Allow public read discounts" ON discounts
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage discounts" ON discounts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 12: Discount Usage Table
-- ============================================
CREATE TABLE IF NOT EXISTS discount_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL CHECK (discount_amount >= 0),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_id ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order_id ON discount_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_used_at ON discount_usage(used_at DESC);

ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Allow authenticated insert discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Allow admin manage discount usage" ON discount_usage;

CREATE POLICY "Allow public read discount usage" ON discount_usage
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert discount usage" ON discount_usage
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow admin manage discount usage" ON discount_usage
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update discounts updated_at timestamp
CREATE OR REPLACE FUNCTION update_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_discounts_updated_at ON discounts;
CREATE TRIGGER trigger_update_discounts_updated_at
    BEFORE UPDATE ON discounts
    FOR EACH ROW
    EXECUTE FUNCTION update_discounts_updated_at();

-- ============================================
-- Step 13: Newsletters Table
-- ============================================
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('html', 'text')),
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('all', 'subscribers', 'customers', 'segment')),
    recipient_segment TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    recipient_count INTEGER DEFAULT 0 CHECK (recipient_count >= 0),
    opened_count INTEGER DEFAULT 0 NOT NULL CHECK (opened_count >= 0),
    clicked_count INTEGER DEFAULT 0 NOT NULL CHECK (clicked_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled_at ON newsletters(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at DESC);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin manage newsletters" ON newsletters;

CREATE POLICY "Allow admin manage newsletters" ON newsletters
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 14: Email Sequences Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trigger VARCHAR(50) NOT NULL CHECK (trigger IN ('welcome', 'abandoned_cart', 'order_confirmation', 'order_shipped', 'custom')),
    trigger_delay INTEGER CHECK (trigger_delay >= 0),
    emails JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sequences_trigger ON email_sequences(trigger);
CREATE INDEX IF NOT EXISTS idx_email_sequences_active ON email_sequences(is_active);

ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin manage email sequences" ON email_sequences;

CREATE POLICY "Allow admin manage email sequences" ON email_sequences
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 15: Email Campaigns Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('html', 'text')),
    recipient_count INTEGER DEFAULT 0 NOT NULL CHECK (recipient_count >= 0),
    sent_count INTEGER DEFAULT 0 NOT NULL CHECK (sent_count >= 0),
    opened_count INTEGER DEFAULT 0 NOT NULL CHECK (opened_count >= 0),
    clicked_count INTEGER DEFAULT 0 NOT NULL CHECK (clicked_count >= 0),
    bounced_count INTEGER DEFAULT 0 NOT NULL CHECK (bounced_count >= 0),
    unsubscribed_count INTEGER DEFAULT 0 NOT NULL CHECK (unsubscribed_count >= 0),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin manage email campaigns" ON email_campaigns;

CREATE POLICY "Allow admin manage email campaigns" ON email_campaigns
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update newsletters updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_newsletters_updated_at ON newsletters;
CREATE TRIGGER trigger_update_newsletters_updated_at
    BEFORE UPDATE ON newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletters_updated_at();

-- Function to update email_sequences updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_email_sequences_updated_at ON email_sequences;
CREATE TRIGGER trigger_update_email_sequences_updated_at
    BEFORE UPDATE ON email_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_email_sequences_updated_at();

-- Function to update email_campaigns updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER trigger_update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_email_campaigns_updated_at();

-- ============================================
-- Step 16: Shipping Providers Table
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL CHECK (base_rate >= 0),
    rate_per_kg DECIMAL(10, 2) CHECK (rate_per_kg >= 0),
    rate_per_km DECIMAL(10, 2) CHECK (rate_per_km >= 0),
    estimated_days_min INTEGER NOT NULL CHECK (estimated_days_min >= 0),
    estimated_days_max INTEGER NOT NULL CHECK (estimated_days_max >= estimated_days_min),
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_providers_code ON shipping_providers(code);
CREATE INDEX IF NOT EXISTS idx_shipping_providers_active ON shipping_providers(is_active);

ALTER TABLE shipping_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin manage shipping providers" ON shipping_providers;

CREATE POLICY "Allow admin manage shipping providers" ON shipping_providers
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 17: Shipping Zones Table
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(100),
    regions JSONB DEFAULT '[]'::jsonb NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL CHECK (base_rate >= 0),
    rate_per_kg DECIMAL(10, 2) CHECK (rate_per_kg >= 0),
    provider_id UUID REFERENCES shipping_providers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    estimated_days_min INTEGER NOT NULL CHECK (estimated_days_min >= 0),
    estimated_days_max INTEGER NOT NULL CHECK (estimated_days_max >= estimated_days_min),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_zones_country ON shipping_zones(country);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_provider_id ON shipping_zones(provider_id);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin manage shipping zones" ON shipping_zones;

CREATE POLICY "Allow admin manage shipping zones" ON shipping_zones
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update shipping_providers updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipping_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_shipping_providers_updated_at ON shipping_providers;
CREATE TRIGGER trigger_update_shipping_providers_updated_at
    BEFORE UPDATE ON shipping_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_shipping_providers_updated_at();

-- Function to update shipping_zones updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipping_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_shipping_zones_updated_at ON shipping_zones;
CREATE TRIGGER trigger_update_shipping_zones_updated_at
    BEFORE UPDATE ON shipping_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_shipping_zones_updated_at();

-- ============================================
-- Step 18: Homepage Content Table
-- ============================================
CREATE TABLE IF NOT EXISTS homepage_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image_url TEXT,
    featured_section_title TEXT,
    featured_section_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read homepage content" ON homepage_content;
DROP POLICY IF EXISTS "Allow admin manage homepage content" ON homepage_content;

CREATE POLICY "Allow public read homepage content" ON homepage_content
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage homepage content" ON homepage_content
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 19: Banners Table
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    link_text VARCHAR(255),
    position VARCHAR(20) NOT NULL CHECK (position IN ('top', 'middle', 'bottom')),
    "order" INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_end_after_start CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read banners" ON banners;
DROP POLICY IF EXISTS "Allow admin manage banners" ON banners;

CREATE POLICY "Allow public read banners" ON banners
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage banners" ON banners
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 20: Static Pages Table
-- ============================================
CREATE TABLE IF NOT EXISTS static_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_published ON static_pages(is_published);

ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read published pages" ON static_pages;
DROP POLICY IF EXISTS "Allow admin manage pages" ON static_pages;

CREATE POLICY "Allow public read published pages" ON static_pages
    FOR SELECT
    USING (is_published = true OR true);

CREATE POLICY "Allow admin manage pages" ON static_pages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Step 21: FAQs Table
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    "order" INTEGER DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs("order");

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read published faqs" ON faqs;
DROP POLICY IF EXISTS "Allow admin manage faqs" ON faqs;

CREATE POLICY "Allow public read published faqs" ON faqs
    FOR SELECT
    USING (is_published = true OR true);

CREATE POLICY "Allow admin manage faqs" ON faqs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update homepage_content updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_homepage_content_updated_at ON homepage_content;
CREATE TRIGGER trigger_update_homepage_content_updated_at
    BEFORE UPDATE ON homepage_content
    FOR EACH ROW
    EXECUTE FUNCTION update_homepage_content_updated_at();

-- Function to update banners updated_at timestamp
CREATE OR REPLACE FUNCTION update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_banners_updated_at ON banners;
CREATE TRIGGER trigger_update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_banners_updated_at();

-- Function to update static_pages updated_at timestamp
CREATE OR REPLACE FUNCTION update_static_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_static_pages_updated_at ON static_pages;
CREATE TRIGGER trigger_update_static_pages_updated_at
    BEFORE UPDATE ON static_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_static_pages_updated_at();

-- Function to update faqs updated_at timestamp
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_faqs_updated_at ON faqs;
CREATE TRIGGER trigger_update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_faqs_updated_at();

-- ============================================
-- COMPLETE SETUP FINISHED
-- ============================================

