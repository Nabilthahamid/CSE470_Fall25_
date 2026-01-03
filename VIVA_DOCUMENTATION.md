# TinyTech E-Commerce Platform - Complete VIVA Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Technology Stack](#technology-stack)
4. [Complete Feature Breakdown with File Flow](#complete-feature-breakdown-with-file-flow)
5. [Database Structure](#database-structure)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization Flow](#authentication--authorization-flow)
8. [User Flows](#user-flows)
9. [Code Organization](#code-organization)
10. [Security Implementation](#security-implementation)

---

## 🎯 Project Overview

**TinyTech** is a full-featured e-commerce platform specializing in PC components and computer hardware. It provides comprehensive features including product management, shopping cart, checkout, PC builder tool, community builds, admin dashboard, and AI-powered recommendations.

### Key Highlights
- ✅ Complete MVC Architecture
- ✅ Full CRUD Operations for all entities
- ✅ AI-Powered Features (Gemini & OpenAI)
- ✅ Real-time Energy Consumption Calculations
- ✅ Community Features (Builds, Reviews, Ratings)
- ✅ Comprehensive Admin Dashboard
- ✅ Responsive Design

---

## 🏗️ Architecture & Design Patterns

### MVC (Model-View-Controller) Pattern

```
┌─────────────────────────────────────────────────────────┐
│                     USER REQUEST                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  CONTROLLER Layer                                       │
│  src/routes/**/+page.server.ts                         │
│  - Handle HTTP requests                                 │
│  - Validate input                                       │
│  - Call Models/Services                                 │
│  - Return data to View                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  MODEL Layer     │      │  UTILS Layer     │
│  src/lib/models/ │      │  src/lib/utils/  │
│  - Data structures│     │  - Helper funcs  │
│  - Database ops  │      │  - Business logic│
│  - TypeScript    │      │  - Calculations  │
│    interfaces    │      │                  │
└────────┬─────────┘      └──────────────────┘
         │
         │ Data
         ▼
┌─────────────────────────────────────────────────────────┐
│  VIEW Layer                                             │
│  src/routes/**/+page.svelte                            │
│  - Display data                                         │
│  - Handle user interactions                             │
│  - Form submissions                                     │
└─────────────────────────────────────────────────────────┘
```

### File Structure Explanation

```
src/
├── lib/
│   ├── models/          # MODEL: Data access layer
│   │   ├── UserModel.ts          # User database operations
│   │   ├── ProductModel.ts       # Product database operations
│   │   ├── CartModel.ts          # Cart database operations
│   │   ├── OrderModel.ts         # Order database operations
│   │   └── ...                   # Other models
│   │
│   ├── controllers/     # CONTROLLER: Request handling
│   │   ├── admin/                # Admin controllers
│   │   ├── auth/                 # Auth controllers
│   │   └── public/               # Public controllers
│   │
│   ├── components/      # VIEW: Reusable UI components
│   │   ├── AdminSidebar.svelte
│   │   ├── ToastNotification.svelte
│   │   └── ...
│   │
│   ├── utils/           # Utility functions
│   │   ├── auth.ts              # Authentication helpers
│   │   ├── energy.ts            # Energy calculations
│   │   ├── pc-builder.ts        # PC builder helpers
│   │   └── ...
│   │
│   └── config/
│       └── supabase.ts          # Database configuration
│
└── routes/              # SvelteKit routes
    ├── +page.server.ts          # Server-side logic (CONTROLLER)
    ├── +page.svelte             # Client-side UI (VIEW)
    ├── api/                     # API endpoints
    └── ...
```

---

## 🛠️ Technology Stack

### Frontend
- **SvelteKit 2.0** - Full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization

### Backend
- **SvelteKit Server** - Server-side rendering & API
- **Supabase** - PostgreSQL database & storage
- **JWT (Jose)** - Authentication tokens
- **Bcryptjs** - Password hashing

### AI Integration
- **Google Gemini API** - AI recommendations & analysis
- **OpenAI API** - Advanced AI features

### Development Tools
- **Vite** - Build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

---

## 📦 Complete Feature Breakdown with File Flow

### 1. Authentication System

#### Registration Flow
```
User Input (Register Form)
    ↓
src/routes/auth/register/+page.svelte
    ↓ (Form Submission)
src/routes/auth/register/+page.server.ts (Action)
    ↓
src/lib/controllers/auth/AuthController.ts
    ├── validateInput()
    ├── checkEmailExists()
    └── createUser()
        ↓
src/lib/models/UserModel.ts
    └── create()
        ↓
Database: INSERT INTO users
    ↓
JWT Token Generation
    ↓
Cookie Set (HTTP-only)
    ↓
Redirect to Home
```

**Files Involved:**
- `src/routes/auth/register/+page.svelte` - Registration form UI
- `src/routes/auth/register/+page.server.ts` - Server action handler
- `src/lib/controllers/auth/AuthController.ts` - Business logic
- `src/lib/models/UserModel.ts` - Database operations
- `src/lib/utils/password.ts` - Password hashing (bcrypt)
- `src/lib/utils/session.ts` - JWT token creation

#### Login Flow
```
User Input (Login Form)
    ↓
src/routes/auth/login/+page.svelte
    ↓ (Form Submission)
src/routes/auth/login/+page.server.ts
    ↓
src/lib/controllers/auth/AuthController.ts
    └── authenticate()
        ├── UserModel.getByEmail()
        ├── comparePassword()
        └── createSessionToken()
            ↓
src/lib/utils/session.ts
    └── createSessionToken()
        ↓
Set HTTP-only Cookie
    ↓
Redirect based on role (Admin/User)
```

**Files Involved:**
- `src/routes/auth/login/+page.svelte` - Login form
- `src/routes/auth/login/+page.server.ts` - Login handler
- `src/lib/controllers/auth/AuthController.ts` - Authentication logic
- `src/lib/utils/auth.ts` - Auth helper functions
- `src/lib/utils/password.ts` - Password verification

### 2. Product Management

#### View Products Flow
```
User visits /products
    ↓
src/routes/products/+page.server.ts (Load function)
    ↓
src/lib/controllers/public/ProductController.ts
    └── loadProductsList()
        ↓
src/lib/models/ProductModel.ts
    └── getAll()
        ↓
Database: SELECT * FROM products
    ↓
Return products array
    ↓
src/routes/products/+page.svelte
    └── Display products in grid
```

**Files Involved:**
- `src/routes/products/+page.server.ts` - Load products
- `src/lib/controllers/public/ProductController.ts` - Product logic
- `src/lib/models/ProductModel.ts` - Database queries
- `src/routes/products/+page.svelte` - Product listing UI

#### Admin Create Product Flow
```
Admin clicks "Create Product"
    ↓
src/routes/admin/products/+page.svelte
    ↓ (Form Submission)
src/routes/admin/products/+page.server.ts (Action)
    ↓
src/lib/controllers/admin/ProductController.ts
    └── createProduct()
        ├── Validate input
        ├── Upload image (if provided)
        │   ↓
        │   src/lib/utils/storage.ts
        │   └── uploadImage()
        │       ↓
        │   Supabase Storage
        └── Create product record
            ↓
src/lib/models/ProductModel.ts
    └── create()
        ↓
Database: INSERT INTO products
    ↓
Success response
    ↓
Redirect to products list
```

**Files Involved:**
- `src/routes/admin/products/+page.svelte` - Admin product form
- `src/routes/admin/products/+page.server.ts` - Form handler
- `src/lib/controllers/admin/ProductController.ts` - Admin product logic
- `src/lib/models/ProductModel.ts` - Product creation
- `src/lib/utils/storage.ts` - Image upload utility

### 3. Shopping Cart System

#### Add to Cart Flow
```
User clicks "Add to Cart"
    ↓
src/routes/cart/add/+server.ts (API endpoint)
    OR
src/routes/products/[id]/+page.svelte (Form action)
    ↓
src/lib/models/CartModel.ts
    └── addToCart(userId, productId, quantity)
        ├── Check if item exists in cart
        ├── If exists: UPDATE quantity
        ├── If not: INSERT new cart_item
        └── Validate stock availability
            ↓
Database: INSERT/UPDATE cart_items
    ↓
Return success
    ↓
Frontend updates cart count
```

**Files Involved:**
- `src/routes/cart/add/+server.ts` - Add to cart API
- `src/lib/models/CartModel.ts` - Cart database operations
- `src/routes/cart/+page.svelte` - Cart display

#### View Cart Flow
```
User visits /cart
    ↓
src/routes/cart/+page.server.ts
    ↓
src/lib/controllers/public/CartController.ts
    └── loadCart()
        ↓
src/lib/models/CartModel.ts
    └── getByUserId(userId)
        ↓
Database: SELECT * FROM cart_items WHERE user_id = ?
    ↓
Join with products table
    ↓
Calculate totals
    ↓
src/routes/cart/+page.svelte
    └── Display cart items with quantities and totals
```

**Files Involved:**
- `src/routes/cart/+page.server.ts` - Load cart data
- `src/lib/controllers/public/CartController.ts` - Cart logic
- `src/lib/models/CartModel.ts` - Cart queries
- `src/routes/cart/+page.svelte` - Cart UI

### 4. Checkout Process

#### Complete Checkout Flow
```
User clicks "Checkout"
    ↓
src/routes/checkout/+page.server.ts (Load)
    ↓
src/lib/controllers/public/CheckoutController.ts
    └── loadCheckout()
        ├── Get cart items
        ├── Calculate totals
        ├── Get shipping methods
        └── Return checkout data
            ↓
src/routes/checkout/+page.svelte
    └── Display checkout form
        ↓
User fills form and submits
        ↓
src/routes/checkout/+page.server.ts (Action)
    ↓
src/lib/controllers/public/CheckoutController.ts
    └── processCheckout()
        ├── Validate form data
        ├── Validate cart items & stock
        ├── Calculate final total
        ├── Create order
        │   ↓
        │   src/lib/models/OrderModel.ts
        │   └── create()
        │       ↓
        │   Database: INSERT INTO orders
        ├── Create order_items
        │   ↓
        │   Database: INSERT INTO order_items
        ├── Reduce product stock
        │   ↓
        │   Database: UPDATE products SET stock = stock - quantity
        ├── Clear cart
        │   ↓
        │   Database: DELETE FROM cart_items WHERE user_id = ?
        ├── Create sale record
        │   ↓
        │   Database: INSERT INTO sales
        └── Send confirmation email
            ↓
            src/lib/utils/email.ts
            └── sendOrderConfirmation()
                ↓
Redirect to /checkout/success
```

**Files Involved:**
- `src/routes/checkout/+page.server.ts` - Checkout handler
- `src/lib/controllers/public/CheckoutController.ts` - Checkout logic
- `src/lib/models/OrderModel.ts` - Order creation
- `src/lib/models/CartModel.ts` - Cart clearing
- `src/lib/utils/email.ts` - Email sending

### 5. PC Builder Feature

#### Build PC Flow
```
User visits /pc-builder
    ↓
src/routes/pc-builder/+page.server.ts (Load)
    ↓
src/lib/utils/pc-builder.ts
    └── getAllCategories()
        ↓
Database: SELECT * FROM component_categories
    ↓
src/lib/models/ProductModel.ts
    └── getAll()
        ↓
Group products by category
    ↓
src/routes/pc-builder/+page.svelte
    └── Display component categories
        ↓
User selects components
        ↓
Calculate total price (reactive)
        ↓
User clicks "Save Build"
        ↓
src/routes/pc-builder/+page.server.ts (Action: saveBuild)
    ↓
src/lib/models/PCBuildModel.ts
    └── create(userId, buildData)
        ├── INSERT INTO pc_builds
        └── INSERT INTO pc_build_components
            ↓
Success: Build saved
```

#### AI Pre-built Builds Flow
```
User clicks "Generate Builds"
    ↓
src/routes/pc-builder/+page.svelte
    └── Calls loadPrebuiltBuilds()
        ↓
POST /api/pc-builder/ai-prebuilt
    ↓
src/routes/api/pc-builder/ai-prebuilt/+server.ts
    ↓
Generate builds with:
    ├── src/lib/models/ProductModel.ts (Get products)
    ├── src/lib/utils/pc-builder.ts (Get categories)
    ├── src/lib/utils/energy.ts (Calculate power)
    └── Gemini AI Integration
        ↓
        src/lib/utils/ai.ts
        └── Google Generative AI
            ├── Analyze products
            ├── Generate descriptions
            └── Recommend best build
            ↓
Return builds with:
    ├── Components
    ├── Power consumption
    ├── AI descriptions
    └── Best recommendation
    ↓
Display in modal
```

**Files Involved:**
- `src/routes/pc-builder/+page.server.ts` - PC builder handler
- `src/routes/pc-builder/+page.svelte` - PC builder UI
- `src/routes/api/pc-builder/ai-prebuilt/+server.ts` - AI builds API
- `src/lib/utils/pc-builder.ts` - PC builder helpers
- `src/lib/utils/energy.ts` - Power calculations
- `src/lib/utils/ai.ts` - Gemini AI integration
- `src/lib/models/PCBuildModel.ts` - Build storage

#### Energy Calculation Flow
```
User clicks "Energy Calculator"
    ↓
src/routes/pc-builder/+page.svelte
    └── Calls calculateEnergy()
        ↓
POST /api/pc-builder/energy/calculate
    ↓
src/routes/api/pc-builder/energy/calculate/+server.ts
    ↓
src/lib/utils/energy.ts
    └── calculateBuildEnergy(components)
        ├── Get power consumption per component
        │   └── src/lib/models/Energy.ts
        │       └── DEFAULT_POWER_CONSUMPTION
        ├── Calculate totals (idle/load/peak)
        ├── Calculate electricity costs
        ├── Calculate carbon footprint
        └── Recommend PSU
            ↓
Return analysis with:
    ├── Power consumption breakdown
    ├── Monthly/yearly costs
    ├── Carbon footprint
    └── PSU recommendation
    ↓
Display in modal
```

**Files Involved:**
- `src/routes/api/pc-builder/energy/calculate/+server.ts` - Energy API
- `src/lib/utils/energy.ts` - Energy calculations
- `src/lib/models/Energy.ts` - Power consumption data

### 6. Product Comparison

#### Compare Products Flow
```
User clicks "Compare" button
    ↓
src/lib/utils/comparison.ts
    └── addToComparison(productId)
        ↓
LocalStorage: Save product IDs
    ↓
User visits /compare
    ↓
src/routes/compare/+page.server.ts
    └── Get products from localStorage
        ↓
src/lib/models/ProductModel.ts
    └── getById() for each product
        ↓
src/routes/compare/+page.svelte
    └── Display side-by-side comparison
        ├── Specifications
        ├── Prices
        ├── Images
        └── Features
```

**Files Involved:**
- `src/routes/compare/+page.server.ts` - Load comparison data
- `src/routes/compare/+page.svelte` - Comparison UI
- `src/lib/utils/comparison.ts` - LocalStorage management

### 7. Reviews & Ratings

#### Submit Review Flow
```
User submits review on product page
    ↓
src/routes/products/[id]/+page.server.ts (Action)
    ↓
src/lib/controllers/public/ProductController.ts
    └── createReview()
        ├── Validate user purchased product
        │   ↓
        │   Check orders table
        ├── AI Moderation (optional)
        │   ↓
        │   src/lib/utils/ai.ts
        │   └── moderateReview()
        └── Create review
            ↓
src/lib/models/ReviewModel.ts
    └── create()
        ↓
Database: INSERT INTO reviews
    ↓
Update product average rating
    ↓
Database: UPDATE products SET avg_rating = ?
    ↓
Success response
```

**Files Involved:**
- `src/routes/products/[id]/+page.server.ts` - Review submission
- `src/lib/models/ReviewModel.ts` - Review storage
- `src/lib/utils/ai.ts` - AI moderation

### 8. Community Builds

#### Share Build Flow
```
User clicks "Share to Community"
    ↓
src/routes/pc-builder/+page.svelte
    └── Opens share modal
        ↓
User fills form and submits
        ↓
POST /api/community-builds/[id]/share
    ↓
src/routes/api/community-builds/[id]/share/+server.ts
    ↓
src/lib/models/CommunityBuildModel.ts
    └── share(buildId, shareData)
        ↓
Database: INSERT INTO community_builds
    ↓
Success: Build is now public
```

**Files Involved:**
- `src/routes/api/community-builds/[id]/share/+server.ts` - Share API
- `src/lib/models/CommunityBuildModel.ts` - Community build operations

### 9. Admin Dashboard

#### Admin Dashboard Flow
```
Admin visits /admin
    ↓
src/routes/admin/+layout.server.ts
    └── Check authentication & admin role
        ↓
src/routes/admin/+page.server.ts
    ↓
src/lib/controllers/admin/AdminController.ts
    └── loadDashboard()
        ├── Get statistics
        │   ├── Total users
        │   ├── Total products
        │   ├── Total orders
        │   └── Total revenue
        ├── Get recent orders
        ├── Get low stock alerts
        └── Get notifications
            ↓
src/routes/admin/+page.svelte
    └── Display dashboard with widgets
```

**Files Involved:**
- `src/routes/admin/+layout.server.ts` - Admin auth check
- `src/routes/admin/+page.server.ts` - Dashboard data
- `src/lib/controllers/admin/AdminController.ts` - Dashboard logic
- `src/routes/admin/+page.svelte` - Dashboard UI

### 10. Order Management

#### View Orders Flow
```
User visits /orders
    ↓
src/routes/orders/+page.server.ts
    ↓
src/lib/controllers/public/OrderController.ts
    └── loadOrders()
        ↓
src/lib/models/OrderModel.ts
    └── getByUserId(userId)
        ↓
Database: SELECT * FROM orders WHERE user_id = ?
    ↓
Join with order_items and products
    ↓
src/routes/orders/+page.svelte
    └── Display order list
```

**Files Involved:**
- `src/routes/orders/+page.server.ts` - Load orders
- `src/lib/controllers/public/OrderController.ts` - Order logic
- `src/lib/models/OrderModel.ts` - Order queries

---

## 🗄️ Database Structure

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### products
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    component_category_id UUID,
    brand VARCHAR(255),
    specifications JSONB,
    avg_rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### cart_items
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### orders
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### order_items
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### reviews
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### PC Builder Tables

#### component_categories
```sql
CREATE TABLE component_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER
);
```

#### pc_builds
```sql
CREATE TABLE pc_builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### pc_build_components
```sql
CREATE TABLE pc_build_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    build_id UUID REFERENCES pc_builds(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    component_category_id UUID REFERENCES component_categories(id),
    quantity INTEGER DEFAULT 1
);
```

#### community_builds
```sql
CREATE TABLE community_builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    build_id UUID REFERENCES pc_builds(id) ON DELETE CASCADE,
    use_case VARCHAR(100),
    tags TEXT[],
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Products
- `GET /products` - List all products
- `GET /products/[id]` - Get product details
- `POST /api/products/filter/smart` - Smart product filtering

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /cart` - View cart
- `DELETE /api/cart/[id]` - Remove item from cart

### Orders
- `POST /checkout` - Process checkout
- `GET /orders` - Get user orders
- `GET /orders/[id]` - Get order details

### PC Builder
- `GET /pc-builder` - PC builder page
- `POST /api/pc-builder/ai-prebuilt` - Generate AI pre-built builds
- `POST /api/pc-builder/ai-optimize` - Optimize build
- `POST /api/pc-builder/energy/calculate` - Calculate energy consumption
- `POST /api/pc-builder/compatibility` - Check component compatibility

### Reviews
- `POST /api/reviews/moderate` - Moderate review (AI)
- `GET /api/reviews/analyze-sentiment` - Analyze review sentiment

### Admin APIs
- `GET /admin` - Admin dashboard
- `GET /api/admin/ai-insights` - AI insights
- `GET /api/admin/ai-sales-analytics` - Sales analytics
- `POST /api/admin/bulk-operations` - Bulk operations

---

## 🔐 Authentication & Authorization Flow

### Authentication Process

1. **Registration**
   - User provides email, password, name
   - Email uniqueness checked
   - Password hashed with bcrypt (10 rounds)
   - User record created in database
   - JWT token generated
   - HTTP-only cookie set

2. **Login**
   - User provides email and password
   - Email lookup in database
   - Password verified with bcrypt
   - JWT token generated with 7-day expiration
   - HTTP-only cookie set
   - Redirect based on role

3. **Session Management**
   - JWT token stored in HTTP-only cookie
   - Token verified on each protected route
   - Token contains: userId, email, role
   - Automatic expiration after 7 days

### Authorization

**Role-Based Access Control:**
- **User Role**: Can access public pages, cart, orders, profile
- **Admin Role**: Full access including admin dashboard

**Protected Routes:**
- Admin routes: `/admin/**` - Requires admin role
- User routes: `/cart`, `/orders`, `/checkout` - Requires authentication
- Middleware: `src/routes/admin/+layout.server.ts` checks admin role

**Implementation:**
```typescript
// src/lib/utils/auth.ts
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
    if (!user) throw redirect(302, '/auth/login');
}

export function requireAdmin(user: AuthUser | null) {
    requireAuth(user);
    if (user.role !== 'admin') throw error(403, 'Admin access required');
}
```

---

## 👤 User Flows

### 1. New User Registration & First Purchase
```
1. Visit homepage
2. Click "Register"
3. Fill registration form
4. Account created → Auto-login
5. Browse products
6. Add products to cart
7. View cart
8. Proceed to checkout
9. Fill shipping details
10. Complete order
11. Receive confirmation email
12. View order in "My Orders"
```

### 2. Build PC Flow
```
1. Login to account
2. Navigate to PC Builder
3. Select components (CPU, GPU, RAM, etc.)
4. View total price
5. (Optional) Click "Energy Calculator"
   - View power consumption
   - See electricity costs
6. (Optional) Click "AI Pre-built Builds"
   - Select use case (Gaming/Work)
   - Enter budget
   - View AI-recommended builds
   - Apply best build
7. Click "Save PC Build"
8. Enter build name
9. Build saved
10. Click "Add to Cart" → All components added
11. Proceed to checkout
```

### 3. Admin Product Management
```
1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Products"
4. View product list
5. Click "Create Product"
6. Fill product form
   - Name, description, price
   - Upload image
   - Select category
   - Set stock
7. Save product
8. Product appears in list
9. Can edit/delete as needed
```

### 4. Review Product
```
1. Purchase a product (complete order)
2. Visit product page
3. Scroll to reviews section
4. Click "Write Review"
5. Select rating (1-5 stars)
6. Write comment
7. Submit review
8. Review appears after moderation (if enabled)
```

---

## 📁 Code Organization

### Models (src/lib/models/)

**Purpose**: Database operations and data structure definitions

**Example: ProductModel.ts**
```typescript
export class ProductModel {
    static async getAll(): Promise<ProductModel[]> {
        // Database query
    }
    
    static async getById(id: string): Promise<ProductModel | null> {
        // Database query
    }
    
    static async create(data: CreateProductData): Promise<ProductModel> {
        // Database insert
    }
    
    toJSON(): Product {
        // Convert to plain object
    }
}
```

### Controllers (src/lib/controllers/)

**Purpose**: Business logic and request coordination

**Example: ProductController.ts**
```typescript
export class ProductController {
    async loadProductsList() {
        // 1. Get products from model
        // 2. Apply filters
        // 3. Return formatted data
    }
    
    async createProduct() {
        // 1. Validate input
        // 2. Upload image
        // 3. Create product via model
        // 4. Return success/error
    }
}
```

### Routes (src/routes/)

**Structure:**
- `+page.server.ts` - Server-side logic (Load functions & Actions)
- `+page.svelte` - Client-side UI
- `+layout.server.ts` - Layout-level server logic

**Load Function**: Runs on server, provides data to page
**Actions**: Handle form submissions

### Utils (src/lib/utils/)

**Purpose**: Reusable helper functions

- `auth.ts` - Authentication helpers
- `energy.ts` - Energy calculations
- `pc-builder.ts` - PC builder utilities
- `email.ts` - Email sending
- `storage.ts` - Image upload
- `ai.ts` - AI integrations

---

## 🔒 Security Implementation

### Password Security
- **Hashing**: Bcrypt with 10 salt rounds
- **Storage**: Never store plain passwords
- **Verification**: Compare hashed passwords only

### Session Security
- **JWT Tokens**: Signed with secret key
- **HTTP-only Cookies**: Prevents XSS attacks
- **Expiration**: 7-day token expiration
- **Secure Flag**: Enabled in production

### Input Validation
- **Server-side validation**: All inputs validated on server
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: SvelteKit auto-escaping
- **CSRF Protection**: SvelteKit built-in protection

### Access Control
- **Role-based**: User and Admin roles
- **Route Protection**: Middleware checks on protected routes
- **API Protection**: Authentication required for user APIs

---

## 🤖 AI Features

### Gemini AI Integration

**1. Product Analysis** (`src/lib/utils/ai.ts`)
- Analyzes products for recommendations
- Generates product descriptions
- Provides use-case-specific insights

**2. Pre-built Builds** (`src/routes/api/pc-builder/ai-prebuilt/+server.ts`)
- Generates PC builds based on use case and budget
- Recommends best build option
- Provides detailed component analysis

**3. AI Assistant** (`src/routes/api/pc-builder/ai-suggest/+server.ts`)
- Answers PC building questions
- Suggests components
- Provides technical advice

### OpenAI Integration
- Review moderation
- Sentiment analysis
- Content generation

---

## 📊 Key Metrics & Calculations

### Revenue Calculation
```typescript
// Total Revenue = Sum of all order totals
SELECT SUM(total_amount) FROM orders WHERE status = 'completed';
```

### Profit Calculation
```typescript
// Profit = Revenue - Cost
// Cost = Sum of (order_item.quantity * product.cost_price)
SELECT 
    SUM(oi.quantity * oi.price) as revenue,
    SUM(oi.quantity * p.cost_price) as cost,
    SUM(oi.quantity * oi.price) - SUM(oi.quantity * p.cost_price) as profit
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed';
```

### Energy Cost Calculation
```typescript
// Daily Cost = (Idle Power * 16 hours + Load Power * 8 hours) * Rate / 1000
const dailyKwh = (totalIdleWatts * 16 + totalLoadWatts * 8) / 1000;
const dailyCost = dailyKwh * ELECTRICITY_RATE; // 6.5 Taka per kWh
```

---

## 🚀 Deployment

### Environment Variables Required
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key (optional)
OPENAI_API_KEY=your_openai_key (optional)
```

### Build Process
```bash
npm run build  # Creates optimized production build
npm run preview  # Test production build locally
```

### Vercel Deployment
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

---

## ✅ Feature Checklist

- ✅ User Authentication & Registration
- ✅ Product Management (CRUD)
- ✅ Shopping Cart
- ✅ Checkout Process
- ✅ Order Management
- ✅ Product Reviews & Ratings
- ✅ Product Comparison
- ✅ PC Builder Tool
- ✅ AI Pre-built Builds
- ✅ Energy Consumption Calculator
- ✅ Community Builds
- ✅ Admin Dashboard
- ✅ Sales Reports
- ✅ Profit/Loss Reports
- ✅ Inventory Management
- ✅ Email Notifications
- ✅ Search & Filtering
- ✅ Responsive Design

---

## 📝 Summary for VIVA

### What is this project?
A complete e-commerce platform for PC components with advanced features like AI-powered recommendations, PC builder, energy calculations, and comprehensive admin management.

### Key Technologies
- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: SvelteKit Server (Node.js)
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini & OpenAI

### Architecture
- **MVC Pattern**: Clear separation of concerns
- **Models**: Data access layer
- **Controllers**: Business logic
- **Views**: UI presentation

### Unique Features
1. **AI-Powered PC Builds**: Gemini AI generates optimized builds
2. **Energy Calculator**: Real-time power consumption analysis
3. **Community Features**: Share and rate PC builds
4. **Comprehensive Admin**: Full dashboard with analytics

### Security
- JWT authentication
- Bcrypt password hashing
- HTTP-only cookies
- Role-based access control
- Input validation

### Database
- 20+ tables
- Foreign key relationships
- Triggers for stock management
- Indexes for performance

---

**Document Version**: 1.0  
**Last Updated**: Current  
**Project Status**: ✅ Production Ready

---

*This documentation covers all aspects of the TinyTech e-commerce platform for viva presentation.*

