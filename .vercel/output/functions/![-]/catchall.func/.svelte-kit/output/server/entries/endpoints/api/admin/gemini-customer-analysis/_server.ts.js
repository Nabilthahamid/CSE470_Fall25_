import { json } from "@sveltejs/kit";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { aiService } from "../../../../../chunks/AIService.js";
import { o as orderService } from "../../../../../chunks/OrderService.js";
const POST = async ({ request, locals }) => {
  requireAdmin(locals.user);
  try {
    const { userId } = await request.json();
    if (!userId) {
      return json({ error: "User ID is required" }, { status: 400 });
    }
    const orders = await orderService.getAllOrders({ userId });
    if (orders.length === 0) {
      return json({
        insights: "No order history available for this customer.",
        recommendations: ["Encourage first purchase with welcome offer"],
        segment: "New",
        error: null
      });
    }
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = totalSpent / totalOrders;
    const firstOrder = new Date(orders[orders.length - 1].created_at);
    const lastOrder = new Date(orders[0].created_at);
    const monthsDiff = Math.max(1, (lastOrder.getTime() - firstOrder.getTime()) / (1e3 * 60 * 60 * 24 * 30));
    const orderFrequency = totalOrders / monthsDiff;
    const categoryCounts = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          const category = "General";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
    });
    const preferredCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).slice(0, 5);
    const analysis = await aiService.analyzeCustomerBehavior({
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastOrderDate: orders[0].created_at,
      orderFrequency,
      preferredCategories
    });
    return json({ ...analysis, error: null });
  } catch (error) {
    console.error("Error analyzing customer behavior:", error);
    return json(
      { insights: "", recommendations: [], segment: "Unknown", error: error.message || "Failed to analyze customer behavior" },
      { status: 500 }
    );
  }
};
export {
  POST
};
