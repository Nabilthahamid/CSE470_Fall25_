# Database Connection Troubleshooting Guide

## Error: `ENOTFOUND db.lezbhvengcgvclmcxjbc.supabase.co`

This error indicates that your system cannot resolve the DNS hostname for your Supabase database. This is a **network/infrastructure issue**, not a code bug.

### What This Means

The hostname `db.lezbhvengcgvclmcxjbc.supabase.co` cannot be found when trying to connect to your Supabase database. This could happen for several reasons:

## Possible Causes & Solutions

### 1. Supabase Project is Paused ⚠️

**Most Common Cause**: Free tier Supabase projects pause after 1 week of inactivity.

**Solution**:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Find your project (`lezbhvengcgvclmcxjbc`)
4. If it shows "Paused", click **"Restore"** or **"Resume"**
5. Wait 1-2 minutes for the project to fully restore
6. Restart your development server

### 2. Incorrect Hostname in DATABASE_URL

**Check your `.env` file**:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.lezbhvengcgvclmcxjbc.supabase.co:5432/postgres
```

**Solution**:

1. Go to Supabase Dashboard → Settings → Database
2. Find the **Connection string** section
3. Select the **URI** tab
4. Copy the exact connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Update your `.env` file with the correct connection string
7. Restart your dev server

### 3. Network/DNS Issues

**Test DNS resolution**:

```bash
# Windows PowerShell
ping db.lezbhvengcgvclmcxjbc.supabase.co

# Or test with nslookup
nslookup db.lezbhvengcgvclmcxjbc.supabase.co
```

**If DNS resolution fails**:

- Check your internet connection
- Try using a different network (mobile hotspot, different WiFi)
- Check if your firewall/proxy is blocking the connection
- Try accessing the Supabase dashboard in your browser to verify connectivity

### 4. Supabase Project Deleted

If your project was deleted:

1. Check your Supabase dashboard to confirm the project exists
2. If it doesn't exist, you'll need to create a new project
3. Update your `.env` file with the new project credentials

## Quick Diagnostic Steps

1. **Check Supabase Dashboard**:

   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Verify your project exists and is active (not paused)
   - Note the exact project reference ID

2. **Verify `.env` Configuration**:

   - Open `.env` in your project root
   - Check that `DATABASE_URL` matches your Supabase project
   - Ensure the hostname format is: `db.[PROJECT_REF].supabase.co`
   - Verify your password is correct (no special characters that need URL encoding)

3. **Test Connection**:

   ```bash
   # In your project root
   npm run dev
   ```

   - Visit `/test-connection` route if available
   - Check terminal for connection status

4. **Restart Everything**:
   - Stop your dev server (Ctrl+C)
   - Restart your dev server
   - Clear browser cache if needed

## Updated Error Handling

The code has been updated to provide clearer error messages. You should now see:

- `Database connection error - cannot resolve hostname` for DNS issues
- `Supabase connection error - cannot reach database` for connection failures

These messages indicate connection problems rather than query errors.

## Getting Help

If none of the above solutions work:

1. Check the [Supabase Status Page](https://status.supabase.com/)
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Check your Supabase project logs in the dashboard

## Prevention

- Keep your Supabase project active (use it regularly or upgrade to paid tier)
- Save your connection strings securely
- Use environment variables for all sensitive credentials
- Test your connection after any Supabase project changes
