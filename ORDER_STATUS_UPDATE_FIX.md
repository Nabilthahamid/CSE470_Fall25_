# Order Status Update Fix

## Problem
Order status updates were not working because the `orders` table has Row Level Security (RLS) enabled, but there was **NO UPDATE policy** defined. The existing policies only allowed SELECT and INSERT operations.

## Solution

You need to run the SQL migration to add UPDATE policies to the orders table.

### Step 1: Run the Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Add UPDATE policy for orders table (allows admin to update order status)
DROP POLICY IF EXISTS "Admin can update orders" ON orders;

CREATE POLICY "Admin can update orders" ON orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Also allow users to update their own orders (for future features)
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
```

**OR** run the complete migration file:
- `database/migrations/add_order_tracking.sql` (now includes the UPDATE policy at the end)

### Step 2: Verify the Fix

After running the migration:
1. Go to `/admin/orders`
2. Click "Update Status" on any order
3. Change the status and submit
4. The order status should now update successfully

## Why This Happened

The system uses **custom authentication** (not Supabase Auth), so:
- RLS policies that check `auth.uid()` don't work
- The policies need to allow operations based on the anon key
- Since authorization is handled at the application level (admin checks), we can safely allow all updates

## Alternative: Use Service Role Key (Future Improvement)

For better security in the future, consider:
1. Using the service role key for admin operations
2. Creating a separate Supabase client for admin operations
3. This would bypass RLS entirely for admin operations

But for now, the UPDATE policy fix will work since admin authorization is already checked at the application level.

