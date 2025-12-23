# TinyShop - Complete System Documentation

## All Files, Workflows, and How Everything Works

---

## 📁 COMPLETE FILE STRUCTURE

```
tinyshop/
├── src/
│   ├── app.html                    # HTML template (root document)
│   ├── app.css                     # Global CSS styles
│   ├── hooks.server.ts             # Global request handlers (middleware)
│   │
│   ├── lib/                        # Shared library code
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navigation.svelte  # Global navigation bar
│   │   │   └── commerce/
│   │   │       └── ProductCard.svelte  # Product card component
│   │   │
│   │   ├── server/                # Server-side code (never sent to client)
│   │   │   ├── db/                # Database connections
│   │   │   │   ├── supabase.ts    # Admin client (bypasses RLS)
│   │   │   │   └── supabase-client.ts  # Client (respects RLS)
│   │   │   │
│   │   │   ├── models/            # Data validation schemas
│   │   │   │   └── auth.ts        # Zod schemas for auth
│   │   │   │
│   │   │   └── services/          # Business Logic Layer
│   │   │       ├── authService.ts      # Authentication logic
│   │   │       ├── productService.ts   # Product CRUD operations
│   │   │       ├── orderService.ts     # Order management
│   │   │       ├── reviewService.ts    # Review system
│   │   │       ├── profitLossService.ts # Financial reports
│   │   │       └── storageService.ts   # File upload handling
│   │   │
│   │   ├── stores/                # Client-side state management
│   │   │   └── cart.ts            # Shopping cart store
│   │   │
│   │   └── types/                 # TypeScript type definitions
│   │       └── index.ts           # Database types, interfaces
│   │
│   └── routes/                    # Application routes (pages)
│       ├── +layout.svelte         # Global layout wrapper
│       ├── +layout.server.ts     # Global server load function
│       │
│       ├── +page.svelte          # Home page (View)
│       ├── +page.server.ts       # Home page (Controller)
│       │
│       ├── auth/                  # Authentication pages
│       │   ├── +page.svelte       # Login/Register UI
│       │   └── +page.server.ts   # Auth actions (login, register, logout)
│       │
│       ├── shop/                  # Product browsing
│       │   ├── +page.svelte       # Product listing page
│       │   ├── +page.server.ts    # Fetch all products
│       │   └── [slug]/            # Dynamic route for product detail
│       │       ├── +page.svelte   # Product detail page
│       │       └── +page.server.ts # Fetch product + reviews
│       │
│       ├── cart/                  # Shopping cart
│       │   └── +page.svelte       # Cart view (client-side only)
│       │
│       ├── checkout/              # Checkout process
│       │   ├── +page.svelte       # Checkout form
│       │   └── +page.server.ts     # Create order action
│       │
│       ├── orders/                # Order management (user)
│       │   ├── +page.svelte       # Order list view
│       │   └── +page.server.ts    # Fetch user orders, delete order
│       │
│       └── admin/                 # Admin dashboard
│           ├── +page.svelte       # Admin home
│           ├── +page.server.ts    # Admin data load
│           ├── products/          # Product management
│           │   ├── +page.svelte   # Product CRUD UI
│           │   └── +page.server.ts # Product actions
│           ├── orders/            # Order management
│           │   ├── +page.svelte   # All orders view
│           │   └── +page.server.ts # Order actions
│           └── reports/           # Analytics & reports
│               ├── +page.svelte   # Reports dashboard
│               └── +page.server.ts # Report data
│
├── schema.sql                     # Complete database schema
├── migration_add_reviews.sql      # Reviews table migration
├── tailwind.config.js             # Tailwind CSS configuration
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

---

## 🔄 COMPLETE REQUEST WORKFLOW

### Example: User Views a Product Page

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User navigates to /shop/product-slug                │
│         Browser sends GET request                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: hooks.server.ts - handleAuth()                      │
│         - Reads 'sb-access-token' cookie                    │
│         - If token exists:                                  │
│           * Validates with Supabase Admin API               │
│           * Gets user from token                            │
│           * Fetches user profile (role)                     │
│           * Sets event.locals.user                          │
│           * Sets event.locals.role                          │
│         - If no token: locals.user = null                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: hooks.server.ts - handleAdminRoute()                │
│         - Checks if route starts with /admin                │
│         - If yes and user not admin → redirect to /auth     │
│         - If yes and user is admin → continue               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: hooks.server.ts - handleAuthRedirect()              │
│         - If user on /auth and logged in → redirect         │
│         - If admin on / → redirect to /admin               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: +page.server.ts - load() function                  │
│         - Receives params.slug = 'product-slug'            │
│         - Receives locals.user (from hooks)                 │
│         - Calls productService.getProductBySlug('product-slug')│
│         - Calls reviewService.getProductReviews(productId)  │
│         - Calls reviewService.getReviewStats(productId)    │
│         - Checks if user can review (purchased product)    │
│         - Returns: { product, reviews, reviewStats, canReview }│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: SvelteKit renders +page.svelte                     │
│         - Receives data from load() function                │
│         - Renders HTML with product data                     │
│         - Includes client-side JavaScript                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Browser receives HTML + JS                          │
│         - Displays product page                             │
│         - JavaScript hydrates (makes interactive)           │
│         - User can interact with page                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 DETAILED FILE DESCRIPTIONS

### 1. ROOT FILES

#### `src/app.html`

**Purpose**: Root HTML template
**What it does**:

- Defines the HTML structure
- Contains `<html>`, `<head>`, `<body>` tags
- Has script to remove dark mode class on load
- `%sveltekit.head%` - Injected by SvelteKit (meta tags, styles)
- `%sveltekit.body%` - Injected by SvelteKit (app content)

#### `src/app.css`

**Purpose**: Global CSS styles
**What it does**:

- Imports Tailwind CSS directives
- Contains base styles
- Applied globally to all pages

#### `src/hooks.server.ts`

**Purpose**: Global request middleware
**What it does**:

- Runs on EVERY request before route handlers
- Three middleware functions:
  1. `handleAuth` - Validates user session from cookies
  2. `handleAdminRoute` - Protects admin routes
  3. `handleAuthRedirect` - Smart redirects based on auth state
- Sets `event.locals.user` and `event.locals.role` for all routes

---

### 2. DATABASE LAYER

#### `src/lib/server/db/supabase.ts`

**Purpose**: Admin database client
**What it does**:

- Creates Supabase client with SERVICE_ROLE_KEY
- Bypasses Row Level Security (RLS)
- Used for server-side operations
- Full database access
- Exported as `supabaseAdmin`

#### `src/lib/server/db/supabase-client.ts`

**Purpose**: Client database connection
**What it does**:

- Creates Supabase client with ANON_KEY
- Respects Row Level Security (RLS)
- Used for client-side auth operations
- Limited permissions
- Exported as `supabaseClient`

---

### 3. SERVICE LAYER (Business Logic)

#### `src/lib/server/services/authService.ts`

**Purpose**: Authentication business logic
**Methods**:

- `login(email, password)` - Validates and signs in user
- `register(email, password, confirmPassword)` - Creates new user
- `getUserProfile(userId)` - Fetches user profile from database
- `getUserRole(userId)` - Gets user role (user/admin)
- `logout()` - Signs out user from Supabase
- `getSessionFromToken(token)` - Validates access token

**How it works**:

- Uses Zod schemas for input validation
- Calls Supabase Auth API
- Returns structured responses (success/error)

#### `src/lib/server/services/productService.ts`

**Purpose**: Product management logic
**Methods**:

- `getAllProducts()` - Fetches all products, ordered by date
- `getProductBySlug(slug)` - Gets single product by URL slug
- `getProductById(id)` - Gets product by UUID
- `getProductsByIds(ids[])` - Batch fetch products
- `createProduct(data)` - Creates new product
- `updateProduct(id, data)` - Updates existing product
- `deleteProduct(id)` - Deletes product

**How it works**:

- All methods use `supabaseAdmin` client
- Returns typed Product objects
- Handles errors gracefully

#### `src/lib/server/services/orderService.ts`

**Purpose**: Order management logic
**Methods**:

- `createOrder(userId, items[], shippingCost)` - Creates order + items
- `getUserOrders(userId)` - Gets all orders for a user
- `getUserOrdersWithDetails(userId)` - Orders with full product info
- `getAllOrders()` - Gets all orders (admin)
- `getAllOrdersWithDetails()` - All orders with details (admin)
- `getOrderItems(orderId)` - Gets items for an order
- `updateOrderStatus(orderId, status)` - Updates order status
- `deleteOrder(orderId, userId)` - Deletes order (with validation)

**How it works**:

- Creates order first, then order_items
- Stores `price_at_purchase` (price snapshot)
- Calculates totals (subtotal + shipping)
- Validates ownership before deletion
- Prevents deletion of delivered orders

#### `src/lib/server/services/reviewService.ts`

**Purpose**: Review system logic
**Methods**:

- `createReview(productId, userId, rating, comment)` - Creates review
- `updateReview(reviewId, rating, comment)` - Updates review
- `deleteReview(reviewId, userId)` - Deletes review
- `getProductReviews(productId)` - Gets all reviews for product
- `getUserReview(productId, userId)` - Gets user's review
- `getReviewStats(productId)` - Calculates average rating, count
- `canUserReview(productId, userId)` - Checks if user purchased product

**How it works**:

- Enforces one review per user per product (UNIQUE constraint)
- Validates purchase before allowing review
- Calculates statistics (average, count)
- Includes user information in review data

---

### 4. CLIENT-SIDE STORES

#### `src/lib/stores/cart.ts`

**Purpose**: Shopping cart state management
**What it does**:

- Uses Svelte's `writable` store
- Persists to `localStorage`
- Methods:
  - `addItem(product, quantity)` - Add/update item
  - `updateQuantity(productId, quantity)` - Change quantity
  - `removeItem(productId)` - Remove item
  - `clear()` - Empty cart
  - `getItemCount(items)` - Calculate total items
  - `getTotalPrice(items)` - Calculate total price

**How it works**:

- Store updates trigger UI re-renders
- localStorage syncs across browser tabs
- Survives page refreshes

---

### 5. ROUTE FILES (Pages)

#### `src/routes/+layout.server.ts`

**Purpose**: Global data loading
**What it does**:

- Runs on every page load
- Loads user and role from `locals` (set by hooks)
- Returns `{ user, role }` to all pages
- Available in all `+page.svelte` components

#### `src/routes/+layout.svelte`

**Purpose**: Global layout wrapper
**What it does**:

- Wraps all pages
- Renders Navigation component
- Provides `<main>` container
- `<slot />` renders child page content

#### `src/routes/+page.server.ts` & `+page.svelte`

**Purpose**: Home page
**What it does**:

- Server: Fetches all products
- Client: Displays featured products
- Hero section + product grid

#### `src/routes/shop/+page.server.ts` & `+page.svelte`

**Purpose**: Product listing page
**What it does**:

- Server: Fetches all products
- Client: Displays products in grid
- Search functionality (client-side filtering)
- Product cards with add to cart

#### `src/routes/shop/[slug]/+page.server.ts`

**Purpose**: Product detail page (Controller)
**What it does**:

- `load()` function:
  - Gets product by slug
  - Fetches reviews for product
  - Calculates review statistics
  - Checks if user can review (purchased product)
  - Gets user's existing review (if any)
- Actions:
  - `createReview` - Creates new review
  - `updateReview` - Updates existing review
  - `deleteReview` - Deletes review

#### `src/routes/shop/[slug]/+page.svelte`

**Purpose**: Product detail page (View)
**What it does**:

- Displays product information
- Shows reviews and ratings
- Add to cart functionality
- Review form (write/edit/delete)
- Uses `$derived` for reactive calculations
- Uses `$state` for form state

#### `src/routes/auth/+page.server.ts`

**Purpose**: Authentication controller
**What it does**:

- `load()` function:
  - Redirects if already logged in
  - Returns initial tab (login/register)
- Actions:
  - `login` - Validates credentials, sets cookies, redirects
  - `register` - Creates account, sets cookies, redirects
  - `logout` - Deletes cookies, redirects to /auth

#### `src/routes/auth/+page.svelte`

**Purpose**: Login/Register UI
**What it does**:

- Tabbed interface (Login/Register)
- Form validation
- Error/success message display
- Uses `use:enhance` for progressive enhancement

#### `src/routes/cart/+page.svelte`

**Purpose**: Shopping cart page
**What it does**:

- Client-side only (no server file)
- Subscribes to cart store
- Displays cart items
- Quantity controls
- Remove item functionality
- Calculate subtotal
- Link to checkout

#### `src/routes/checkout/+page.server.ts` & `+page.svelte`

**Purpose**: Checkout process
**What it does**:

- Server:
  - `load()` - Validates user, gets cart items
  - `createOrder` action - Creates order from cart
- Client:
  - Shipping address form
  - Billing address (optional)
  - Shipping method selection
  - Payment method (Cash on Delivery)
  - Order summary
  - Form submission

#### `src/routes/orders/+page.server.ts` & `+page.svelte`

**Purpose**: User order history
**What it does**:

- Server:
  - `load()` - Fetches user's orders with details
  - `deleteOrder` action - Deletes order (with validation)
- Client:
  - Displays order list
  - Order details (items, status, dates)
  - Delete button (except delivered orders)
  - Customer information display

#### `src/routes/admin/+page.server.ts` & `+page.svelte`

**Purpose**: Admin dashboard
**What it does**:

- Server: Loads admin data
- Client: Displays admin info, quick actions

#### `src/routes/admin/products/+page.server.ts` & `+page.svelte`

**Purpose**: Product management (admin)
**What it does**:

- Server:
  - `load()` - Fetches all products
  - Actions: `createProduct`, `updateProduct`, `deleteProduct`
- Client:
  - Product list with search
  - Add/Edit product form
  - Image upload (file or URL)
  - Delete confirmation

#### `src/routes/admin/orders/+page.server.ts` & `+page.svelte`

**Purpose**: Order management (admin)
**What it does**:

- Server:
  - `load()` - Fetches all orders with details
  - `updateOrderStatus` action - Changes order status
- Client:
  - All orders display
  - Status filter
  - Update status dropdown
  - Order details view

#### `src/routes/admin/reports/+page.server.ts` & `+page.svelte`

**Purpose**: Sales reports (admin)
**What it does**:

- Server: Calculates sales statistics
- Client: Displays charts, metrics, filters

---

### 6. COMPONENT FILES

#### `src/lib/components/Navigation.svelte`

**Purpose**: Global navigation bar
**What it does**:

- Displays on all pages
- Shows user info, cart count
- Logout functionality
- Profile dropdown
- Conditional rendering based on user/role

#### `src/lib/components/commerce/ProductCard.svelte`

**Purpose**: Reusable product card
**What it does**:

- Displays product image, name, price
- Add to cart button
- Out of stock indicator
- Links to product detail page

---

## 🔄 COMPLETE DATA FLOW EXAMPLES

### Example 1: User Logs In

```
1. User fills login form
   ↓
2. Form submits to /auth?/login (POST)
   ↓
3. hooks.server.ts runs:
   - handleAuth: No token yet, locals.user = null
   ↓
4. +page.server.ts action runs:
   - Receives email/password from formData
   - Validates with Zod schema
   - Calls authService.login()
   ↓
5. authService.login():
   - Validates input with Zod
   - Calls supabaseClient.auth.signInWithPassword()
   - Supabase validates credentials
   ↓
6. If successful:
   - Supabase returns user + session
   - Server sets cookies:
     * sb-access-token (7 days)
     * sb-refresh-token (30 days)
   - Server calls authService.getUserRole()
   - Gets role from profiles table
   ↓
7. Server redirects:
   - Admin → /admin
   - User → /
   ↓
8. Browser follows redirect
   ↓
9. hooks.server.ts runs again:
   - Reads new cookie
   - Validates token
   - Sets locals.user and locals.role
   ↓
10. Page loads with user data
```

### Example 2: User Adds Product to Cart

```
1. User clicks "Add to Cart" button
   ↓
2. handleAddToCart() function runs (client-side)
   ↓
3. cart.addItem(product, quantity) called
   ↓
4. Cart store updates:
   - Checks if product already in cart
   - If yes: increases quantity
   - If no: adds new item
   - Updates store state
   ↓
5. localStorage.setItem() saves cart
   ↓
6. Store subscribers notified:
   - Navigation component updates cart badge
   - Cart page updates (if open)
   ↓
7. UI updates immediately (no server request)
```

### Example 3: User Places an Order

```
1. User fills checkout form and submits
   ↓
2. Form POSTs to /checkout?/createOrder
   ↓
3. hooks.server.ts:
   - Validates user from cookie
   - Sets locals.user
   ↓
4. +page.server.ts createOrder action:
   - Validates user is logged in
   - Parses formData (address, shipping, etc.)
   - Gets cart items from request
   ↓
5. orderService.createOrder():
   - Validates cart items exist
   - Calculates subtotal
   - Adds shipping cost
   - Creates order record in database
   - Creates order_items records (one per cart item)
   - Stores price_at_purchase (snapshot)
   ↓
6. Database transaction:
   - INSERT INTO orders (id, user_id, status, total_amount)
   - INSERT INTO order_items (order_id, product_id, quantity, price)
   ↓
7. Server clears cart:
   - Calls cart.clear()
   - Removes from localStorage
   ↓
8. Server redirects to /orders
   ↓
9. User sees order confirmation
```

### Example 4: User Writes a Review

```
1. User clicks "Write a Review" button
   ↓
2. Review form appears (client-side)
   ↓
3. User selects rating and writes comment
   ↓
4. User submits form
   ↓
5. Form POSTs to /shop/[slug]?/createReview
   ↓
6. hooks.server.ts validates user
   ↓
7. +page.server.ts createReview action:
   - Validates user is logged in
   - Parses rating and comment
   - Calls reviewService.canUserReview()
   - Checks if user purchased product
   ↓
8. reviewService.createReview():
   - Validates purchase history
   - Creates review record
   - UNIQUE constraint ensures one review per user
   ↓
9. Database:
   - INSERT INTO reviews (product_id, user_id, rating, comment)
   ↓
10. Server returns success
    ↓
11. Client-side:
    - handleReviewSubmit() receives result
    - Calls invalidateAll() to refresh data
    ↓
12. Page reloads with new review
```

---

## 🏗️ ARCHITECTURE PATTERNS

### MVC Pattern Implementation

```
┌─────────────────────────────────────────┐
│           VIEW LAYER                     │
│  (*.svelte files)                       │
│  - Receives data via props              │
│  - Displays UI                          │
│  - Handles user interactions            │
│  - NO business logic                    │
│  - NO database queries                  │
└─────────────────────────────────────────┘
              ↕ (data flow)
┌─────────────────────────────────────────┐
│        CONTROLLER LAYER                  │
│  (+page.server.ts files)                │
│  - Handles HTTP requests                 │
│  - Validates input (Zod)                │
│  - Calls service layer                  │
│  - Returns responses                    │
│  - Manages redirects                   │
└─────────────────────────────────────────┘
              ↕ (method calls)
┌─────────────────────────────────────────┐
│         SERVICE LAYER                   │
│  (*Service.ts files)                   │
│  - Contains business rules              │
│  - Database operations                  │
│  - Data transformations                │
│  - Error handling                      │
│  - Reusable across routes              │
└─────────────────────────────────────────┘
              ↕ (SQL queries)
┌─────────────────────────────────────────┐
│          DATABASE LAYER                  │
│  (PostgreSQL via Supabase)              │
│  - Data storage                         │
│  - RLS policies                         │
│  - Triggers                            │
│  - Indexes                             │
└─────────────────────────────────────────┘
```

---

## 🔐 SECURITY WORKFLOW

### Authentication Flow

```
┌─────────────────────────────────────────┐
│ 1. User submits login form              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Server validates with Supabase Auth  │
│    - Checks email/password              │
│    - Returns JWT token if valid         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Server sets HTTP-only cookies        │
│    - sb-access-token (7 days)           │
│    - sb-refresh-token (30 days)         │
│    - httpOnly: true (JS can't access)   │
│    - secure: true (HTTPS only)          │
│    - sameSite: 'lax' (CSRF protection) │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. Every subsequent request:            │
│    - hooks.server.ts reads cookie       │
│    - Validates token with Supabase      │
│    - Sets locals.user                   │
│    - Sets locals.role                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. Routes check locals.user             │
│    - If null → redirect to /auth        │
│    - If admin route → check role        │
└─────────────────────────────────────────┘
```

### Authorization Flow

```
┌─────────────────────────────────────────┐
│ User tries to access /admin/products    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ hooks.server.ts - handleAdminRoute()   │
│ - Checks: event.url.pathname.startsWith │
│   ('/admin')                            │
│ - If no user → redirect /auth           │
│ - If user but not admin → redirect /   │
│ - If admin → continue                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ +page.server.ts load()                 │
│ - Receives locals.user (already set)    │
│ - Can safely fetch admin data          │
└─────────────────────────────────────────┘
```

---

## 💾 DATABASE WORKFLOW

### How Database Queries Work

```
┌─────────────────────────────────────────┐
│ Service calls supabaseAdmin.from()      │
│ Example:                                 │
│   supabaseAdmin                         │
│     .from('products')                   │
│     .select('*')                        │
│     .eq('slug', slug)                   │
│     .single()                           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Supabase client sends HTTP request      │
│ to Supabase API                         │
│ - POST /rest/v1/products                │
│ - Headers: Authorization, apikey       │
│ - Query params: select=*, slug=eq.xxx  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Supabase API processes request          │
│ - Checks RLS policies                   │
│ - Executes SQL query                    │
│ - Returns JSON response                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Service receives response               │
│ - data: Product object                  │
│ - error: null (if success)              │
│ - Returns typed Product                 │
└─────────────────────────────────────────┘
```

### Row Level Security (RLS) Example

```
User tries to view their orders:
  ↓
Service calls: supabaseAdmin.from('orders').select('*')
  ↓
Supabase checks RLS policy:
  - Policy: "Users can only see their own orders"
  - SQL: WHERE user_id = auth.uid()
  ↓
Database returns only user's orders
  ↓
Service returns filtered data
```

---

## 🎯 KEY WORKFLOWS

### Workflow 1: Page Load (SSR)

```
1. Browser requests /shop/product-slug
   ↓
2. SvelteKit server receives request
   ↓
3. hooks.server.ts runs (middleware)
   ↓
4. +page.server.ts load() runs
   ↓
5. Service layer queries database
   ↓
6. Server renders HTML with data
   ↓
7. HTML sent to browser
   ↓
8. JavaScript hydrates (makes interactive)
   ↓
9. User sees fully rendered page
```

### Workflow 2: Form Submission (Progressive Enhancement)

```
1. User fills form and clicks submit
   ↓
2. JavaScript intercepts (use:enhance)
   ↓
3. Client-side validation
   ↓
4. Shows loading state
   ↓
5. Sends POST request
   ↓
6. Server action processes
   ↓
7. Returns result
   ↓
8. JavaScript updates UI
   ↓
9. No full page reload (smooth UX)
```

### Workflow 3: State Management

```
┌─────────────────────────────────────────┐
│ Server State                             │
│ - Loaded via +page.server.ts            │
│ - Passed as props to components         │
│ - Refreshed on navigation               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Client State (Stores)                    │
│ - cart store (localStorage)              │
│ - Survives page refreshes               │
│ - Syncs across components               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Component State ($state)                 │
│ - Form inputs                           │
│ - UI state (show/hide)                  │
│ - Temporary data                        │
└─────────────────────────────────────────┘
```

---

## 🔗 HOW FILES INTERACT

### Example: Product Detail Page

```
┌─────────────────────────────────────────┐
│ src/routes/shop/[slug]/+page.svelte     │
│ (View - displays product)                │
└─────────────────────────────────────────┘
              ↕ receives data
┌─────────────────────────────────────────┐
│ src/routes/shop/[slug]/+page.server.ts  │
│ (Controller - handles requests)         │
│ - load() calls services                 │
│ - Actions handle form submissions       │
└─────────────────────────────────────────┘
              ↕ calls
┌─────────────────────────────────────────┐
│ src/lib/server/services/productService.ts│
│ (Service - business logic)              │
│ - getProductBySlug()                    │
└─────────────────────────────────────────┘
              ↕ queries
┌─────────────────────────────────────────┐
│ src/lib/server/db/supabase.ts           │
│ (Database client)                       │
│ - supabaseAdmin client                 │
└─────────────────────────────────────────┘
              ↕ HTTP request
┌─────────────────────────────────────────┐
│ Supabase API → PostgreSQL Database      │
│ (Data storage)                          │
└─────────────────────────────────────────┘
```

### Example: Add to Cart

```
┌─────────────────────────────────────────┐
│ ProductCard.svelte                      │
│ - User clicks "Add to Cart"             │
│ - Calls handleAddToCart()               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ cart.addItem(product, quantity)         │
│ (from src/lib/stores/cart.ts)          │
│ - Updates store state                  │
│ - Saves to localStorage                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Store subscribers notified:             │
│ - Navigation.svelte (cart badge)       │
│ - Cart page (if open)                  │
│ - All components using cart store       │
└─────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAMS

### Complete Order Creation Flow

```
User Action
    │
    ├─→ Checkout Form Submission
    │       │
    │       ├─→ hooks.server.ts
    │       │   └─→ Validates user from cookie
    │       │
    │       ├─→ +page.server.ts (createOrder action)
    │       │   ├─→ Validates form data
    │       │   ├─→ Gets cart items
    │       │   └─→ Calls orderService.createOrder()
    │       │
    │       ├─→ orderService.createOrder()
    │       │   ├─→ Validates items exist
    │       │   ├─→ Calculates totals
    │       │   ├─→ Creates order record
    │       │   └─→ Creates order_items records
    │       │
    │       ├─→ Database Transaction
    │       │   ├─→ INSERT INTO orders
    │       │   └─→ INSERT INTO order_items (multiple)
    │       │
    │       └─→ Response
    │           ├─→ Clears cart
    │           └─→ Redirects to /orders
    │
    └─→ User sees order confirmation
```

---

## 🛠️ TECHNICAL DETAILS

### SvelteKit Routing

```
File-based routing:
- /shop → src/routes/shop/+page.svelte
- /shop/product-slug → src/routes/shop/[slug]/+page.svelte
- [slug] is a dynamic parameter
- +page.svelte = View component
- +page.server.ts = Server-side logic
- +layout.svelte = Wraps all child routes
```

### Server Actions

```
Form action="?/createOrder"
  ↓
Calls createOrder() in +page.server.ts
  ↓
Returns result object
  ↓
Client receives result
  ↓
Updates UI based on result
```

### Progressive Enhancement

```
Without JavaScript:
  Form submits normally
  Full page reload
  Works but slower

With JavaScript (use:enhance):
  Intercepts form submission
  Shows loading state
  Updates UI smoothly
  Better user experience
```

---

## 🎓 KEY CONCEPTS FOR VIVA

### 1. Separation of Concerns

- **View**: Only displays, no logic
- **Controller**: Handles requests, validates
- **Service**: Business logic, reusable
- **Database**: Data storage

### 2. Type Safety

- TypeScript throughout
- Types from database schema
- Compile-time error checking
- Better IDE support

### 3. Security Layers

- **Authentication**: Who you are (login)
- **Authorization**: What you can do (role)
- **Database RLS**: Data-level security
- **Input Validation**: Zod schemas

### 4. State Management

- **Server State**: Loaded per request
- **Client State**: Stores (cart)
- **Component State**: $state variables
- **Derived State**: $derived calculations

### 5. Performance

- **Indexes**: Fast database queries
- **SSR**: SEO-friendly, fast initial load
- **Progressive Enhancement**: Works without JS
- **Caching**: localStorage for cart

---

## 📝 SUMMARY

**TinyShop** is a full-stack e-commerce application where:

1. **Every request** goes through `hooks.server.ts` first
2. **Server routes** (`+page.server.ts`) handle data loading and actions
3. **Service layer** contains all business logic
4. **Database** stores data with RLS security
5. **Components** (`+page.svelte`) only display data
6. **Stores** manage client-side state (cart)
7. **Forms** use progressive enhancement
8. **Authentication** uses cookie-based sessions
9. **Authorization** enforced at multiple levels
10. **Type safety** throughout with TypeScript

The architecture ensures:

- ✅ Clean separation of concerns
- ✅ Reusable business logic
- ✅ Type-safe development
- ✅ Secure data access
- ✅ Scalable structure
- ✅ Maintainable codebase
