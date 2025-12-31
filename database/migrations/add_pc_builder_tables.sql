-- Migration: Add PC Builder tables
-- This migration adds tables for PC builds and component categories

-- Component categories enum (we'll use a table instead for flexibility)
CREATE TABLE IF NOT EXISTS component_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add component_category_id to products table (nullable, for regular products)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS component_category_id UUID REFERENCES component_categories(id) ON DELETE SET NULL;

-- PC Builds table
CREATE TABLE IF NOT EXISTS pc_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PC Build Components (many-to-many relationship)
CREATE TABLE IF NOT EXISTS pc_build_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID REFERENCES pc_builds(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    component_category_id UUID REFERENCES component_categories(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(build_id, component_category_id)
);

-- Insert default component categories
INSERT INTO component_categories (name, display_name, is_required, display_order) VALUES
    ('cpu', 'CPU', true, 1),
    ('cpu_cooler', 'CPU Cooler', false, 2),
    ('motherboard', 'Motherboard', true, 3),
    ('ram', 'RAM', true, 4),
    ('storage', 'Storage', true, 5),
    ('graphics_card', 'Graphics Card', false, 6),
    ('power_supply', 'Power Supply', false, 7),
    ('casing', 'Casing', false, 8),
    ('monitor', 'Monitor', false, 9),
    ('casing_cooler', 'Casing Cooler', false, 10),
    ('keyboard', 'Keyboard', false, 11),
    ('mouse', 'Mouse', false, 12),
    ('speakers', 'Speakers & Home Theater', false, 13),
    ('headphone', 'Headphone', false, 14),
    ('wifi_adapter', 'WiFi Adapter / LAN Card', false, 15),
    ('antivirus', 'Anti Virus', false, 16),
    ('ups', 'UPS', false, 17)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_component_category ON products(component_category_id);
CREATE INDEX IF NOT EXISTS idx_pc_builds_user_id ON pc_builds(user_id);
CREATE INDEX IF NOT EXISTS idx_pc_build_components_build_id ON pc_build_components(build_id);
CREATE INDEX IF NOT EXISTS idx_pc_build_components_product_id ON pc_build_components(product_id);
CREATE INDEX IF NOT EXISTS idx_pc_build_components_category_id ON pc_build_components(component_category_id);

-- Add updated_at trigger for pc_builds
CREATE OR REPLACE FUNCTION update_pc_builds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pc_builds_updated_at
    BEFORE UPDATE ON pc_builds
    FOR EACH ROW
    EXECUTE FUNCTION update_pc_builds_updated_at();

