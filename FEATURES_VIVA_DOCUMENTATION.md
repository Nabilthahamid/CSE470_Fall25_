# TinyTech E-Commerce - Feature Documentation for VIVA

## 📋 Table of Contents

1. [Product Comparison Feature](#1-product-comparison-feature)
2. [Review System Feature](#2-review-system-feature)
3. [Admin Product Management (Add, Edit, Delete)](#3-admin-product-management-add-edit-delete)
4. [Discount & Coupons System](#4-discount--coupons-system)
5. [Order System (User & Admin)](#5-order-system-user--admin)

---

## 1. Product Comparison Feature

### 📝 Overview

Allows users to compare up to 4 products side-by-side. Uses browser localStorage for client-side storage and fetches product details from database.

### 🔄 Complete Workflow

#### Step 1: Add Product to Comparison

```
User clicks "Add to Compare" button
    ↓
src/routes/+page.svelte
    └── handleCompareToggle(productId)
        ↓
src/lib/utils/comparison.ts
    └── addToComparison(productId)
        ├── Check localStorage: 'product_comparison'
        ├── Validate: Max 4 products
        ├── Check: Product not already added
        └── Save to localStorage
```

**Files Involved:**

- `src/routes/+page.svelte` - Home page with product cards
- `src/lib/utils/comparison.ts` - Comparison utility functions

**Code Flow:**

```typescript
// src/lib/utils/comparison.ts
export function addToComparison(productId: string) {
	const current = getComparisonProducts(); // Read from localStorage
	if (current.includes(productId)) {
		return { success: false, message: 'Already in comparison' };
	}
	if (current.length >= 4) {
		return { success: false, message: 'Maximum 4 products' };
	}
	current.push(productId);
	localStorage.setItem('product_comparison', JSON.stringify(current));
}
```

#### Step 2: View Comparison Page

```
User navigates to /compare
    ↓
src/routes/compare/+page.server.ts (Load)
    └── Returns empty object (handled client-side)
        ↓
src/routes/compare/+page.svelte (onMount)
    └── loadComparisonProducts()
```

#### Step 3: Fetch Product IDs from localStorage

```
src/routes/compare/+page.svelte
    └── getComparisonProducts()
        ↓
src/lib/utils/comparison.ts
    └── localStorage.getItem('product_comparison')
        ↓
Returns: ['product-id-1', 'product-id-2', 'product-id-3']
```

#### Step 4: Fetch Product Details from Database

```
src/routes/compare/+page.svelte
    └── fetch('/api/admin/quick-search?q=')
        ↓
src/routes/api/admin/quick-search/+server.ts
    └── GET handler
        ↓
src/lib/models/ProductModel.ts
    └── getAll()
        ↓
DATABASE QUERY
```

**SQL Query Executed:**

```sql
-- Executed by ProductModel.getAll()
SELECT
    id,
    name,
    description,
    price,
    cost_price,
    stock,
    image_url,
    component_category_id,
    brand,
    specifications,
    tags,
    slug,
    meta_title,
    meta_description,
    images,
    created_at,
    updated_at
FROM products
ORDER BY created_at DESC;
```

**Code Implementation:**

```typescript
// src/lib/models/ProductModel.ts
static async getAll(): Promise<ProductModel[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(p => new ProductModel(p));
}
```

#### Step 5: Filter Products for Comparison

```
API returns all products
    ↓
src/routes/compare/+page.svelte
    └── Filter products
        ├── Get IDs from localStorage: ['id1', 'id2', 'id3']
        ├── Filter: products.filter(p => comparisonIds.includes(p.id))
        └── Sort to match localStorage order
```

#### Step 6: Display Comparison Table

```
Filtered products ready
    ↓
src/routes/compare/+page.svelte renders
    └── Comparison Table
        ├── Header: Product images & names
        ├── Rows: Description, Price, Stock, Actions
        └── Side-by-side comparison display
```

### 🗄️ Database Schema

```sql
-- Products table (used for comparison)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    brand VARCHAR(255),
    specifications JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Note:** Comparison list is stored in browser localStorage, NOT in database.

### 🏗️ MVC Implementation

**MODEL Layer:**

- `src/lib/models/ProductModel.ts` - Fetches products from database

**VIEW Layer:**

- `src/routes/compare/+page.svelte` - UI display and user interactions
- `src/routes/+page.svelte` - Add to comparison button

**CONTROLLER Layer:**

- `src/routes/compare/+page.server.ts` - Server-side page load (minimal)
- `src/routes/api/admin/quick-search/+server.ts` - API endpoint for products

**UTILS Layer:**

- `src/lib/utils/comparison.ts` - localStorage management functions

### 📊 Data Flow Diagram

```
User Action → localStorage → API Call → Database → Filter → Display
```

---

## 2. Review System Feature

### 📝 Overview

Users can review products after purchase. Reviews include rating (1-5 stars) and optional comment. System validates purchase before allowing review.

### 🔄 Complete Workflow

#### Step 1: User Views Product

```
User visits /products/[id]
    ↓
src/routes/products/[id]/+page.server.ts (Load)
    ↓
src/lib/controllers/public/ProductDetailController.ts
    └── loadProductDetails(productId)
        ├── Get product details
        ├── Get all reviews for product
        ├── Calculate average rating
        ├── Check if user can review
        └── Get user's existing review (if any)
```

**SQL Queries:**

```sql
-- 1. Get product
SELECT * FROM products WHERE id = $1;

-- 2. Get reviews for product
SELECT
    r.*,
    p.name as product_name,
    u.name as user_name
FROM reviews r
LEFT JOIN products p ON r.product_id = p.id
LEFT JOIN users u ON r.user_id = u.id
WHERE r.product_id = $1
ORDER BY r.created_at DESC;

-- 3. Calculate average rating
SELECT AVG(rating) as avg_rating
FROM reviews
WHERE product_id = $1;

-- 4. Check if user purchased product
SELECT * FROM sales
WHERE user_id = $1 AND product_id = $2;

-- 5. Get user's review (if exists)
SELECT * FROM reviews
WHERE user_id = $1 AND product_id = $2;
```

#### Step 2: User Submits Review

```
User fills review form and submits
    ↓
src/routes/products/[id]/+page.server.ts (Action: createReview)
    ↓
src/lib/controllers/public/ProductDetailController.ts
    └── createReview(productId)
        ├── Validate user is logged in
        ├── Check if user purchased product
        ├── Check if user already reviewed
        ├── AI Moderation (optional)
        └── Create review
            ↓
src/lib/models/ReviewModel.ts
    └── create(input, userId)
        ├── Validate purchase (check sales table)
        ├── Check duplicate review
        ├── Insert review
        └── Update product average rating
```

**SQL Queries:**

```sql
-- 1. Check if user purchased product
SELECT * FROM sales
WHERE user_id = $1 AND product_id = $2;

-- 2. Check if already reviewed
SELECT id FROM reviews
WHERE user_id = $1 AND product_id = $2;

-- 3. Insert review
INSERT INTO reviews (
    product_id,
    user_id,
    rating,
    comment,
    created_at
) VALUES ($1, $2, $3, $4, NOW())
RETURNING *;

-- 4. Update product average rating
UPDATE products
SET avg_rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE product_id = $1
)
WHERE id = $1;
```

#### Step 3: Display Reviews

```
Reviews stored in database
    ↓
src/routes/products/[id]/+page.svelte
    └── Display reviews
        ├── Show rating stars
        ├── Show comment
        ├── Show user name
        └── Show date
```

### 🗄️ Database Schema

```sql
-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- Sales table (for validation)
CREATE TABLE sales (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER,
    price DECIMAL(10,2),
    order_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Products table (updated with avg_rating)
ALTER TABLE products ADD COLUMN avg_rating DECIMAL(3,2);
```

### 🏗️ MVC Implementation

**MODEL Layer:**

- `src/lib/models/ReviewModel.ts` - Review data access and business logic
  - `getAll()` - Get all reviews with filters
  - `getByProduct()` - Get reviews for a product
  - `create()` - Create new review with validation
  - `update()` - Update review (user's own only)
  - `delete()` - Delete review (user's own only)
  - `getProductAverageRating()` - Calculate average rating

**VIEW Layer:**

- `src/routes/products/[id]/+page.svelte` - Review form and display
- `src/lib/components/` - Review components (if any)

**CONTROLLER Layer:**

- `src/routes/products/[id]/+page.server.ts` - Page load and actions
- `src/lib/controllers/public/ProductDetailController.ts` - Review business logic
  - `loadProductDetails()` - Load product and reviews
  - `createReview()` - Handle review creation
  - `updateReview()` - Handle review update
  - `deleteReview()` - Handle review deletion

**UTILS Layer:**

- `src/lib/utils/ai.ts` - AI moderation for reviews

### 📊 Data Flow Diagram

```
Product Page → Check Purchase → Validate → AI Moderation → Create Review → Update Rating → Display
```

### 🔑 Key Business Rules

1. **Purchase Validation**: User must purchase product before reviewing
2. **One Review Per Product**: Each user can only review a product once
3. **Rating Validation**: Rating must be between 1-5
4. **AI Moderation**: Reviews go through AI moderation before approval
5. **Auto Update**: Product average rating updates automatically

---

## 3. Admin Product Management (Add, Edit, Delete)

### 📝 Overview

Admin can create, edit, and delete products. Includes image upload, category assignment, and stock management.

### 🔄 Complete Workflow

#### Feature 3.1: Add Product

**Step 1: Admin Opens Create Form**

```
Admin navigates to /admin/products
    ↓
src/routes/admin/products/+page.server.ts (Load)
    ↓
src/lib/controllers/admin/ProductController.ts
    └── loadProductsList()
        ├── Get all products
        ├── Get categories
        ├── Get brands
        └── Return data
```

**Step 2: Admin Fills Form**

```
Admin fills product form:
    - Name, Description
    - Price, Cost Price
    - Stock
    - Image (file upload or URL)
    - Category, Brand
    - Specifications
```

**Step 3: Form Submission**

```
Admin submits form
    ↓
src/routes/admin/products/+page.server.ts (Action: create)
    ↓
src/lib/controllers/admin/ProductController.ts
    └── createProduct()
        ├── Validate input
        ├── Upload image (if file provided)
        │   ↓
        │   src/lib/utils/storage.ts
        │   └── uploadImage()
        │       ↓
        │   Supabase Storage
        ├── Validate data
        └── Create product
            ↓
src/lib/models/ProductModel.ts
    └── create(input)
        ├── Validate business rules
        └── Insert to database
```

**SQL Query:**

```sql
-- Insert new product
INSERT INTO products (
    name,
    description,
    price,
    cost_price,
    stock,
    image_url,
    component_category_id,
    brand,
    specifications,
    created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
RETURNING *;
```

**Code Implementation:**

```typescript
// src/lib/models/ProductModel.ts
static async create(input: CreateProductDTO): Promise<ProductModel> {
    const product = new ProductModel({
        id: '', // Will be generated
        ...input,
        stock: input.stock || 0
    });

    product.validate(); // Business logic validation

    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            cost_price: product.cost_price,
            stock: product.stock,
            image_url: product.image_url,
            component_category_id: product.component_category_id,
            brand: product.brand,
            specifications: product.specifications,
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
    return new ProductModel(data);
}
```

#### Feature 3.2: Edit Product

**Step 1: Admin Opens Edit Page**

```
Admin clicks "Edit" on product
    ↓
src/routes/admin/products/[id]/edit/+page.server.ts (Load)
    └── Get product by ID
        ↓
src/lib/models/ProductModel.ts
    └── getById(id)
        ↓
DATABASE QUERY
```

**SQL Query:**

```sql
SELECT * FROM products WHERE id = $1;
```

**Step 2: Admin Updates Product**

```
Admin modifies form fields
    ↓
Admin submits form
    ↓
src/routes/admin/products/[id]/edit/+page.server.ts (Action)
    └── Handle update
        ├── Handle image upload/change
        ├── Validate data
        └── Update product
            ↓
src/lib/models/ProductModel.ts
    └── update(input)
        ├── Validate business rules
        └── Update database
```

**SQL Query:**

```sql
-- Update product
UPDATE products
SET
    name = $1,
    description = $2,
    price = $3,
    cost_price = $4,
    stock = $5,
    image_url = $6,
    component_category_id = $7,
    brand = $8,
    specifications = $9,
    updated_at = NOW()
WHERE id = $10
RETURNING *;
```

**Code Implementation:**

```typescript
// src/lib/models/ProductModel.ts
async update(input: UpdateProductDTO): Promise<ProductModel> {
    // Validate update data
    this.validateUpdate(input);

    // Build update object
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.stock !== undefined) updateData.stock = input.stock;
    // ... more fields

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update product: ${error.message}`);
    return new ProductModel(data);
}
```

#### Feature 3.3: Delete Product

**Step 1: Admin Initiates Delete**

```
Admin clicks "Delete" button
    ↓
Confirmation dialog
    ↓
Admin confirms deletion
    ↓
src/routes/admin/products/+page.server.ts (Action: delete)
    ↓
src/lib/controllers/admin/ProductController.ts
    └── deleteProduct()
        ├── Get product by ID
        └── Delete product
            ↓
src/lib/models/ProductModel.ts
    └── delete()
        └── Delete from database
```

**SQL Query:**

```sql
-- Delete product (CASCADE will delete related records)
DELETE FROM products WHERE id = $1;
```

**Code Implementation:**

```typescript
// src/lib/models/ProductModel.ts
async delete(): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', this.id);

    if (error) throw new Error(`Failed to delete product: ${error.message}`);
}
```

### 🗄️ Database Schema

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    component_category_id UUID REFERENCES component_categories(id),
    brand VARCHAR(255),
    specifications JSONB,
    tags TEXT[],
    slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    images TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(component_category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_created ON products(created_at);
```

### 🏗️ MVC Implementation

**MODEL Layer:**

- `src/lib/models/ProductModel.ts` - Product data access
  - `getAll()` - Get all products
  - `getById()` - Get single product
  - `create()` - Create new product
  - `update()` - Update existing product
  - `delete()` - Delete product
  - `validate()` - Business logic validation

**VIEW Layer:**

- `src/routes/admin/products/+page.svelte` - Product list and create form
- `src/routes/admin/products/[id]/edit/+page.svelte` - Edit product form

**CONTROLLER Layer:**

- `src/routes/admin/products/+page.server.ts` - Page load and actions
- `src/routes/admin/products/[id]/edit/+page.server.ts` - Edit page load and action
- `src/lib/controllers/admin/ProductController.ts` - Business logic
  - `loadProductsList()` - Load products with filters
  - `createProduct()` - Handle product creation
  - `deleteProduct()` - Handle product deletion

**UTILS Layer:**

- `src/lib/utils/storage.ts` - Image upload to Supabase Storage
- `src/lib/utils/media.ts` - Media tracking utilities

### 📊 Data Flow Diagrams

**Create Product:**

```
Admin Form → Controller → Validate → Upload Image → Model → Database → Success
```

**Edit Product:**

```
Admin Form → Controller → Load Product → Validate → Upload Image (if changed) → Model → Database → Success
```

**Delete Product:**

```
Admin Action → Controller → Load Product → Model → Database DELETE → Cascade Delete → Success
```

### 🔑 Key Business Rules

1. **Validation**: Name min 2 chars, description min 5 chars
2. **Price Validation**: Price cannot be negative
3. **Stock Validation**: Stock cannot be negative
4. **Image Handling**: Supports file upload or URL
5. **Cascade Delete**: Deleting product deletes related reviews, cart items, etc.

---

## 4. Discount & Coupons System

### 📝 Overview

Admin can create discount codes/coupons. Users can apply coupons during checkout. System validates coupon codes and calculates discounts.

### 🔄 Complete Workflow

#### Feature 4.1: Admin Creates Discount

**Step 1: Admin Creates Discount**

```
Admin navigates to /admin/marketing/discounts
    ↓
Admin fills discount form:
    - Code (e.g., "SAVE20")
    - Discount Type (percentage/fixed/free_shipping)
    - Discount Value
    - Minimum Purchase
    - Usage Limits
    - Validity Dates
    ↓
Admin submits form
    ↓
src/routes/admin/marketing/discounts/+page.server.ts
    ↓
src/lib/utils/discount.ts
    └── createDiscount(discount)
        └── Insert to database
```

**SQL Query:**

```sql
-- Create discount
INSERT INTO discounts (
    code,
    name,
    description,
    discount_type,
    discount_value,
    minimum_purchase,
    max_discount_amount,
    max_uses,
    max_uses_per_user,
    starts_at,
    expires_at,
    is_active,
    applicable_product_ids,
    created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
RETURNING *;
```

#### Feature 4.2: User Applies Coupon at Checkout

**Step 1: User Enters Coupon Code**

```
User at checkout page
    ↓
User enters coupon code
    ↓
User clicks "Apply Coupon"
    ↓
POST /api/checkout/validate-coupon
    ↓
src/routes/api/checkout/validate-coupon/+server.ts
    └── Validate coupon
        ↓
src/lib/utils/discount.ts
    └── validateDiscount(code, userId, cartTotal, productIds)
```

**Step 2: Validate Coupon**

```
validateDiscount() function:
    ├── Check if coupon exists and is active
    ├── Check if coupon is expired
    ├── Check if coupon has started
    ├── Check minimum purchase amount
    ├── Check usage limits (total)
    ├── Check usage limits per user
    ├── Check if applicable to products in cart
    └── Return validation result
```

**SQL Queries:**

```sql
-- 1. Get discount by code
SELECT * FROM discounts
WHERE code = $1 AND is_active = true;

-- 2. Check total usage count
SELECT COUNT(*) FROM discount_usage
WHERE coupon_id = $1;

-- 3. Check user usage count
SELECT COUNT(*) FROM discount_usage
WHERE coupon_id = $1 AND user_id = $2;
```

**Code Implementation:**

```typescript
// src/lib/utils/discount.ts
export async function validateDiscount(
	code: string,
	userId: string,
	cartTotal: number,
	productIds: string[]
): Promise<{ valid: boolean; discount?: Discount; error?: string }> {
	// Get discount
	const { data: discount, error } = await supabase
		.from('discounts')
		.select('*')
		.eq('code', code.toUpperCase())
		.eq('is_active', true)
		.single();

	if (error || !discount) {
		return { valid: false, error: 'Invalid or expired coupon code' };
	}

	// Check expiration
	if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
		return { valid: false, error: 'Coupon code has expired' };
	}

	// Check minimum purchase
	if (discount.minimum_purchase && cartTotal < discount.minimum_purchase) {
		return { valid: false, error: `Minimum purchase of ${discount.minimum_purchase} required` };
	}

	// Check usage limits
	if (discount.max_uses) {
		const { count } = await supabase
			.from('discount_usage')
			.select('id', { count: 'exact', head: true })
			.eq('coupon_id', discount.id);

		if ((count || 0) >= discount.max_uses) {
			return { valid: false, error: 'Coupon code has reached its usage limit' };
		}
	}

	// Check user-specific limits
	if (userId && discount.max_uses_per_user) {
		const { count } = await supabase
			.from('discount_usage')
			.select('id', { count: 'exact', head: true })
			.eq('coupon_id', discount.id)
			.eq('user_id', userId);

		if ((count || 0) >= discount.max_uses_per_user) {
			return { valid: false, error: 'You have already used this coupon code' };
		}
	}

	return { valid: true, discount };
}
```

**Step 3: Calculate Discount Amount**

```
src/lib/utils/discount.ts
    └── calculateDiscountAmount(discount, cartTotal)
        ├── If percentage: (cartTotal * value) / 100
        ├── If fixed: discount value
        └── If free_shipping: 0 (handled separately)
```

**Code Implementation:**

```typescript
// src/lib/utils/discount.ts
export function calculateDiscountAmount(discount: Discount, cartTotal: number): number {
	if (discount.discount_type === 'percentage') {
		const amount = (cartTotal * discount.discount_value) / 100;
		// Apply max discount cap if set
		return Math.min(amount, discount.max_discount_amount || Infinity);
	} else if (discount.discount_type === 'fixed') {
		return Math.min(discount.discount_value, cartTotal);
	} else if (discount.discount_type === 'free_shipping') {
		return 0; // Shipping cost handled separately
	}
	return 0;
}
```

**Step 4: Apply Discount to Order**

```
User completes checkout
    ↓
src/routes/checkout/+page.server.ts (Action)
    ↓
src/lib/controllers/public/CheckoutController.ts
    └── processCheckout()
        ├── Calculate final total (cartTotal - discountAmount)
        ├── Create order with discount info
        └── Record discount usage
            ↓
src/lib/utils/discount.ts
    └── recordDiscountUsage(couponId, orderId, userId, discountAmount)
        └── Insert to discount_usage table
```

**SQL Query:**

```sql
-- Record discount usage
INSERT INTO discount_usage (
    coupon_id,
    order_id,
    user_id,
    discount_amount,
    used_at
) VALUES ($1, $2, $3, $4, NOW());
```

### 🗄️ Database Schema

```sql
-- Discounts table
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_purchase DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2), -- For percentage discounts
    max_uses INTEGER, -- Total usage limit
    max_uses_per_user INTEGER, -- Per user limit
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    applicable_product_ids UUID[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Discount usage tracking
CREATE TABLE discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES discounts(id),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES users(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(is_active);
CREATE INDEX idx_discount_usage_coupon ON discount_usage(coupon_id);
CREATE INDEX idx_discount_usage_user ON discount_usage(user_id);
```

### 🏗️ MVC Implementation

**MODEL Layer:**

- `src/lib/models/Discount.ts` - Discount data structure (interface)
- Database queries handled directly in utils (can be moved to DiscountModel)

**VIEW Layer:**

- `src/routes/admin/marketing/discounts/+page.svelte` - Admin discount management UI
- `src/routes/checkout/+page.svelte` - Coupon input field in checkout

**CONTROLLER Layer:**

- `src/routes/admin/marketing/discounts/+page.server.ts` - Admin discount actions
- `src/routes/api/checkout/validate-coupon/+server.ts` - Coupon validation API
- `src/lib/controllers/public/CheckoutController.ts` - Apply discount to order

**UTILS Layer:**

- `src/lib/utils/discount.ts` - Discount business logic
  - `validateDiscount()` - Validate coupon code
  - `calculateDiscountAmount()` - Calculate discount
  - `recordDiscountUsage()` - Track usage
  - `getAllDiscounts()` - Get all discounts
  - `createDiscount()` - Create discount
  - `updateDiscount()` - Update discount
  - `deleteDiscount()` - Delete discount

### 📊 Data Flow Diagrams

**Apply Coupon:**

```
User enters code → Validate → Check limits → Calculate discount → Apply to order → Record usage
```

**Create Discount:**

```
Admin form → Validate → Save to database → Available for use
```

### 🔑 Key Business Rules

1. **Code Uniqueness**: Each discount code must be unique
2. **Expiration**: Coupons can have start and end dates
3. **Usage Limits**: Total and per-user limits
4. **Minimum Purchase**: Can require minimum cart total
5. **Product Specific**: Can apply to specific products only
6. **Type Validation**: Percentage, fixed amount, or free shipping

---

## 5. Order System (User & Admin)

### 📝 Overview

Complete order management system. Users can place orders through checkout. Admins can view, update status, and manage orders.

### 🔄 Complete Workflow

#### Feature 5.1: User Places Order

**Step 1: User Adds Products to Cart**

```
User adds products to cart
    ↓
Cart stored in database (cart_items table)
```

**Step 2: User Proceeds to Checkout**

```
User clicks "Checkout"
    ↓
src/routes/checkout/+page.server.ts (Load)
    ↓
src/lib/controllers/public/CheckoutController.ts
    └── loadCheckout()
        ├── Get cart items
        ├── Calculate total
        ├── Get user profile (if logged in)
        └── Return checkout data
```

**SQL Queries:**

```sql
-- Get cart items
SELECT
    ci.*,
    p.name,
    p.price,
    p.image_url
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $1;

-- Calculate cart total
SELECT SUM(p.price * ci.quantity) as total
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $1;
```

**Step 3: User Fills Checkout Form**

```
User provides:
    - Customer name, email, phone
    - Shipping address
    - Shipping method
    - Payment method
    - Coupon code (optional)
```

**Step 4: User Submits Order**

```
User submits checkout form
    ↓
src/routes/checkout/+page.server.ts (Action)
    ↓
src/lib/controllers/public/CheckoutController.ts
    └── processCheckout()
        ├── Validate form data
        ├── Get cart items
        ├── Validate stock availability
        ├── Calculate totals (with discount)
        └── Create order
            ↓
src/lib/models/OrderModel.ts
    └── create(orderData, items, userId)
        ├── Validate order data
        ├── Check stock for all items
        ├── Insert order
        ├── Insert order items
        ├── Reduce product stock
        ├── Create sales records
        ├── Clear cart
        └── Record discount usage (if applicable)
```

**SQL Queries:**

```sql
-- 1. Create order
INSERT INTO orders (
    user_id,
    customer_name,
    customer_email,
    customer_address,
    customer_phone,
    customer_city,
    customer_postal_code,
    customer_country,
    shipping_method,
    payment_method,
    shipping_cost,
    coupon_code,
    coupon_id,
    discount_amount,
    total_amount,
    status,
    created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending', NOW())
RETURNING *;

-- 2. Insert order items
INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    price,
    created_at
) VALUES ($1, $2, $3, $4, NOW());

-- 3. Reduce product stock
UPDATE products
SET stock = stock - $1
WHERE id = $2;

-- 4. Create sale record
INSERT INTO sales (
    user_id,
    product_id,
    order_id,
    quantity,
    price,
    created_at
) VALUES ($1, $2, $3, $4, $5, NOW());

-- 5. Clear cart
DELETE FROM cart_items WHERE user_id = $1;

-- 6. Record discount usage (if applicable)
INSERT INTO discount_usage (
    coupon_id,
    order_id,
    user_id,
    discount_amount,
    used_at
) VALUES ($1, $2, $3, $4, NOW());
```

**Code Implementation:**

```typescript
// src/lib/models/OrderModel.ts
static async create(input: CreateOrderDTO, items: OrderItemInput[], userId?: string): Promise<OrderModel> {
    // Get cart items if items array is empty
    if (items.length === 0 && userId) {
        const cartItems = await CartModel.getCartItems(userId);
        items = cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        }));
    }

    // Validate and calculate totals
    let subtotal = 0;
    for (const item of items) {
        const product = await ProductModel.getById(item.product_id);
        if (!product) throw new Error(`Product ${item.product_id} not found`);
        if (!product.isInStock(item.quantity)) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }
        subtotal += product.price * item.quantity;
    }

    const totalAmount = subtotal + (input.shipping_cost || 0) - (input.discount_amount || 0);

    // Create order
    const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
            user_id: userId || null,
            customer_name: input.customer_name,
            customer_email: input.customer_email,
            customer_address: input.customer_address,
            shipping_method: input.shipping_method,
            payment_method: input.payment_method,
            shipping_cost: input.shipping_cost || 0,
            coupon_code: input.coupon_code,
            coupon_id: input.coupon_id,
            discount_amount: input.discount_amount || 0,
            total_amount: totalAmount,
            status: 'pending',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);

    const order = new OrderModel(orderData);

    // Create order items and reduce stock
    for (const item of items) {
        const product = await ProductModel.getById(item.product_id);
        if (!product) continue;

        // Insert order item
        await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: product.price
        });

        // Reduce stock
        await product.updateStock(-item.quantity);

        // Create sale record
        await SaleModel.create({
            user_id: userId || null,
            product_id: item.product_id,
            order_id: order.id,
            quantity: item.quantity,
            price: product.price
        });
    }

    // Clear cart
    if (userId) {
        await CartModel.clearCart(userId);
    }

    return order;
}
```

**Step 5: Order Confirmation**

```
Order created successfully
    ↓
Send confirmation email
    ↓
Redirect to /checkout/success?order_id=...
```

#### Feature 5.2: User Views Orders

**Step 1: User Navigates to Orders**

```
User visits /orders
    ↓
src/routes/orders/+page.server.ts (Load)
    ↓
src/lib/controllers/public/OrderController.ts
    └── loadUserOrders()
        ↓
src/lib/models/OrderModel.ts
    └── getByUserId(userId)
        ↓
DATABASE QUERY
```

**SQL Query:**

```sql
-- Get user orders
SELECT
    o.*,
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

**Step 2: Display Orders**

```
src/routes/orders/+page.svelte
    └── Display order list
        ├── Order ID
        ├── Date
        ├── Status
        ├── Total amount
        └── Order items
```

#### Feature 5.3: Admin Views All Orders

**Step 1: Admin Navigates to Orders**

```
Admin visits /admin/orders
    ↓
src/routes/admin/orders/+page.server.ts (Load)
    ↓
src/lib/controllers/admin/OrderController.ts
    └── loadOrdersList()
        ├── Apply filters (status, date range, search)
        ├── Get all orders
        ├── Calculate risk scores (AI)
        └── Return orders
```

**SQL Query:**

```sql
-- Get all orders with filters
SELECT
    o.*,
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE
    ($1::text IS NULL OR o.status = $1::text)
    AND ($2::timestamp IS NULL OR o.created_at >= $2::timestamp)
    AND ($3::timestamp IS NULL OR o.created_at <= $3::timestamp)
GROUP BY o.id
ORDER BY o.created_at DESC;
```

#### Feature 5.4: Admin Updates Order Status

**Step 1: Admin Updates Status**

```
Admin selects new status
    ↓
Admin submits form
    ↓
src/routes/admin/orders/+page.server.ts (Action: updateStatus)
    ↓
src/lib/controllers/admin/OrderController.ts
    └── updateOrderStatus()
        ├── Get order by ID
        └── Update status
            ↓
src/lib/models/OrderModel.ts
    └── updateStatus(status, trackingNumber, notes, adminId)
        ├── Validate status transition
        ├── Update order
        └── Create status history record
```

**SQL Queries:**

```sql
-- Update order status
UPDATE orders
SET
    status = $1,
    tracking_number = $2,
    updated_at = NOW()
WHERE id = $3;

-- Create status history
INSERT INTO order_status_history (
    order_id,
    status,
    notes,
    changed_by,
    changed_at
) VALUES ($1, $2, $3, $4, NOW());
```

**Code Implementation:**

```typescript
// src/lib/models/OrderModel.ts
async updateStatus(
    status: OrderStatus,
    trackingNumber?: string,
    notes?: string,
    adminId?: string
): Promise<OrderModel> {
    // Update order
    const updateData: any = {
        status,
        updated_at: new Date().toISOString()
    };

    if (trackingNumber) updateData.tracking_number = trackingNumber;

    const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update order status: ${error.message}`);

    // Create status history
    await supabase.from('order_status_history').insert({
        order_id: this.id,
        status,
        notes: notes || null,
        changed_by: adminId || null,
        changed_at: new Date().toISOString()
    });

    return new OrderModel(data);
}
```

### 🗄️ Database Schema

```sql
-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_phone VARCHAR(50),
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(20),
    customer_country VARCHAR(100),
    shipping_method VARCHAR(50),
    payment_method VARCHAR(50),
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    coupon_code VARCHAR(50),
    coupon_id UUID REFERENCES discounts(id),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    shipping_date TIMESTAMP,
    delivery_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sales table (for tracking purchases)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order status history
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_product ON sales(product_id);
```

### 🏗️ MVC Implementation

**MODEL Layer:**

- `src/lib/models/OrderModel.ts` - Order data access
  - `getAll()` - Get all orders with filters
  - `getById()` - Get single order with items
  - `getByUserId()` - Get user's orders
  - `create()` - Create new order (handles stock reduction, sales, cart clearing)
  - `updateStatus()` - Update order status with history

**VIEW Layer:**

- `src/routes/orders/+page.svelte` - User order list
- `src/routes/orders/[id]/+page.svelte` - Order details page
- `src/routes/admin/orders/+page.svelte` - Admin order management
- `src/routes/admin/orders/[id]/+page.svelte` - Admin order details

**CONTROLLER Layer:**

- `src/routes/checkout/+page.server.ts` - Checkout page load and process
- `src/routes/orders/+page.server.ts` - User orders page load
- `src/routes/admin/orders/+page.server.ts` - Admin orders page load and actions
- `src/lib/controllers/public/CheckoutController.ts` - Checkout business logic
- `src/lib/controllers/public/OrderController.ts` - User order logic
- `src/lib/controllers/admin/OrderController.ts` - Admin order management logic

**UTILS Layer:**

- `src/lib/utils/email.ts` - Send order confirmation emails
- `src/lib/utils/discount.ts` - Discount validation and application
- `src/lib/utils/ai.ts` - AI risk scoring for orders

### 📊 Data Flow Diagrams

**Place Order:**

```
Checkout Form → Validate → Get Cart → Check Stock → Calculate Total → Create Order →
Insert Items → Reduce Stock → Create Sales → Clear Cart → Send Email → Redirect
```

**View Orders (User):**

```
/orders → Get User ID → Query Orders → Load Items → Display
```

**View Orders (Admin):**

```
/admin/orders → Apply Filters → Query All Orders → Calculate Risk → Display
```

**Update Order Status:**

```
Admin selects status → Validate → Update Order → Create History → Refresh
```

### 🔑 Key Business Rules

1. **Stock Validation**: Check stock before creating order
2. **Atomic Operation**: Order creation includes multiple steps (transaction-like)
3. **Cart Clearing**: Cart cleared after successful order
4. **Stock Reduction**: Product stock reduced when order created
5. **Sales Tracking**: Each order item creates a sale record
6. **Status History**: All status changes are tracked
7. **Email Notification**: Order confirmation email sent

---

## 📊 Summary: MVC Implementation Across All Features

### Common MVC Pattern

**MODEL Layer (`src/lib/models/`):**

- Data structures and types
- Database access methods
- Business logic validation
- Example: `ProductModel.ts`, `OrderModel.ts`, `ReviewModel.ts`

**VIEW Layer (`src/routes/**/\*.svelte`):\*\*

- UI components and pages
- User interactions
- Display data from controllers
- Example: `+page.svelte` files

**CONTROLLER Layer (`src/routes/**/+page.server.ts`&`src/lib/controllers/`):\*\*

- Handle HTTP requests
- Coordinate between Models and Views
- Load data for pages
- Handle form submissions
- Example: `+page.server.ts` files and Controller classes

**UTILS Layer (`src/lib/utils/`):**

- Reusable helper functions
- Business logic utilities
- Third-party integrations
- Example: `discount.ts`, `comparison.ts`, `energy.ts`

### MVC Flow Example (Order Creation)

```
1. User submits checkout form
   ↓
2. CONTROLLER: src/routes/checkout/+page.server.ts receives request
   ↓
3. CONTROLLER: CheckoutController.processCheckout() handles business logic
   ↓
4. MODEL: OrderModel.create() performs database operations
   ↓
5. MODEL: ProductModel checks stock, reduces inventory
   ↓
6. MODEL: CartModel clears cart
   ↓
7. CONTROLLER: Returns success response
   ↓
8. VIEW: Redirects to success page
```

---

## 🎯 VIVA Presentation Points

### For Each Feature, Explain:

1. **Purpose**: What the feature does
2. **User Flow**: Step-by-step how users interact
3. **MVC Layers**: Which files handle what
4. **Database**: Tables and queries used
5. **Business Rules**: Validation and constraints
6. **Data Flow**: Request → Processing → Response

### Key Points to Emphasize:

1. **Separation of Concerns**: Clear MVC boundaries
2. **Data Validation**: Both client and server-side
3. **Database Integrity**: Foreign keys, constraints
4. **Error Handling**: Proper error messages
5. **Security**: Authentication, authorization checks
6. **Scalability**: Indexed queries, efficient operations

---

**Document Version**: 1.0  
**Last Updated**: Current  
**Purpose**: Complete VIVA documentation for 5 major features
