# 🔌 Supabase Connection Checker Guide

## Overview

The Connection Checker is a comprehensive diagnostic tool that verifies all aspects of your Supabase and database setup. It provides real-time status, detailed error messages, and actionable setup guidance.

## Access the Checker

**Primary Page**: http://localhost:5173/test-connection

**Health API Endpoint**: http://localhost:5173/api/health

## What It Tests

### 1. 🔐 Supabase Auth (Critical)

- **Tests**: Authentication service accessibility
- **Requirements**: `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`
- **Impact if failing**: Users cannot sign up or log in

### 2. 🗄️ Supabase Database (Critical for E-commerce)

- **Tests**: Database connectivity and product table access
- **Requirements**: Same as Auth + SQL schema must be run
- **Impact if failing**: No products, cart, or orders

### 3. ⚡ Drizzle ORM (Optional)

- **Tests**: Direct database connection via Drizzle
- **Requirements**: `DATABASE_URL`
- **Impact if failing**: Type-safe queries unavailable (can use Supabase client instead)

### 4. 👑 Service Role Admin (Optional)

- **Tests**: Admin API access for server-side operations
- **Requirements**: `SUPABASE_SERVICE_ROLE_KEY`
- **Impact if failing**: Cannot create users programmatically or bypass RLS

### 5. 📊 Database Schema

- **Tests**: Presence of all required tables (profiles, products, orders, order_items)
- **Requirements**: SQL schema must be run
- **Impact if failing**: Database queries will fail

## Health Score

The checker provides an overall health score (0-100%):

| Score   | Status       | Meaning                   |
| ------- | ------------ | ------------------------- |
| 80-100% | 🟢 Excellent | All systems operational   |
| 60-79%  | 🟡 Warning   | Some features unavailable |
| 0-59%   | 🔴 Critical  | Setup required            |

## Features

### ✅ Environment Variable Display

- Shows all configured variables (safely masked)
- Indicates which are required vs optional
- Displays actual values for URLs (masked for secrets)

### ✅ Real-time Testing

- Tests all connections on page load
- "Re-test" button for instant re-checking
- No page refresh needed

### ✅ Detailed Error Messages

- Shows exact error messages from failed connections
- Provides context for each failure
- Links to relevant setup documentation

### ✅ Product Count Check

- Displays number of products found in database
- Warns if no products exist (schema not run)
- Helps verify sample data was inserted

### ✅ Schema Verification

- Lists all tables found in database
- Shows missing tables
- Confirms schema was properly applied

### ✅ Quick Actions

- Direct links to test auth (signup)
- View products page
- Open Supabase dashboard
- Access setup guides

### ✅ Setup Guidance

- Automatic detection of missing configuration
- Step-by-step instructions for each issue
- Prioritized action items

## Health API

The `/api/health` endpoint provides a lightweight status check:

```typescript
GET /api/health

Response:
{
  "health": 100,
  "message": "All systems operational",
  "testsPassed": 3,
  "testsRun": 3,
  "timestamp": "2024-12-18T21:00:00.000Z"
}
```

### Use Cases:

- Monitoring dashboards
- CI/CD health checks
- Status badges
- Custom widgets

## Connection Status Widget

A floating status widget is available as a component:

```svelte
<script>
  import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
</script>

<ConnectionStatus />
```

### Features:

- Floating button in bottom-right corner
- Shows health status at a glance
- Expandable for quick details
- Refresh button
- Link to full diagnostics

## Common Issues & Solutions

### ❌ "Auth service not accessible"

**Problem**: Cannot connect to Supabase Auth
**Solution**:

1. Check `PUBLIC_SUPABASE_URL` in `.env`
2. Verify `PUBLIC_SUPABASE_ANON_KEY` in `.env`
3. Ensure values are from correct Supabase project
4. Restart dev server after changing `.env`

### ❌ "Cannot query products table"

**Problem**: Database exists but tables don't
**Solution**:

1. Open Supabase Dashboard → SQL Editor
2. Copy entire `supabase-schema.sql`
3. Paste and run in SQL Editor
4. Refresh connection checker

### ⚠️ "Database connection not available"

**Problem**: Drizzle ORM not initialized
**Solution**:

1. Add `DATABASE_URL` to `.env`
2. Get it from Supabase Settings → Database → Connection string
3. Replace `[YOUR-PASSWORD]` with actual password
4. Restart dev server

### ⚠️ "No products found"

**Problem**: Schema run but sample products not inserted
**Solution**:

1. Re-run the SQL schema completely
2. Check for INSERT statement errors in SQL Editor
3. Verify no conflicts with existing data
4. Check RLS policies aren't blocking reads

### ⚠️ "Admin access denied"

**Problem**: Service role key invalid or not set
**Solution**:

1. Get service_role key from Supabase Settings → API
2. Add as `SUPABASE_SERVICE_ROLE_KEY` in `.env`
3. **NEVER** expose this in client-side code
4. Restart dev server

## Testing Workflow

### Initial Setup

1. Run connection checker: `/test-connection`
2. Note health score and failed tests
3. Follow setup guidance
4. Click "Re-test" after each fix
5. Aim for 100% health score

### After Code Changes

1. Check if database schema changed
2. Run updated SQL if needed
3. Test connection to verify
4. Check for new errors

### Before Deployment

1. Run full connection test
2. Verify 100% health score
3. Test in production environment
4. Monitor health API endpoint

## Integration Examples

### In Your Layout

Add connection status to all pages:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
</script>

<div>
  <nav>...</nav>
  <main>
    {@render children()}
  </main>
  <footer>...</footer>

  <!-- Only show in development -->
  {#if import.meta.env.DEV}
    <ConnectionStatus />
  {/if}
</div>
```

### In Admin Panel

Show detailed status:

```svelte
<script lang="ts">
  let health = $state(null);

  async function checkHealth() {
    const res = await fetch('/api/health');
    health = await res.json();
  }

  onMount(checkHealth);
</script>

{#if health}
  <div class="admin-status">
    System Health: {health.health}%
    <a href="/test-connection">View Details</a>
  </div>
{/if}
```

### In CI/CD Pipeline

```bash
# health-check.sh
#!/bin/bash

HEALTH=$(curl -s http://localhost:5173/api/health | jq .health)

if [ "$HEALTH" -lt 80 ]; then
  echo "Health check failed: $HEALTH%"
  exit 1
fi

echo "Health check passed: $HEALTH%"
```

## Tips & Best Practices

### Development

- Keep `/test-connection` open in a tab
- Check after pulling new code
- Verify after schema changes
- Use health API for quick checks

### Production

- Remove or protect `/test-connection` route
- Set up monitoring with health API
- Use environment variables properly
- Never commit `.env` files

### Troubleshooting

- Always check connection status first
- Read error messages carefully
- Verify environment variables are set
- Restart server after `.env` changes
- Check Supabase dashboard logs

## Advanced Usage

### Custom Health Checks

Extend the health API:

```typescript
// src/routes/api/health/+server.ts
export const GET: RequestHandler = async () => {
  // Add custom tests here
  const customTest = await myCustomCheck();

  return json({
    health: calculateHealth(),
    custom: customTest,
    // ...
  });
};
```

### Monitoring Integration

```typescript
// Send health to monitoring service
async function reportHealth() {
  const health = await fetch("/api/health").then((r) => r.json());

  await fetch("https://monitoring-service.com/report", {
    method: "POST",
    body: JSON.stringify({
      service: "my-app",
      health: health.health,
      timestamp: health.timestamp,
    }),
  });
}

setInterval(reportHealth, 60000); // Every minute
```

## Summary

The Connection Checker is your first stop for:

- ✅ Verifying setup is complete
- ✅ Diagnosing connection issues
- ✅ Monitoring system health
- ✅ Getting setup guidance
- ✅ Testing after changes

**Always check connections before asking for help!**

Visit: http://localhost:5173/test-connection
