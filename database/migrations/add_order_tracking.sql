-- Migration: Add order tracking statuses and history
-- This migration expands order statuses and adds order status history

-- Step 1: Update order status constraint to include new statuses
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    
    -- Add new constraint with expanded statuses
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'));
    
    -- Update default status to 'pending' for new orders
    ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
END $$;

-- Step 2: Create order_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Step 3: Add tracking_number field to orders (optional, for shipping tracking)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(255);
    END IF;
END $$;

-- Step 4: Add shipping_date and delivery_date fields
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'shipping_date'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'delivery_date'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 5: Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, updated_by, notes)
        VALUES (NEW.id, NEW.status, NEW.user_id, 
            'Status changed from ' || COALESCE(OLD.status, 'N/A') || ' to ' || NEW.status);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to log status changes
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION log_order_status_change();

-- Step 7: Enable RLS for order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order history" ON order_status_history;
DROP POLICY IF EXISTS "Admin can view all order history" ON order_status_history;
DROP POLICY IF EXISTS "Allow insert into order status history" ON order_status_history;

CREATE POLICY "Users can view own order history" ON order_status_history
    FOR SELECT
    USING (true);

CREATE POLICY "Admin can view all order history" ON order_status_history
    FOR SELECT
    USING (true);

-- Allow inserts into order_status_history (used by triggers and application code)
-- Since we use custom auth, we allow all inserts - authorization is handled at app level
CREATE POLICY "Allow insert into order status history" ON order_status_history
    FOR INSERT
    WITH CHECK (true);

-- Step 8: Add UPDATE policy for orders table (allows admin to update order status)
DROP POLICY IF EXISTS "Admin can update orders" ON orders;

CREATE POLICY "Admin can update orders" ON orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Note: Since we use custom authentication, RLS policies checking auth.uid() won't work
-- Authorization is handled at the application level, so we allow all updates
-- The "Admin can update orders" policy above handles this

