# Connection Checklist

## ✅ Steps to Complete

### 1. Create `.env` File
- [ ] Create `.env` file in project root (same level as `package.json`)
- [ ] Copy your credentials from `SUPABASE_QUICK_START.md`

**IMPORTANT**: Remove the space after `=` in `PUBLIC_SUPABASE_ANON_KEY`!
```env
# ❌ WRONG (has space):
PUBLIC_SUPABASE_ANON_KEY= eyJ...

# ✅ CORRECT (no space):
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Complete All Environment Variables
- [ ] `PUBLIC_SUPABASE_URL` - ✅ You have this
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - ✅ You have this (but fix the space!)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ Still needed
- [ ] `DATABASE_URL` - ⚠️ Still needed

### 3. Get Missing Credentials
Go to Supabase Dashboard:
- **Settings → API**: Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
- **Settings → Database → Connection string (URI tab)**: Copy connection string → `DATABASE_URL`
  - Replace `[YOUR-PASSWORD]` with your actual database password

### 4. Test Connection
1. Restart dev server (if running): `Ctrl+C` then `npm run dev`
2. Visit: `http://localhost:5173/test-connection`
3. Check the connection status page

### 5. Run Database Schema
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Open `supabase-schema.sql` from your project
- [ ] Copy all SQL → Paste → Click Run

---

## Current Status from Your Quick Start File:

✅ **PUBLIC_SUPABASE_URL**: `https://lezbhvengcgvclmcxjbc.supabase.co`
✅ **PUBLIC_SUPABASE_ANON_KEY**: Found (but has space after `=` - needs fixing)
⚠️ **SUPABASE_SERVICE_ROLE_KEY**: Still placeholder
⚠️ **DATABASE_URL**: Still placeholder

