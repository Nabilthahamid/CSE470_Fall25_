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
    const predictions = await aiService.predictInventory(products, sales);
    return json({ predictions });
  } catch (error) {
    console.error("AI Inventory error:", error);
    return json(
      { error: error.message || "Failed to generate inventory predictions" },
      { status: 500 }
    );
  }
};
export {
  GET
};
