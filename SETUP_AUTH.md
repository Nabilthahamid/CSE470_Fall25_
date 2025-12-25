# Custom Authentication Setup Guide

## Overview

This project now uses **custom authentication** instead of Supabase Auth. Users are stored in your database with hashed passwords, and login matches passwords from the database.

## Database Setup

### Step 1: Run the Complete Database Setup

**IMPORTANT:** Run the entire SQL file in your Supabase SQL Editor:

Open `database/migrations/001_create_users_table.sql` and run all of it.

This single file contains:

- Table creation
- Index creation
- RLS setup
- All necessary policies

**If you get "row-level security policy" error:**

- The SQL file includes DROP statements to fix existing policies
- Just re-run the entire `001_create_users_table.sql` file

## How It Works

### Registration Flow:

1. User submits email, password, and name
2. Password is hashed using `bcryptjs` (10 salt rounds)
3. User is stored in `users` table with `password_hash`
4. JWT token is created and stored in cookie

### Login Flow:

1. User submits email and password
2. System fetches user from database by email
3. Password is compared with stored hash using `bcrypt.compare()`
4. If match, JWT token is created and stored in cookie
5. If no match, error is returned

### Session Management:

- JWT tokens stored in HTTP-only cookies
- Tokens expire after 7 days
- Session verified on every request via `hooks.server.ts`

## Security Features

✅ **Password Hashing**: Uses bcrypt with 10 salt rounds
✅ **JWT Tokens**: Secure session management
✅ **HTTP-Only Cookies**: Prevents XSS attacks
✅ **Password Validation**: Minimum 6 characters
✅ **Email Validation**: Regex pattern validation
✅ **Unique Emails**: Database constraint prevents duplicates

## Files Changed

- `src/lib/services/AuthService.ts` - Custom auth logic
- `src/lib/utils/password.ts` - Password hashing utilities
- `src/lib/utils/session.ts` - JWT token management
- `src/routes/auth/login/+page.server.ts` - Login with password matching
- `src/routes/auth/register/+page.server.ts` - Registration with password hashing
- `src/hooks.server.ts` - Custom session verification
- `src/lib/models/User.ts` - Added `password_hash` field

## Testing

1. **Register a user:**
   - Go to `/auth/register`
   - Enter email, name, and password
   - User is created in database

2. **Login:**
   - Go to `/auth/login`
   - Enter email and password
   - Password is matched against database hash
   - If correct, you're logged in

3. **Check database:**
   - Go to Supabase Dashboard → Table Editor → `users`
   - You'll see the user with hashed password (not plain text!)

## Environment Variables

Make sure your `.env` file has:

```
PUBLIC_SUPABASE_URL=your_url
PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_JWT_SECRET=your_jwt_secret (for signing tokens)
```

## Notes

- Passwords are **never stored in plain text**
- Passwords are hashed before storage
- Login compares hashed password with input
- Supabase Auth is completely removed
- All authentication is custom and database-driven
