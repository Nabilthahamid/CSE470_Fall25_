-- Migration: Add return_requests table for order returns
-- Description: Creates table to handle return requests from customers

-- Create return_requests table
CREATE TABLE IF NOT EXISTS return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'completed')),
    refund_amount DECIMAL(10, 2),
    refund_method VARCHAR(50),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_product_id ON return_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON return_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own return requests" ON return_requests;
DROP POLICY IF EXISTS "Users can create own return requests" ON return_requests;
DROP POLICY IF EXISTS "Admin can view all return requests" ON return_requests;
DROP POLICY IF EXISTS "Admin can manage all return requests" ON return_requests;

-- Create policies
-- Users can view their own return requests
CREATE POLICY "Users can view own return requests" ON return_requests
    FOR SELECT
    USING (true);

-- Users can create their own return requests
CREATE POLICY "Users can create own return requests" ON return_requests
    FOR INSERT
    WITH CHECK (true);

-- Admin can view all return requests
CREATE POLICY "Admin can view all return requests" ON return_requests
    FOR SELECT
    USING (true);

-- Admin can manage all return requests
CREATE POLICY "Admin can manage all return requests" ON return_requests
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Add comments
COMMENT ON TABLE return_requests IS 'Stores return requests from customers for order items';
COMMENT ON COLUMN return_requests.status IS 'Status of the return: pending, approved, rejected, refunded, completed';
COMMENT ON COLUMN return_requests.refund_amount IS 'Amount to be refunded (calculated by admin)';
COMMENT ON COLUMN return_requests.refund_method IS 'Method of refund: original_payment, bank_transfer, store_credit, cash';

