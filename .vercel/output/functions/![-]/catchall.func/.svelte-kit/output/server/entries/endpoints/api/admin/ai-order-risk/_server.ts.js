import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { o as orderService } from "../../../../../chunks/OrderService.js";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
const GET = async ({ locals, url }) => {
  try {
    requireAdmin(locals.user);
    const orderId = url.searchParams.get("orderId");
    if (orderId) {
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return json({ error: "Order not found" }, { status: 404 });
      }
      const riskScore = await aiService.scoreOrderRisk(order);
      return json(riskScore);
    } else {
      const orders = await orderService.getAllOrders();
      const riskScores = await Promise.all(
        orders.map((order) => aiService.scoreOrderRisk(order))
      );
      return json({ riskScores });
    }
  } catch (error) {
    console.error("Order Risk Scoring error:", error);
    return json(
      { error: error.message || "Failed to calculate order risk scores" },
      { status: 500 }
    );
  }
};
export {
  GET
};
