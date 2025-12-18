# Supabase Connection Guide

This guide will walk you through connecting your SvelteKit application to Supabase.

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Once logged in, click **"New Project"**
5. Fill in the project details:
   - **Name**: Your project name (e.g., "ecommerce-store")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
6. Click **"Create new project"** and wait for it to be set up (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to your project dashboard
2. Click on **"Settings"** (gear icon) in the left sidebar
3. Click on **"API"** under Project Settings

You'll find:
- **Project URL**: Your Supabase project URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
- **anon/public key**: Your public anonymous key (safe to use in client-side code)
- **service_role key**: Your service role key (⚠️ NEVER expose this in client-side code)

## Step 3: Get Database Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you set when creating the project

Alternatively, you can construct it manually:
- **Host**: `db.xxxxxxxxxxxxx.supabase.co` (found in Connection info)
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: The password you set during project creation

Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

## Step 4: Create .env File

1. In your project root directory, create a `.env` file (if it doesn't exist)
2. Add the following variables with your actual values:

```env
# Supabase Project URL
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Anon/Public Key (safe for client-side)
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (server-side only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection String for Drizzle ORM
DATABASE_URL=postgresql://postgres:your_password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Important Notes:**
- Never commit `.env` to git (it should be in `.gitignore`)
- The `PUBLIC_` prefix makes variables available to client-side code
- The service role key bypasses Row Level Security - keep it secret!

## Step 5: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open the `supabase-schema.sql` file from your project
4. Copy all the SQL content and paste it into the SQL Editor
5. Click **"Run"** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

This will create:
- All tables (profiles, products, orders, order_items)
- Indexes for performance
- Row Level Security (RLS) policies

## Step 6: Verify Connection

### Option 1: Check in Browser Console

1. Start your dev server:
   ```bash
   npm run dev
   ```
2. Open your browser console
3. You should see no Supabase connection warnings

### Option 2: Test Connection Programmatically

Create a test route or check the console logs when the app starts. The connection is initialized in `src/lib/db/index.ts`.

If you see warnings like:
```
Supabase environment variables are not set
```
or
```
DATABASE_URL not set
```

Check that:
- Your `.env` file exists in the project root
- Variable names are exactly as shown (case-sensitive)
- No extra spaces or quotes around the values
- You've restarted the dev server after creating/modifying `.env`

## Step 7: (Optional) Enable Authentication Providers

If you want to use authentication:

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable the providers you want (Email, Google, GitHub, etc.)
3. Configure each provider with their respective credentials

## Troubleshooting

### Connection Issues

**Error: "Invalid API key"**
- Double-check that you copied the correct key (anon vs service_role)
- Ensure there are no extra spaces or quotes in `.env`
- Restart your dev server after changing `.env`

**Error: "Database connection failed"**
- Verify your DATABASE_URL is correct
- Check that you replaced `[YOUR-PASSWORD]` with the actual password
- Ensure the password doesn't contain special characters that need URL encoding
- Try the connection string from Supabase dashboard directly

**Error: "Table does not exist"**
- Make sure you've run the `supabase-schema.sql` file in Supabase SQL Editor
- Check the Supabase dashboard → Table Editor to verify tables were created

### Environment Variables Not Loading

- Ensure `.env` is in the project root (same level as `package.json`)
- Restart the dev server after creating/modifying `.env`
- In SvelteKit, environment variables are loaded at build/start time

## Next Steps

Once connected:
1. ✅ Test database queries from your models
2. ✅ Set up authentication flows
3. ✅ Start building your application features
4. ✅ Test Row Level Security policies

## Security Best Practices

1. **Never commit `.env`** - Add it to `.gitignore`
2. **Use `PUBLIC_` prefix** only for variables needed client-side
3. **Service Role Key** should only be used server-side
4. **Enable RLS** on all tables (already included in schema)
5. **Use environment-specific** `.env` files for dev/prod

