# 🚀 Supabase Connection Guide

## Quick Setup Checklist

### ✅ Step 1: Set Up `.env` File

Create/update `.env` in your project root with these 4 lines:

```env
PUBLIC_SUPABASE_URL=https://lezbhvengcgvclmcxjbc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlemJodmVuZ2NndmNsbWN4amJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzU2NTMsImV4cCI6MjA4MTU1MTY1M30.OXibpJrzXSy1-Mxm3uDolDUrNMwsMpRISUF94yQaUl0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlemJodmVuZ2NndmNsbWN4amJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk3NTY1MywiZXhwIjoyMDgxNTUxNjUzfQ.sAAbRnUY4VXrujokN5kMcE-5AhXelOJs5h1oAKxWSXo
DATABASE_URL=postgresql://postgres:VAH696nyxJ_pizC@db.lezbhvengcgvclmcxjbc.supabase.co:5432/postgres
```

**⚠️ Important:**
- NO spaces after `=`
- NO quotes around values
- Save the file (Ctrl+S)

---

### ✅ Step 2: Create Database Tables

1. **Go to Supabase SQL Editor**: 
   https://app.supabase.com/project/lezbhvengcgvclmcxjbc/sql/new

2. **Copy the schema**:
   - Open `supabase-schema.sql` in your project
   - Press `Ctrl+A` to select all
   - Press `Ctrl+C` to copy

3. **Run the SQL**:
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for "Success" message

4. **Verify tables created**:
   - Go to Table Editor: https://app.supabase.com/project/lezbhvengcgvclmcxjbc/editor
   - Check for these tables:
     - ✅ profiles
     - ✅ products
     - ✅ orders
     - ✅ order_items

---

### ✅ Step 3: Test Your Connection

1. **Visit the test page**: http://localhost:5173/test-connection

2. **Check the results**:
   - ✅ All 5 checks should be green
   - ✅ Should show 100%
   - ✅ All 4 tables should be listed

3. **If anything fails**:
   - Check the error messages on the page
   - Follow the setup instructions shown
   - Restart dev server after changes

---

## 🔍 Troubleshooting

### Still seeing errors?

**Check your `.env` file:**
- File must be named exactly `.env` (no .txt or other extension)
- Must be in project root (same folder as `package.json`)
- Check for spaces or quotes

**Restart dev server:**
```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

**Verify in Supabase:**
- Dashboard: https://app.supabase.com/project/lezbhvengcgvclmcxjbc
- Check Settings → API for your keys
- Check Table Editor for tables

---

## 📁 Your Project Structure

```
FALL25/
├── .env                          ← Environment variables (not in git)
├── supabase-schema.sql          ← Run this in Supabase SQL Editor
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts        ← Client-side Supabase
│   │   │   ├── server.ts        ← Server-side Supabase + Drizzle
│   │   │   └── schema.ts        ← Database schema (TypeScript)
│   │   └── server/
│   │       └── models/          ← Database queries
│   └── routes/
│       └── test-connection/     ← Connection test page
└── ...
```

---

## 🎯 Quick Links

- **Test Connection**: http://localhost:5173/test-connection
- **Supabase Dashboard**: https://app.supabase.com/project/lezbhvengcgvclmcxjbc
- **SQL Editor**: https://app.supabase.com/project/lezbhvengcgvclmcxjbc/sql/new
- **Table Editor**: https://app.supabase.com/project/lezbhvengcgvclmcxjbc/editor

---

## ✅ Success Checklist

Once everything is working, you should be able to:

- [ ] Visit test-connection page without errors
- [ ] See 100% connection status
- [ ] View all 5 green checkmarks
- [ ] Browse /products without 500 errors
- [ ] Sign up for an account
- [ ] See your user in Supabase Auth
- [ ] See your profile in profiles table

---

**Need help?** Check the test-connection page - it will show exactly what's missing!

