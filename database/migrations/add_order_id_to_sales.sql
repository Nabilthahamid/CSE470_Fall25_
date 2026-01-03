-- Migration: Add order_id to sales table for better tracking
-- This allows us to properly handle cancellations and returns

-- Add order_id column to sales table (nullable, as some sales might not be from orders)
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales(order_id);

-- Add comment
COMMENT ON COLUMN sales.order_id IS 'Reference to the order that created this sale (null for direct sales)';

