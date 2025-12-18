# Database Setup Guide

## Quick Setup Steps

### 1. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:

   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

5. For `DATABASE_URL`:
   - Go to **Settings** → **Database**
   - Scroll to **Connection string** → **URI**
   - Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

### 3. Run the SQL Schema

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

### 4. Verify Setup

Start your dev server:

```bash
npm run dev
```

Visit http://localhost:5173/test-connection to verify all connections are working.

## What the Schema Creates

The SQL script creates:

✅ **profiles** table - User profiles linked to Supabase Auth
✅ **products** table - Product catalog with sample data
✅ **orders** table - Order management
✅ **order_items** table - Order line items
✅ **Indexes** - For better query performance
✅ **Row Level Security (RLS)** - Secure data access
✅ **RLS Policies** - User-specific data permissions

## Sample Products

The schema includes 5 sample products to get you started:

- Classic T-Shirt
- Denim Jeans
- Leather Jacket
- Running Shoes
- Backpack

## Troubleshooting

### "Database connection not available"

Make sure:

1. Your `.env` file exists and has the correct values
2. Your `DATABASE_URL` has the correct password
3. Your Supabase project is running
4. You've restarted your dev server after adding `.env`

### "Failed to create profile"

This is normal if:

- Database isn't set up yet
- Authentication will still work!
- Profiles will be created on first login via hooks

### RLS Policy Errors

If you see RLS policy errors when running the SQL:

1. The `DROP POLICY IF EXISTS` statements will handle existing policies
2. If you still get errors, you can manually drop policies in Supabase Dashboard → Database → Policies

## Next Steps

Once setup is complete:

1. ✅ Try signing up at `/auth/signup`
2. ✅ Check out products at `/products`
3. ✅ Test the cart functionality
4. ✅ Create test orders

Need help? Check the other documentation files:

- `SUPABASE_SETUP.md` - Detailed Supabase configuration
- `SUPABASE_QUICK_START.md` - Quick start guide
- `README.md` - Project overview
