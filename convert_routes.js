// Script to help convert service imports to Models/Utils
// Run with: node convert_routes.js

const fs = require('fs');
const path = require('path');

const serviceToModelMap = {
  'ProductService': 'ProductModel',
  'UserService': 'UserModel',
  'CartService': 'CartModel',
  'OrderService': 'OrderModel',
  'SaleService': 'SaleModel',
  'ReturnService': 'ReturnModel',
  'ReviewService': 'ReviewModel',
  'AuthService': 'UserModel',
  'FinancialService': 'FinancialModel'
};

const serviceToUtilsMap = {
  'EmailService': { file: 'email', functions: ['sendInvoice', 'sendOrderConfirmation'] },
  'AIService': { file: 'ai', functions: ['moderateReview', 'scoreOrderRisk'] },
  'NotificationService': { file: 'notifications', functions: ['getAllNotifications', 'getUnreadCount', 'createNotification', 'markAsRead', 'markAllAsRead', 'checkLowStockAndNotify'] },
  'PCBuildService': { file: 'pc-builder', functions: ['getAllCategories', 'getCategoryById'] },
  'ContentService': { file: 'content', functions: ['getHomepageContent', 'getAllBanners', 'getAllFAQs'] },
  'DiscountService': { file: 'discount', functions: ['validateDiscount', 'calculateDiscountAmount', 'recordDiscountUsage'] },
  'MediaService': { file: 'media', functions: ['trackProductMediaUsage'] }
};

console.log('Conversion mappings created. Use this as reference for manual conversion.');
console.log('Service → Model:', serviceToModelMap);
console.log('Service → Utils:', serviceToUtilsMap);

