-- Migration: Add coupon fields to orders table
-- Description: Adds coupon_code, coupon_id, and discount_amount columns to support discount functionality

-- Add coupon-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES discounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add index on coupon_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);

-- Add comment to columns
COMMENT ON COLUMN orders.coupon_code IS 'The coupon code used for this order';
COMMENT ON COLUMN orders.coupon_id IS 'Reference to the discount/coupon used';
COMMENT ON COLUMN orders.discount_amount IS 'The discount amount applied to this order';

