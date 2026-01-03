# API Routes Conversion Guide - Remove All Services

## 🎯 Goal
Convert ALL API routes and route files to use **Models** instead of **Services**.

## ✅ Already Converted

### Controllers ✅
- All 16 controllers now use Models ✅

### API Routes ✅ (Examples)
- `src/routes/api/returns/request/+server.ts` → Uses `ReturnModel` ✅
- `src/routes/cart/add/+server.ts` → Uses `CartModel` ✅
- `src/routes/api/checkout/validate-coupon/+server.ts` → Uses `CartModel`, `utils/discount` ✅

### Route Files ✅
- `src/routes/orders/[id]/+page.server.ts` → Uses `ReturnModel` ✅
- `src/routes/admin/orders/[id]/+page.server.ts` → Uses `ReturnModel` ✅

## ⏳ Remaining Conversions Needed

### Service → Model Mappings

| Service | Replace With | Usage |
|---------|-------------|-------|
| `ProductService` | `ProductModel` | `productService.getAllProducts()` → `ProductModel.getAll()` |
| `UserService` | `UserModel` | `userService.getAllUsers()` → `UserModel.getAll()` |
| `CartService` | `CartModel` | `cartService.getCartItems()` → `CartModel.getCartItems()` |
| `OrderService` | `OrderModel` | `orderService.getAllOrders()` → `OrderModel.getAll()` |
| `SaleService` | `SaleModel` | `saleService.getAllSales()` → `SaleModel.getAll()` |
| `ReturnService` | `ReturnModel` | `returnService.getAllReturns()` → `ReturnModel.getAll()` |
| `ReviewService` | `ReviewModel` | `reviewService.getReviewsByProduct()` → `ReviewModel.getByProduct()` |
| `AuthService` | `UserModel` | `authService.login()` → `UserModel.login()` |

### Service → Utils Mappings

| Service | Replace With | Usage |
|---------|-------------|-------|
| `EmailService` | `utils/email` | `emailService.sendInvoice()` → `sendInvoice()` |
| `AIService` | `utils/ai` | `aiService.moderateReview()` → `moderateReview()` |
| `NotificationService` | `utils/notifications` | `notificationService.getAllNotifications()` → `getAllNotifications()` |
| `PCBuildService` | `utils/pc-builder` | `pcBuildService.getAllCategories()` → `getAllCategories()` |
| `ContentService` | `utils/content` | `contentService.getHomepageContent()` → `getHomepageContent()` |
| `DiscountService` | `utils/discount` | `discountService.validateDiscount()` → `validateDiscount()` |
| `MediaService` | `utils/media` | `mediaService.trackProductMediaUsage()` → `trackProductMediaUsage()` |
| `FinancialService` | `FinancialModel` | `financialService.getAllExpenses()` → `ExpenseModel.getAll()` |

## 📝 Conversion Pattern

### Before (Service):
```typescript
import { productService } from '$lib/services/ProductService';

const products = await productService.getAllProducts();
```

### After (Model):
```typescript
import { ProductModel } from '$lib/models/ProductModel';

const productsModels = await ProductModel.getAll();
const products = productsModels.map(p => p.toJSON());
```

## 🔄 Systematic Conversion Steps

1. **Find all service imports** in route files
2. **Replace with Model imports**
3. **Update method calls** (Service → Model)
4. **Add `.toJSON()`** when returning data
5. **Test each route**

## ⚠️ Important Notes

- Models return Model instances, use `.toJSON()` for plain objects
- Static methods: `Model.getAll()`, `Model.getById()`, etc.
- Instance methods: `model.update()`, `model.delete()`, etc.
- Utility functions are in `src/lib/utils/`

## 📊 Progress Tracking

- **Controllers:** 16/16 (100%) ✅
- **API Routes:** ~5/84 (6%) ⏳
- **Route Files:** ~2/20+ (10%) ⏳

**Total Remaining:** ~100+ files to convert

