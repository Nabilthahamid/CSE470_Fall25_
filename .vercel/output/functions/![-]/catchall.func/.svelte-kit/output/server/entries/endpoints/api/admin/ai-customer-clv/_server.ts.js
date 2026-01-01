import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { s as saleService } from "../../../../../chunks/SaleService.js";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
const GET = async ({ locals, url }) => {
  try {
    requireAdmin(locals.user);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return json({ error: "userId parameter is required" }, { status: 400 });
    }
    const allSales = await saleService.getAllSales();
    const sales = allSales.filter((s) => s.user_id === userId);
    const clv = await aiService.calculateCustomerLifetimeValue(userId, sales);
    return json(clv);
  } catch (error) {
    console.error("CLV Calculation error:", error);
    return json(
      { error: error.message || "Failed to calculate customer lifetime value" },
      { status: 500 }
    );
  }
};
export {
  GET
};
