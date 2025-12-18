# Setup Guide

## Quick Start

1. **Install dependencies** (already done)
   ```bash
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     - `PUBLIC_SUPABASE_URL` - Your Supabase project URL
     - `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
     - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
     - `DATABASE_URL` - PostgreSQL connection string for Drizzle ORM

3. **Set up database**
   - **Important**: All schema changes go in `supabase-schema.sql` - this is the single source of truth
   - Open `supabase-schema.sql` and execute it in your Supabase SQL Editor
   - This file contains all tables, indexes, and RLS policies

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Project Structure Overview

### ✅ Database Layer (`src/lib/db/`)
- `schema.ts` - Drizzle ORM schema definitions
- `index.ts` - Supabase client configuration

### ✅ Models (`src/lib/server/models/`)
- `products.ts` - Product data access functions
- `users.ts` - User/profile data access functions
- `orders.ts` - Order data access functions

### ✅ Services (`src/lib/server/services/`)
- `cartService.ts` - Cart calculation and validation logic
- `authService.ts` - Authentication and user management logic

### ✅ UI Components (`src/lib/components/`)
- `ui/Button.svelte` - Reusable button component
- `ui/Input.svelte` - Reusable input component
- `ecommerce/ProductCard.svelte` - Product display card
- `ecommerce/CartDrawer.svelte` - Shopping cart drawer

### ✅ Routes (`src/routes/`)
- `+layout.svelte` - Main application layout
- `+page.svelte` - Home page
- `products/` - Product listing and detail pages
- `cart/` - Shopping cart page
- `api/stripe/` - Stripe webhook handler

### ✅ Utils (`src/lib/utils/`)
- `formatCurrency.ts` - Currency formatting utility
- `validators.ts` - Email and slug validation utilities

## Next Steps

1. **Configure Supabase Authentication**
   - Set up email/password auth in Supabase dashboard
   - Configure OAuth providers if needed

2. **Implement Cart Functionality**
   - Add cart state management (cookies/localStorage)
   - Connect add to cart buttons to cart service

3. **Set up Stripe**
   - Create Stripe account
   - Add Stripe keys to environment variables
   - Implement checkout flow

4. **Add Product Management**
   - Create admin routes for product CRUD operations
   - Add product image upload functionality

5. **Enhance UI**
   - Add loading states
   - Add error handling
   - Improve mobile responsiveness

## Important Notes

- All database queries should ONLY be in `lib/server/models/`
- Business logic goes in `lib/server/services/`
- Controllers (`+page.server.ts`) import from models/services, not directly from db
- Views (`+page.svelte`) are presentation-only, no business logic

