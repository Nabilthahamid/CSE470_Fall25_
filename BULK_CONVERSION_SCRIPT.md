# Bulk Service → Model Conversion Script

## 🎯 Automated Conversion Guide

This guide helps convert all remaining service usages to Models.

## 📋 Conversion Patterns

### Pattern 1: ProductService → ProductModel
```typescript
// BEFORE
import { productService } from '$lib/services/ProductService';
const products = await productService.getAllProducts();

// AFTER
import { ProductModel } from '$lib/models/ProductModel';
const productsModels = await ProductModel.getAll();
const products = productsModels.map(p => p.toJSON());
```

### Pattern 2: UserService → UserModel
```typescript
// BEFORE
import { userService } from '$lib/services/UserService';
const users = await userService.getAllUsers();

// AFTER
import { UserModel } from '$lib/models/UserModel';
const usersModels = await UserModel.getAll();
const users = usersModels.map(u => u.toJSON());
```

### Pattern 3: OrderService → OrderModel
```typescript
// BEFORE
import { orderService } from '$lib/services/OrderService';
const orders = await orderService.getAllOrders();

// AFTER
import { OrderModel } from '$lib/models/OrderModel';
const ordersModels = await OrderModel.getAll();
const orders = ordersModels.map(o => o.toJSON());
```

### Pattern 4: CartService → CartModel
```typescript
// BEFORE
import { cartService } from '$lib/services/CartService';
const items = await cartService.getCartItems(userId);

// AFTER
import { CartModel } from '$lib/models/CartModel';
const items = await CartModel.getCartItems(userId);
// CartModel already returns CartItemModel[], use .toJSON() if needed
```

### Pattern 5: SaleService → SaleModel
```typescript
// BEFORE
import { saleService } from '$lib/services/SaleService';
const sales = await saleService.getAllSales(filters, true);

// AFTER
import { SaleModel } from '$lib/models/SaleModel';
const salesModels = await SaleModel.getAll(filters, true);
const sales = salesModels.map(s => s.toJSON());
```

### Pattern 6: ReturnService → ReturnModel
```typescript
// BEFORE
import { returnService } from '$lib/services/ReturnService';
const returns = await returnService.getAllReturns(filters);

// AFTER
import { ReturnModel } from '$lib/models/ReturnModel';
const returnsModels = await ReturnModel.getAll(filters);
const returns = returnsModels.map(r => r.toJSON());
```

### Pattern 7: ReviewService → ReviewModel
```typescript
// BEFORE
import { reviewService } from '$lib/services/ReviewService';
const reviews = await reviewService.getReviewsByProduct(productId);

// AFTER
import { ReviewModel } from '$lib/models/ReviewModel';
const reviewsModels = await ReviewModel.getByProduct(productId);
const reviews = reviewsModels.map(r => r.toJSON());
```

### Pattern 8: AuthService → UserModel
```typescript
// BEFORE
import { authService } from '$lib/services/AuthService';
const session = await authService.login({ email, password });

// AFTER
import { UserModel } from '$lib/models/UserModel';
const session = await UserModel.login({ email, password });
```

## 🔧 Utility Service Conversions

### EmailService → utils/email
```typescript
// BEFORE
import { emailService } from '$lib/services/EmailService';
await emailService.sendInvoice(order);

// AFTER
import { sendInvoice } from '$lib/utils/email';
await sendInvoice(order);
```

### AIService → utils/ai
```typescript
// BEFORE
import { aiService } from '$lib/services/AIService';
const moderation = await aiService.moderateReview(data);

// AFTER
import { moderateReview } from '$lib/utils/ai';
const moderation = await moderateReview(data);
```

### NotificationService → utils/notifications
```typescript
// BEFORE
import { notificationService } from '$lib/services/NotificationService';
const notifications = await notificationService.getAllNotifications(userId);

// AFTER
import { getAllNotifications } from '$lib/utils/notifications';
const notifications = await getAllNotifications(userId);
```

### PCBuildService → utils/pc-builder
```typescript
// BEFORE
import { pcBuildService } from '$lib/services/PCBuildService';
const categories = await pcBuildService.getAllCategories();

// AFTER
import { getAllCategories } from '$lib/utils/pc-builder';
const categories = await getAllCategories();
```

### ContentService → utils/content
```typescript
// BEFORE
import { contentService } from '$lib/services/ContentService';
const content = await contentService.getHomepageContent();

// AFTER
import { getHomepageContent } from '$lib/utils/content';
const content = await getHomepageContent();
```

### DiscountService → utils/discount
```typescript
// BEFORE
import { discountService } from '$lib/services/DiscountService';
const validation = await discountService.validateDiscount(code, userId, total, productIds);

// AFTER
import { validateDiscount } from '$lib/utils/discount';
const validation = await validateDiscount(code, userId, total, productIds);
```

### MediaService → utils/media
```typescript
// BEFORE
import { mediaService } from '$lib/services/MediaService';
await mediaService.trackProductMediaUsage(productId, url, name);

// AFTER
import { trackProductMediaUsage } from '$lib/utils/media';
await trackProductMediaUsage(productId, url, name);
```

### FinancialService → FinancialModel
```typescript
// BEFORE
import { financialService } from '$lib/services/FinancialService';
const expenses = await financialService.getAllExpenses(startDate, endDate);

// AFTER
import { ExpenseModel } from '$lib/models/FinancialModel';
const expensesModels = await ExpenseModel.getAll(startDate, endDate);
const expenses = expensesModels.map(e => e.toJSON());
```

## 📝 Step-by-Step Conversion Process

1. **Find service import:**
   ```typescript
   import { XService } from '$lib/services/XService';
   ```

2. **Replace with Model/Utils:**
   ```typescript
   import { XModel } from '$lib/models/XModel';
   // OR
   import { helperFunction } from '$lib/utils/helper';
   ```

3. **Update method calls:**
   - Service methods → Model static methods
   - Add `.toJSON()` when returning data

4. **Test the route**

## ⚠️ Important Notes

- **Models return Model instances** - use `.toJSON()` for plain objects
- **Static methods** for queries: `Model.getAll()`, `Model.getById()`, etc.
- **Instance methods** for updates: `model.update()`, `model.delete()`, etc.
- **Utility functions** are pure functions, not classes

## 📊 Remaining Files

**79 files** still need conversion. Use the patterns above to convert them systematically.

