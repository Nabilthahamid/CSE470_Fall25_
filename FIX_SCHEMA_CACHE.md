# Fix: Supabase Schema Cache Error

## Problem
Error: `Could not find the 'category' column of 'products' in the schema cache`

This happens when Supabase's PostgREST API cache hasn't been refreshed after schema changes.

## Solution

### Option 1: Refresh Schema Cache in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Settings** → **API**
4. Scroll down to find **Schema Cache** section
5. Click **"Reload"** or **"Refresh Schema"** button
6. Wait for the cache to refresh (usually takes a few seconds)

### Option 2: Verify Column Exists and Refresh

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `products` table
3. Verify that the `category` column exists
4. If it doesn't exist:
   - Go to **SQL Editor**
   - Run this SQL:
   ```sql
   ALTER TABLE public.products
   ADD COLUMN IF NOT EXISTS category TEXT;
   ```
5. Then refresh the schema cache (Option 1)

### Option 3: Restart Supabase Project

1. In Supabase Dashboard, go to **Settings** → **General**
2. Scroll to **Danger Zone**
3. Click **"Restart Project"** (this will refresh all caches)

### Option 4: Run Full Schema SQL

If the column still doesn't exist, run the entire `supabase-schema.sql` file again in the SQL Editor. This will:
- Add any missing columns
- Ensure everything is in sync

## After Fixing

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Try adding a product again through the admin dashboard
3. The error should be resolved

