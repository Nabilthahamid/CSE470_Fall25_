-- Migration: Add brand and specifications fields to products table
-- This migration adds additional product information fields

-- Add brand column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand VARCHAR(255);

-- Add specifications column (can store JSON or text)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS specifications TEXT;

-- Add index on brand for faster searches
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Add index on component_category_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_component_category ON products(component_category_id);

