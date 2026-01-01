-- ============================================
-- DISCOUNTS AND DISCOUNT USAGE TABLES
-- Run this file in Supabase SQL Editor
-- ============================================

-- ============================================
-- Discounts Table
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

-- Create indexes for discounts
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_type ON discounts(discount_type);
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date);

-- Enable Row Level Security for discounts
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read discounts" ON discounts;
DROP POLICY IF EXISTS "Allow admin manage discounts" ON discounts;

-- Create policies for discounts
CREATE POLICY "Allow public read discounts" ON discounts
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin manage discounts" ON discounts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Discount Usage Table (for tracking usage)
-- ============================================
CREATE TABLE IF NOT EXISTS discount_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL CHECK (discount_amount >= 0),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for discount_usage
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_id ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order_id ON discount_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_used_at ON discount_usage(used_at DESC);

-- Enable Row Level Security for discount_usage
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Allow authenticated insert discount usage" ON discount_usage;
DROP POLICY IF EXISTS "Allow admin manage discount usage" ON discount_usage;

-- Create policies for discount_usage
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

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update discounts updated_at timestamp
CREATE OR REPLACE FUNCTION update_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_discounts_updated_at ON discounts;
CREATE TRIGGER trigger_update_discounts_updated_at
    BEFORE UPDATE ON discounts
    FOR EACH ROW
    EXECUTE FUNCTION update_discounts_updated_at();

