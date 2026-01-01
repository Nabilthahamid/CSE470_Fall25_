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
    const optimizations = await aiService.optimizePrices(products, sales);
    return json({ optimizations });
  } catch (error) {
    console.error("AI Price Optimization error:", error);
    return json(
      { error: error.message || "Failed to generate price optimizations" },
      { status: 500 }
    );
  }
};
export {
  GET
};
