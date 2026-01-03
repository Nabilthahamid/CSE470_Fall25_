# Email Marketing Tables Migration

## Overview
This migration creates the necessary database tables for the email marketing feature:
- `email_newsletters` - Store newsletter templates and campaigns
- `email_sequences` - Store automated email sequences (welcome, abandoned cart, etc.)
- `email_campaigns` - Store email campaign tracking data

## How to Run

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `add_email_marketing_tables.sql`
5. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
# Or
psql -h your-db-host -U postgres -d postgres -f database/migrations/add_email_marketing_tables.sql
```

## Tables Created

### email_newsletters
- Stores newsletter templates and campaigns
- Tracks sending status, open rates, and click rates
- Supports HTML and text content types

### email_sequences
- Stores automated email sequences
- Supports triggers: welcome, abandoned_cart, order_confirmation, order_shipped, custom
- Stores sequence emails as JSONB array

### email_campaigns
- Tracks email campaign performance
- Monitors sent, opened, clicked, bounced, and unsubscribed counts
- Supports campaign status management

## Verification

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_newsletters', 'email_sequences', 'email_campaigns');

-- Check table structure
\d email_newsletters
\d email_sequences
\d email_campaigns
```

## Notes
- All tables have Row Level Security (RLS) enabled
- Public read access is allowed for all tables
- Admin full access is allowed for all tables
- Automatic `updated_at` timestamp triggers are included
- All tables use UUID primary keys

