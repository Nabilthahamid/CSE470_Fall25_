# E-Commerce Application

A robust e-commerce application built with SvelteKit, TypeScript, TailwindCSS, and Supabase, following strict MVC architecture principles.

## Tech Stack

- **Framework**: SvelteKit (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth

## Project Structure

```
src/
├── app.html
├── app.css
├── lib/
│   ├── components/
│   │   ├── ui/                # Atomic UI elements (Button, Input)
│   │   └── ecommerce/         # Domain-specific components (ProductCard, CartDrawer)
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   └── index.ts           # Supabase client & DB connection
│   ├── server/
│   │   ├── models/            # Data Access Layer (DB queries only)
│   │   │   ├── products.ts
│   │   │   ├── users.ts
│   │   │   └── orders.ts
│   │   └── services/          # Business Logic Layer
│   │       ├── cartService.ts
│   │       └── authService.ts
│   └── utils/                 # Helper functions
│       ├── formatCurrency.ts
│       └── validators.ts
├── routes/
│   ├── +layout.svelte         # Main layout
│   ├── +page.svelte           # Home page
│   ├── products/
│   │   ├── +page.server.ts    # Controller
│   │   ├── +page.svelte       # View
│   │   └── [slug]/
│   │       ├── +page.server.ts
│   │       └── +page.svelte
│   ├── cart/
│   │   ├── +page.server.ts
│   │   └── +page.svelte
│   └── api/
│       └── stripe/
│           └── +server.ts     # Webhook handlers
└── static/
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   - Get values from: **Supabase Dashboard → Settings → API**
   - For `DATABASE_URL`: **Settings → Database → Connection string** (URI tab)
   - Replace `[YOUR-PASSWORD]` with your actual database password

   See [SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md) for detailed instructions.

### 3. Database Setup

**Important**: All database schema changes must be made in `supabase-schema.sql` - this is the single source of truth.

Run the `supabase-schema.sql` file in your Supabase SQL Editor:

Simply open `supabase-schema.sql` and execute it in your Supabase SQL Editor. This file contains:
- All table definitions
- Indexes for performance
- Row Level Security (RLS) policies
- All necessary constraints and relationships

**Note**: After making changes to `supabase-schema.sql`, run the updated file in Supabase to apply changes.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Architecture Principles (MVC)

### Models (`lib/server/models`)
- **ONLY** place where database queries happen
- Return pure data interfaces/types
- No business logic

### Services (`lib/server/services`)
- Complex business logic (calculations, validations)
- Use models to access data
- Handle business rules

### Controllers (`+page.server.ts` / `+server.ts`)
- Handle HTTP requests/responses
- Import from models/services
- Pass data to views

### Views (`+page.svelte`)
- Dumb UI components
- Receive data via `export let data`
- No complex logic

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit push` - Push schema changes to database

## Next Steps

1. Set up Supabase authentication
2. Implement cart functionality (cookies/session storage)
3. Integrate Stripe payment processing
4. Add product management (admin panel)
5. Implement order tracking
