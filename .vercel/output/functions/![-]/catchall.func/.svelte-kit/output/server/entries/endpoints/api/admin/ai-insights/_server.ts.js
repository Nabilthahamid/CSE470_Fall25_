import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { s as saleService } from "../../../../../chunks/SaleService.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
const GET = async ({ locals }) => {
  try {
    requireAdmin(locals.user);
    const sales = await saleService.getAllSales();
    const products = await productService.getAllProducts();
    const [salesPrediction, salesPredictionEnhanced, stockRecommendations, stockRecommendationsEnhanced, customerInsights, customerInsightsEnhanced] = await Promise.all([
      aiService.predictSales(sales),
      // Keep old method for backward compatibility
      aiService.predictSalesEnhanced(sales),
      aiService.getStockRecommendations(products, sales),
      // Keep old method
      aiService.getStockRecommendationsEnhanced(products, sales),
      aiService.getCustomerInsights(sales),
      // Keep old method
      aiService.getCustomerInsightsEnhanced(sales)
    ]);
    return json({
      salesPrediction: salesPredictionEnhanced,
      // Use enhanced version
      stockRecommendations: stockRecommendationsEnhanced.slice(0, 10),
      // Top 10
      customerInsights: customerInsightsEnhanced
      // Use enhanced version
    });
  } catch (error) {
    console.error("AI Insights error:", error);
    return json(
      { error: error.message || "Failed to generate AI insights" },
      { status: 500 }
    );
  }
};
export {
  GET
};
