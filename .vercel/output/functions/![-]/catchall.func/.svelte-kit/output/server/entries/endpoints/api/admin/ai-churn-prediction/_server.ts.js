import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { s as saleService } from "../../../../../chunks/SaleService.js";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
const GET = async ({ locals }) => {
  try {
    requireAdmin(locals.user);
    const sales = await saleService.getAllSales();
    const churnPredictions = await aiService.predictChurn(sales);
    return json({ churnPredictions });
  } catch (error) {
    console.error("Churn Prediction error:", error);
    return json(
      { error: error.message || "Failed to predict customer churn" },
      { status: 500 }
    );
  }
};
export {
  GET
};
