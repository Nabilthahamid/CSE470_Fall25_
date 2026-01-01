import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { s as saleService } from "../../../../../chunks/SaleService.js";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
const GET = async ({ locals, url }) => {
  try {
    requireAdmin(locals.user);
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const productId = url.searchParams.get("productId") || void 0;
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (productId) filters.productId = productId;
    const sales = await saleService.getAllSales(filters);
    const analytics = await aiService.analyzeSales(sales);
    return json(analytics);
  } catch (error) {
    console.error("AI Sales Analytics error:", error);
    return json(
      { error: error.message || "Failed to generate AI analytics" },
      { status: 500 }
    );
  }
};
export {
  GET
};
