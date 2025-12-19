# TinyShop - E-Commerce Application

A production-ready E-Commerce application built with SvelteKit using MVC architecture.

## Tech Stack

- **Framework**: SvelteKit (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database & Auth**: Supabase (PostgreSQL)
- **Icons**: Lucide-Svelte

## Architecture

This project follows the MVC (Model-View-Controller) architecture:

- **Model**: Database types and schemas in `src/lib/types` and Supabase client in `src/lib/server/db`
- **Controller**: Business logic in `src/lib/server/services/*.ts` and route handlers in `src/routes/**/+page.server.ts`
- **View**: UI components in `src/routes/**/+page.svelte` and reusable components in `src/lib/components`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Set up the database:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Run the `schema.sql` file (located in the project root)
   - This will create all necessary tables, indexes, triggers, and RLS policies

4. Update `.env` with your Supabase credentials:

```
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Run the development server:

```bash
npm run dev
```

## Database Schema

The complete database schema is defined in `schema.sql` at the project root. This single SQL file contains:

- **Tables**: `profiles`, `products`, `orders`, `order_items`
- **Indexes**: Optimized indexes for performance
- **Triggers**: Auto-update timestamps and auto-create profiles on signup
- **RLS Policies**: Row Level Security for data protection
- **Functions**: Helper functions for database operations

### Tables Overview

- `profiles` (id, email, full_name, role, created_at, updated_at)
- `products` (id, name, slug, description, price, stock, image_url, created_at, updated_at)
- `orders` (id, user_id, status, total_amount, created_at, updated_at)
- `order_items` (id, order_id, product_id, quantity, price_at_purchase, created_at)

## Project Structure

```
/src
├── /lib
│   ├── /server
│   │   ├── /db            # Database Connection
│   │   │   └── supabase.ts
│   │   ├── /services      # Business Logic Layers
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   └── orderService.ts
│   │   └── /utils         # Server-side helpers
│   ├── /components        # Reusable UI Components
│   │   ├── /ui            # Atomic elements (Buttons, Inputs)
│   │   └── /commerce      # ProductCard, CartItem, etc.
│   └── /types             # TypeScript Interfaces/Zod schemas
│       └── index.ts
├── /routes                # Routes (View + Controller Entry)
│   ├── +layout.svelte     # Global Layout
│   ├── +layout.server.ts  # Global Server Load
│   ├── /auth              # Auth Routes
│   ├── /shop              # Product Browsing
│   │   ├── [slug]         # Single Product View
│   │   │   ├── +page.svelte    # The View
│   │   │   └── +page.server.ts # The Controller
│   └── /checkout          # Cart & Payment
└── app.d.ts               # Supabase Type Definitions
```

## Features

### Implemented

- ✅ Product Listing Page (`/shop`)
- ✅ Single Product Detail Page (`/shop/[slug]`)
- ✅ Product Service with `getAllProducts()` and `getProductBySlug()`
- ✅ Responsive design with TailwindCSS
- ✅ MVC architecture separation

### TODO

- Authentication
- Shopping Cart
- Checkout Flow
- Order Management
- User Profile

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run lint` - Run linter
- `npm run format` - Format code
