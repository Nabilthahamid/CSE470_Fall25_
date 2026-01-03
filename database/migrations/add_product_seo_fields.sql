-- Migration: Add SEO and additional fields to products table
-- This migration adds slug, meta_title, meta_description, tags, related_product_ids, and images columns

-- Add slug column for URL-friendly product URLs
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Add meta_title column for SEO
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);

-- Add meta_description column for SEO
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add tags column as array for product tags
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add related_product_ids column as array for related/upsell products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS related_product_ids TEXT[];

-- Add images column as array for image gallery
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add index on slug for faster lookups and to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

-- Add index on tags using GIN for array searches
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags) WHERE tags IS NOT NULL;

