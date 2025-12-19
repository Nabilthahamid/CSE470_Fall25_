-- Migration: Add cost_price column to products table
-- Run this script in your Supabase SQL Editor if you have an existing database

-- Add cost_price column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0 CHECK (cost_price >= 0);

-- Update existing products to have cost_price = 0 if they don't have one
UPDATE public.products 
SET cost_price = 0 
WHERE cost_price IS NULL;
