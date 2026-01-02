# TinyTech - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Admin Features](#admin-features)
6. [AI-Powered Features](#ai-powered-features)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Services Layer](#services-layer)
10. [Components](#components)
11. [Setup & Installation](#setup--installation)
12. [Deployment](#deployment)

---

## Project Overview

**TinyTech** is a modern, full-featured e-commerce platform specializing in PC components and custom PC builds. Built with **SvelteKit**, **TypeScript**, and **Supabase**, it follows a clean **Model-View-Controller (MVC)** architectural pattern.

### Key Highlights
- ✅ Complete e-commerce functionality (products, cart, checkout, orders)
- ✅ Custom PC Builder with compatibility checking
- ✅ Community Build Sharing & Discovery
- ✅ AI-Powered features (recommendations, analysis, insights)
- ✅ Comprehensive Admin Dashboard
- ✅ Energy Efficiency Calculator
- ✅ Multi-language support infrastructure
- ✅ Advanced product comparison
- ✅ Review & rating system

---

## Technology Stack

### Frontend
- **SvelteKit 2.0** - Full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization

### Backend
- **Supabase** - Database, Authentication, Storage
- **PostgreSQL** - Relational database
- **Node.js** - Runtime environment

### AI & External Services
- **OpenAI API** - AI-powered insights and recommendations
- **Google Gemini AI** - Enhanced AI features
- **bcryptjs** - Password hashing
- **JOSE** - JWT handling

### Development Tools
- **Vite** - Build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Svelte Check** - Type checking

---

## Architecture

### MVC Pattern Implementation

```
src/
├── lib/
│   ├── models/          # MODEL: Data structures, types, interfaces
│   ├── services/        # SERVICE: Business logic & data access
│   ├── components/      # VIEW: Reusable UI components
│   ├── config/          # Configuration (Supabase, etc.)
│   └── utils/           # Utility functions
├── routes/
│   ├── +page.svelte     # VIEW: Pages
│   ├── +page.server.ts  # CONTROLLER: Server-side logic
│   └── [id]/            # Dynamic routes
└── app.html            # HTML template
```

### Data Flow
```
User Request → Controller (+page.server.ts)
    ↓
Service Layer (Business Logic)
    ↓
Supabase (Database)
    ↓
Response → View (+page.svelte)
```

---

## Core Features

### 1. User Authentication & Management
- **Registration** (`/auth/register`)
  - Email validation
  - Password hashing with bcryptjs
  - Role-based access (user/admin)
  
- **Login** (`/auth/login`)
  - Session management
  - JWT-based authentication
  
- **Logout** (`/auth/logout`)
  - Session cleanup

- **User Profile** (`/profile`)
  - View and edit profile
  - Order history
  - Saved builds

### 2. Product Catalog
- **Product Listing** (`/products`)
  - Browse all products
  - Category filtering
  - Search functionality
  - Pagination

- **Product Details** (`/products/[id]`)
  - Detailed product information
  - Specifications
  - Reviews and ratings
  - Related products
  - Add to cart

- **Product Comparison** (`/compare`)
  - Compare multiple products side-by-side
  - AI-powered comparison insights
  - Feature comparison matrix

### 3. Shopping Cart & Checkout
- **Shopping Cart** (`/cart`)
  - Add/remove items
  - Update quantities
  - Price calculations
  - Cart insights (AI-powered)

- **Checkout** (`/checkout`)
  - Shipping address
  - Payment processing
  - Order confirmation
  - Order tracking

- **Order Management** (`/orders`)
  - View order history
  - Order details
  - Order status tracking
  - Order cancellation/returns

### 4. PC Builder
- **PC Builder Interface** (`/pc-builder`)
  - Component selection by category:
    - CPU
    - GPU
    - Motherboard
    - RAM
    - Storage
    - PSU (Power Supply)
    - Case
    - Cooling
  - Real-time compatibility checking
  - Price calculation
  - Save builds
  - Add entire build to cart
  - Share to community
  - Energy efficiency calculator

- **PC Builder Features**
  - Component compatibility validation
  - Budget planning
  - AI-powered build suggestions
  - AI build optimization
  - Pre-built templates
  - Build templates management

### 5. Community Builds
- **Community Gallery** (`/community-builds`)
  - Browse shared PC builds
  - Filter by use case (gaming, workstation, streaming, editing)
  - Filter by price range
  - Sort by popularity, rating, price, date
  - Featured builds
  - Popular builds

- **Build Details** (`/community-builds/[id]`)
  - Full build specifications
  - Component list with prices
  - User ratings and reviews
  - Comments section
  - Like/unlike functionality
  - Similar builds recommendation
  - Share functionality

- **Build Sharing**
  - Share builds to community
  - Add use case tags
  - Add custom tags
  - Upload build images
  - Make builds public/private

### 6. Energy Efficiency Calculator
- **Energy Analysis** (`/pc-builder` - Energy Calculator)
  - Calculate total power consumption
  - Idle, load, and peak power usage
  - Electricity cost estimation
  - Carbon footprint calculation
  - PSU recommendations
  - Energy-efficient alternatives

### 7. Reviews & Ratings
- **Product Reviews** (`/products/[id]`)
  - User reviews
  - Star ratings (1-5)
  - Review moderation
  - Sentiment analysis
  - Review summaries

- **Build Ratings** (`/community-builds/[id]`)
  - Rate community builds
  - Average rating display
  - Rating distribution

### 8. FAQ System
- **FAQ Page** (`/faq`)
  - Public FAQ display
  - Categorized questions
  - Search functionality
  - Published/unpublished management

### 9. User Features
- **User Dashboard** (`/users`)
  - User list (admin)
  - User details
  - User management

---

## Admin Features

### Admin Dashboard (`/admin`)
- **Overview**
  - KPI Dashboard
  - Quick actions
  - Recent activity
  - Statistics widgets

### 1. Product Management (`/admin/products`)
- **Product CRUD**
  - Create, read, update, delete products
  - Product variants management
  - Product templates
  - Bulk operations
  - Product images
  - Stock management
  - Price management

- **Product Templates** (`/admin/products/templates`)
  - Create reusable product templates
  - Template-based product creation

- **Product Variants** (`/admin/products/[id]/variants`)
  - Manage product variants
  - Variant-specific pricing
  - Variant stock tracking

### 2. Order Management (`/admin/orders`)
- View all orders
- Order status updates
- Order details
- Order filtering and search
- Order analytics

### 3. Inventory Management (`/admin/inventory`)
- **Stock Tracking** (`/admin/inventory/tracking`)
  - Real-time stock levels
  - Low stock alerts
  - Stock history

- **Bulk Operations** (`/admin/inventory/bulk-operations`)
  - Bulk stock updates
  - Bulk price updates
  - Import/export

- **Low Stock Check** (`/admin/check-low-stock`)
  - Automated low stock detection
  - Alert system

### 4. User Management (`/admin/users`)
- User list
- User details
- Role management
- User activity tracking

### 5. Content Management (`/admin/content`)
- **FAQ Management**
  - Create, edit, delete FAQs
  - Publish/unpublish FAQs
  - Category management

### 6. Marketing (`/admin/marketing`)
- **Campaigns** (`/admin/marketing/campaigns`)
  - Create promotional campaigns
  - Campaign analytics
  - Campaign scheduling

- **Discounts** (`/admin/marketing/discounts`)
  - Create discount codes
  - Percentage/fixed discounts
  - Usage limits
  - Expiry dates

- **Email Marketing** (`/admin/marketing/email`)
  - Email campaign management
  - Subscriber lists
  - Email templates

### 7. Financial Management
- **Sales Reports** (`/admin/sales-report`)
  - Sales analytics
  - Revenue tracking
  - Sales trends

- **Profit & Loss** (`/admin/profit-loss`)
  - P&L statements
  - Cost analysis
  - Margin calculations

- **Financial Dashboard** (`/admin/financial`)
  - Financial overview
  - Revenue metrics
  - Expense tracking

### 8. Shipping Management (`/admin/shipping`)
- Shipping methods
- Shipping rates
- Shipping zones
- Order tracking

### 9. Returns Management (`/admin/returns`)
- Return requests
- Return processing
- Refund management
- Return analytics

### 10. Analytics (`/admin/analytics`)
- Sales analytics
- User analytics
- Product performance
- Traffic analytics

### 11. Media Management (`/admin/media`)
- Image upload
- Media library
- File management
- Image optimization

### 12. KPI Dashboard (`/admin/kpi-dashboard`)
- Key performance indicators
- Revenue metrics
- Order metrics
- User metrics
- Product metrics

---

## AI-Powered Features

### 1. AI Service (`AIService.ts`)
- **Product Comparison Insights**
  - Best value recommendations
  - Best for gaming/work recommendations
  - Performance analysis
  - AI-generated summaries

- **Sales Predictions**
  - Future sales forecasting
  - Trend analysis

- **Stock Recommendations**
  - Optimal stock levels
  - Reorder suggestions

### 2. Enhanced AI Service (`EnhancedAIService.ts`)
- **Customer Lifetime Value (CLV)**
  - Predict customer value
  - Segmentation

- **Churn Prediction**
  - Identify at-risk customers
  - Retention strategies

- **Order Risk Scoring**
  - Fraud detection
  - Risk assessment

- **Product Performance Analysis**
  - Product insights
  - Performance metrics

- **Price Optimization**
  - Dynamic pricing suggestions
  - Market analysis

### 3. AI-Powered Recommendations
- **User Recommendations** (`/api/user/recommendations`)
  - Personalized product suggestions
  - Based on purchase history
  - Collaborative filtering

- **Gift Recommendations** (`/api/gifts/find`)
  - Gift suggestions
  - Budget-based recommendations
  - Occasion-based suggestions

- **Shopping List Generation** (`/api/shopping-lists/generate`)
  - AI-generated shopping lists
  - Based on use case
  - Budget considerations

### 4. AI Product Features
- **Product Q&A** (`/api/products/[id]/qa`)
  - AI-powered product questions
  - Automated answers

- **Product Specs Translation** (`/api/products/[id]/specs/translate`)
  - Translate specifications
  - Multi-language support

- **Product Availability Prediction** (`/api/products/[id]/availability/predict`)
  - Predict product availability
  - Restock predictions

- **Similar Products** (`/api/products/[id]/similar`)
  - Find similar products
  - AI-powered matching

- **Smart Product Filtering** (`/api/products/filter/smart`)
  - AI-enhanced filtering
  - Intelligent search

### 5. AI PC Builder Features
- **AI Build Suggestions** (`/api/pc-builder/ai-suggest`)
  - AI-recommended components
  - Budget-based suggestions
  - Use case optimization

- **AI Build Optimization** (`/api/pc-builder/ai-optimize`)
  - Optimize existing builds
  - Performance improvements
  - Cost optimization

- **AI Pre-built Builds** (`/api/pc-builder/ai-prebuilt`)
  - Pre-configured builds
  - Use case templates

- **Compatibility Checking** (`/api/pc-builder/compatibility`)
  - Component compatibility
  - Real-time validation

- **Budget Planner** (`/api/pc-builder/budget-planner`)
  - Budget allocation
  - Component recommendations

### 6. AI Community Features
- **Similar Builds** (`/api/community-builds/[id]/similar`)
  - Find similar community builds
  - AI-powered matching

### 7. AI Review Features
- **Review Sentiment Analysis** (`/api/reviews/analyze-sentiment`)
  - Analyze review sentiment
  - Positive/negative detection

- **Review Summary** (`/api/reviews/summary`)
  - Generate review summaries
  - Key insights extraction

- **Advanced Review Analysis** (`/api/reviews/advanced-analysis`)
  - Comprehensive review analysis
  - Trend identification

### 8. AI Cart Features
- **Cart Insights** (`/api/cart/insights`)
  - Cart analysis
  - Recommendations

- **Cart Recommendations** (`/api/cart/recommendations`)
  - Product recommendations
  - Upsell suggestions

### 9. AI Search
- **Smart Search** (`/api/search/smart`)
  - Natural language search
  - Intent understanding
  - Contextual results

### 10. AI Support
- **Customer Support Triage** (`/api/support/triage`)
  - Automated ticket routing
  - Priority assignment
  - Category classification

### 11. AI User Features
- **User Behavior Insights** (`/api/user/behavior-insights`)
  - Shopping behavior analysis
  - Pattern recognition
  - Personalized insights

- **User Chat** (`/api/user/chat`)
  - AI chatbot
  - Customer support

### 12. AI Admin Features
- **AI Insights** (`/api/admin/ai-insights`)
  - Business insights
  - Trend analysis

- **AI Sales Analytics** (`/api/admin/ai-sales-analytics`)
  - Advanced sales analytics
  - Predictive analytics

- **AI Inventory Management** (`/api/admin/ai-inventory`)
  - Inventory optimization
  - Demand forecasting

- **AI Product Performance** (`/api/admin/ai-product-performance`)
  - Product analytics
  - Performance metrics

- **AI Price Optimization** (`/api/admin/ai-price-optimization`)
  - Dynamic pricing
  - Market analysis

- **AI Order Risk** (`/api/admin/ai-order-risk`)
  - Fraud detection
  - Risk scoring

- **AI Customer CLV** (`/api/admin/ai-customer-clv`)
  - Customer lifetime value
  - Segmentation

- **AI Churn Prediction** (`/api/admin/ai-churn-prediction`)
  - Churn analysis
  - Retention strategies

- **AI Generate Description** (`/api/admin/ai-generate-description`)
  - Auto-generate product descriptions
  - SEO optimization

- **Gemini Customer Analysis** (`/api/admin/gemini-customer-analysis`)
  - Customer insights using Gemini
  - Advanced analytics

- **Gemini Marketing Content** (`/api/admin/gemini-marketing-content`)
  - Generate marketing content
  - Campaign ideas

- **Gemini Sales Summary** (`/api/admin/gemini-sales-summary`)
  - Sales summaries
  - Executive reports

---

## Database Schema

### Core Tables

#### Users
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `name` (VARCHAR)
- `password_hash` (VARCHAR)
- `role` (VARCHAR, Default: 'user')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Products
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `cost_price` (DECIMAL)
- `stock` (INTEGER)
- `image_url` (TEXT)
- `specifications` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### PC Builds
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `total_price` (DECIMAL)
- `is_public` (BOOLEAN, Default: true)
- `likes_count` (INTEGER, Default: 0)
- `views_count` (INTEGER, Default: 0)
- `average_rating` (DECIMAL, Default: 0)
- `ratings_count` (INTEGER, Default: 0)
- `use_case` (VARCHAR)
- `tags` (TEXT[])
- `featured` (BOOLEAN, Default: false)
- `image_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### PC Build Components
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `category` (VARCHAR)
- `quantity` (INTEGER)
- `created_at` (TIMESTAMP)

#### Component Categories
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)

#### Build Likes
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)
- Unique constraint: (build_id, user_id)

#### Build Comments
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `comment` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Build Ratings
- `id` (UUID, Primary Key)
- `build_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `rating` (INTEGER, 1-5)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint: (build_id, user_id)

#### Cart
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Orders
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `total_amount` (DECIMAL)
- `status` (VARCHAR)
- `shipping_address` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Order Items
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `price` (DECIMAL)
- `created_at` (TIMESTAMP)

#### Reviews
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `rating` (INTEGER, 1-5)
- `comment` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### FAQs
- `id` (UUID, Primary Key)
- `question` (TEXT)
- `answer` (TEXT)
- `category` (VARCHAR)
- `is_published` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Additional Tables
- `sales` - Sales records
- `notifications` - User notifications
- `discounts` - Discount codes
- `campaigns` - Marketing campaigns
- `email_marketing` - Email campaigns
- `returns` - Return requests
- `shipping` - Shipping information
- `product_variants` - Product variants
- `product_templates` - Product templates
- `product_bundles` - Product bundles
- `product_reviews` - Product reviews
- `media` - Media files
- `content` - Content management

---

## API Endpoints

### Public Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/products/[id]/similar` - Get similar products
- `GET /api/products/[id]/qa` - Product Q&A
- `GET /api/products/[id]/availability/predict` - Predict availability
- `GET /api/products/[id]/specs/translate` - Translate specs
- `GET /api/products/[id]/translate` - Translate product
- `POST /api/products/filter/smart` - Smart product filtering

#### Community Builds
- `GET /api/community-builds` - Get all public builds
- `GET /api/community-builds/featured` - Get featured builds
- `GET /api/community-builds/popular` - Get popular builds
- `GET /api/community-builds/use-case` - Get builds by use case
- `GET /api/community-builds/[id]` - Get build by ID
- `POST /api/community-builds/[id]/share` - Share build
- `POST /api/community-builds/[id]/like` - Like/unlike build
- `POST /api/community-builds/[id]/comment` - Add comment
- `GET /api/community-builds/[id]/comments` - Get comments
- `POST /api/community-builds/[id]/rate` - Rate build
- `GET /api/community-builds/[id]/similar` - Get similar builds
- `POST /api/community-builds/[id]/make-public` - Make build public

#### PC Builder
- `POST /api/pc-builder/ai-suggest` - AI build suggestions
- `POST /api/pc-builder/ai-optimize` - Optimize build
- `POST /api/pc-builder/ai-prebuilt` - Get pre-built builds
- `POST /api/pc-builder/compatibility` - Check compatibility
- `POST /api/pc-builder/budget-planner` - Budget planning
- `POST /api/pc-builder/energy/calculate` - Calculate energy
- `POST /api/pc-builder/energy/alternatives` - Energy alternatives
- `POST /api/pc-builder/energy/psu-recommendation` - PSU recommendation

#### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `GET /api/cart/insights` - Cart insights
- `GET /api/cart/recommendations` - Cart recommendations

#### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `POST /api/reviews/analyze-sentiment` - Sentiment analysis
- `GET /api/reviews/summary` - Review summary
- `POST /api/reviews/advanced-analysis` - Advanced analysis
- `POST /api/reviews/moderate` - Moderate review

#### Search
- `POST /api/search/smart` - Smart search

#### User Features
- `GET /api/user/recommendations` - User recommendations
- `GET /api/user/behavior-insights` - Behavior insights
- `POST /api/user/chat` - User chat

#### Other
- `POST /api/gifts/find` - Find gifts
- `POST /api/shopping-lists/generate` - Generate shopping list
- `POST /api/support/triage` - Support triage
- `POST /api/bundles/suggest` - Suggest bundles
- `POST /api/chat` - Chat endpoint
- `POST /api/compare/analyze` - Compare products

### Admin Endpoints

#### Admin AI
- `GET /api/admin/ai-insights` - AI insights
- `GET /api/admin/ai-sales-analytics` - Sales analytics
- `GET /api/admin/ai-inventory` - Inventory AI
- `GET /api/admin/ai-product-performance` - Product performance
- `POST /api/admin/ai-price-optimization` - Price optimization
- `POST /api/admin/ai-order-risk` - Order risk
- `GET /api/admin/ai-customer-clv` - Customer CLV
- `GET /api/admin/ai-churn-prediction` - Churn prediction
- `POST /api/admin/ai-generate-description` - Generate description

#### Admin Gemini
- `GET /api/admin/gemini-customer-analysis` - Customer analysis
- `POST /api/admin/gemini-marketing-content` - Marketing content
- `GET /api/admin/gemini-sales-summary` - Sales summary

#### Admin Operations
- `POST /api/admin/bulk-operations` - Bulk operations
- `GET /api/admin/quick-search` - Quick search
- `GET /api/admin/global-search` - Global search

---

## Services Layer

### Core Services

1. **UserService** - User management
2. **AuthService** - Authentication
3. **ProductService** - Product management
4. **CartService** - Shopping cart
5. **OrderService** - Order processing
6. **ReviewService** - Reviews
7. **NotificationService** - Notifications
8. **EmailService** - Email sending
9. **SaleService** - Sales tracking
10. **PCBuildService** - PC build management
11. **CommunityBuildService** - Community builds
12. **EnergyEfficiencyService** - Energy calculations
13. **AIService** - AI features
14. **EnhancedAIService** - Enhanced AI features

### Specialized Services

15. **InventoryService** - Inventory management
16. **ContentService** - Content management
17. **MediaService** - Media management
18. **FinancialService** - Financial operations
19. **ReturnService** - Returns processing
20. **ShippingService** - Shipping management
21. **ProductVariantService** - Product variants
22. **ProductTemplateService** - Product templates
23. **ProductBundleService** - Product bundles
24. **ProductReviewService** - Product reviews
25. **DiscountService** - Discounts
26. **CampaignService** - Marketing campaigns
27. **EmailMarketingService** - Email marketing
28. **UserRecommendationService** - User recommendations
29. **PriceAlertService** - Price alerts
30. **ProductQAService** - Product Q&A
31. **ShoppingListService** - Shopping lists
32. **GiftRecommendationService** - Gift recommendations
33. **ProductSpecsTranslatorService** - Specs translation
34. **ProductAvailabilityPredictorService** - Availability prediction
35. **ShoppingBehaviorInsightsService** - Behavior insights
36. **MultiLanguageService** - Multi-language support
37. **CustomerSupportTriageService** - Support triage

---

## Components

### Reusable Components (`src/lib/components/`)

1. **AdminSidebar.svelte** - Admin navigation sidebar
2. **AIChatbot.svelte** - AI chatbot component
3. **DashboardWidget.svelte** - Dashboard widget
4. **QuickActionsPanel.svelte** - Quick actions panel
5. **SafeImage.svelte** - Image component with error handling
6. **UserCard.svelte** - User card component

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (optional, for AI features)
- Google Gemini API key (optional, for enhanced AI features)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Nabilthahamid/CSE470_Fall25_.git
cd CSE470_Fall25_
git checkout development
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
SUPABASE_JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key (optional)
GEMINI_API_KEY=your_gemini_key (optional)
```

4. **Run database migrations**
Execute all SQL files in `database/migrations/` in order:
- `complete_database_setup.sql`
- `add_pc_builder_tables.sql`
- `add_community_build_features.sql`
- `add_content_tables.sql`
- `add_discounts_tables.sql`
- `add_order_tracking.sql`
- `add_product_fields.sql`
- `add_product_translations_table.sql`
- `add_promotional_campaigns_table.sql`
- `add_user_checkout_fields.sql`
- `make_all_builds_public_by_default.sql`

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

7. **Preview production build**
```bash
npm run preview
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with svelte-check
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

---

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `SUPABASE_JWT_SECRET`
- `OPENAI_API_KEY` (optional)
- `GEMINI_API_KEY` (optional)

### Database Setup
1. Run all migrations in Supabase SQL Editor
2. Configure Row Level Security (RLS) policies
3. Set up authentication providers
4. Configure storage buckets (if needed)

---

## Key Features Summary

### ✅ Implemented Features

#### User Features
- ✅ User registration and authentication
- ✅ Product browsing and search
- ✅ Shopping cart
- ✅ Checkout process
- ✅ Order management
- ✅ Product comparison
- ✅ Product reviews and ratings
- ✅ PC Builder with compatibility checking
- ✅ Community build sharing
- ✅ Energy efficiency calculator
- ✅ FAQ system
- ✅ User profile management

#### Admin Features
- ✅ Admin dashboard
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ Inventory management
- ✅ User management
- ✅ Content management (FAQ)
- ✅ Marketing (campaigns, discounts, email)
- ✅ Financial management (sales, P&L)
- ✅ Shipping management
- ✅ Returns management
- ✅ Analytics dashboard
- ✅ Media management
- ✅ KPI dashboard

#### AI Features
- ✅ Product comparison insights
- ✅ User recommendations
- ✅ Gift recommendations
- ✅ Shopping list generation
- ✅ Product Q&A
- ✅ Review sentiment analysis
- ✅ Smart search
- ✅ AI build suggestions
- ✅ AI build optimization
- ✅ Energy efficiency analysis
- ✅ Customer support triage
- ✅ Admin AI insights
- ✅ Sales analytics
- ✅ Inventory optimization
- ✅ Price optimization
- ✅ Churn prediction
- ✅ Customer CLV
- ✅ Order risk scoring

#### Community Features
- ✅ Build sharing
- ✅ Build likes
- ✅ Build comments
- ✅ Build ratings
- ✅ Similar builds discovery
- ✅ Featured builds
- ✅ Popular builds
- ✅ Use case filtering

---

## Project Statistics

- **Total Services**: 37
- **Total API Endpoints**: 80+
- **Total Routes**: 50+
- **Database Tables**: 20+
- **Components**: 6 reusable components
- **Models**: 20+ data models

---

## Future Enhancements

Potential areas for future development:
- Mobile app (React Native/Flutter)
- Advanced analytics dashboard
- Real-time notifications (WebSocket)
- Payment gateway integration
- Advanced shipping integrations
- Multi-currency support
- Advanced SEO optimization
- Performance monitoring
- Automated testing suite
- CI/CD pipeline

---

## License

MIT

---

## Contact & Support

For issues, questions, or contributions, please refer to the GitHub repository:
https://github.com/Nabilthahamid/CSE470_Fall25_

---

**Last Updated**: 2025
**Version**: 1.0.0
**Status**: Production Ready

