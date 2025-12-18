# Supabase Quick Connection Guide

## 🚀 Quick Steps

### 1. Get Credentials from Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) → Create/Select Project
2. **Settings** → **API**:
   - Copy **Project URL** → `PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → `PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. **Settings** → **Database** → **Connection string**:
   - Select **URI** tab
   - Copy connection string → `DATABASE_URL`
   - Replace `[YOUR-PASSWORD]` with your actual database password

### 2. Create `.env` File

Create `.env` in project root:

```env
PUBLIC_SUPABASE_URL=https://lezbhvengcgvclmcxjbc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlemJodmVuZ2NndmNsbWN4amJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzU2NTMsImV4cCI6MjA4MTU1MTY1M30.OXibpJrzXSy1-Mxm3uDolDUrNMwsMpRISUF94yQaUl0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### 3. Run Database Schema

1. Supabase Dashboard → **SQL Editor**
2. Open `supabase-schema.sql` from your project
3. Copy & paste → Click **Run**

### 4. Verify

```bash
npm run dev
```

Check browser console - no connection warnings = ✅ Connected!

---

📖 For detailed instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
