# Full MVC Conversion Plan - Remove All Services

## 🎯 Goal
Convert **EVERYTHING** to pure MVC and remove ALL services from the project.

## 📋 Conversion Strategy

### Phase 1: Core Data Models ✅ (DONE)
- ✅ ProductModel
- ✅ UserModel  
- ✅ CartModel
- ✅ OrderModel
- ✅ SaleModel
- ✅ ReturnModel
- ✅ ReviewModel
- ✅ FinancialModel (ExpenseModel, PaymentTransactionModel)

### Phase 2: Utility Functions → Utils
Move non-data services to `src/lib/utils/`:
- ✅ EmailService → `utils/email.ts`
- ✅ AIService → `utils/ai.ts`
- ⏳ NotificationService → `utils/notifications.ts`
- ⏳ MediaService → `utils/media.ts`
- ⏳ DiscountService → `utils/discount.ts`
- ⏳ PCBuildService → `utils/pc-builder.ts`
- ⏳ ContentService → `utils/content.ts`

### Phase 3: Update Controllers
- ✅ FinancialController → FinancialModel
- ✅ CheckoutController → utils/email
- ✅ ProductDetailController → utils/ai
- ✅ OrderController → utils/ai
- ⏳ HomeController → utils/pc-builder, utils/content
- ⏳ AdminController → utils/notifications
- ⏳ ProductController → utils/pc-builder, utils/media

### Phase 4: Update API Routes (84 files)
Convert all API routes to use Models instead of Services:
- ⏳ `src/routes/api/**/*.ts` - All API routes
- ⏳ `src/routes/**/*.server.ts` - All server routes

### Phase 5: Remove Services
- ⏳ Delete all `src/lib/services/*.ts` files
- ⏳ Remove `src/lib/services/` directory

## ⚠️ Note
This is a MASSIVE conversion. The project has 84+ files using services.
We'll need to convert them systematically.

