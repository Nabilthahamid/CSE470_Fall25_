import { redirect } from "@sveltejs/kit";
import { r as requireAdmin } from "../../../../chunks/auth.js";
import { o as orderService } from "../../../../chunks/OrderService.js";
import { aiService } from "../../../../chunks/AIService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const statusFilter = url.searchParams.get("status");
    const searchQuery = url.searchParams.get("search") || "";
    const startDate = url.searchParams.get("startDate") || "";
    const endDate = url.searchParams.get("endDate") || "";
    const filters = {};
    if (statusFilter) {
      filters.status = statusFilter;
    }
    if (startDate) {
      filters.startDate = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
    }
    let orders = await orderService.getAllOrders(Object.keys(filters).length > 0 ? filters : void 0);
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      orders = orders.filter(
        (order) => order.id.toLowerCase().includes(searchLower) || order.customer_name?.toLowerCase().includes(searchLower) || order.customer_email?.toLowerCase().includes(searchLower) || order.tracking_number?.toLowerCase().includes(searchLower)
      );
    }
    const orderRiskScores = /* @__PURE__ */ new Map();
    try {
      const riskScores = await Promise.all(
        orders.map(async (order) => {
          try {
            const riskScore = await aiService.scoreOrderRisk(order);
            return { orderId: order.id, riskScore };
          } catch (error) {
            console.error(`Error calculating risk for order ${order.id}:`, error);
            return null;
          }
        })
      );
      riskScores.forEach((rs) => {
        if (rs) orderRiskScores.set(rs.orderId, rs.riskScore);
      });
    } catch (error) {
      console.error("Error calculating order risk scores:", error);
    }
    return {
      orders,
      orderRiskScores: Object.fromEntries(orderRiskScores),
      user: locals.user,
      currentFilter: statusFilter || "all",
      searchQuery,
      filters: {
        startDate,
        endDate
      }
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      orders: [],
      user: locals.user,
      currentFilter: "all",
      searchQuery: "",
      filters: {
        startDate: "",
        endDate: ""
      },
      error: message
    };
  }
};
const actions = {
  updateStatus: async ({ request, locals, url }) => {
    requireAdmin(locals.user);
    const formData = await request.formData();
    const orderId = formData.get("order_id")?.toString();
    const status = formData.get("status")?.toString();
    const trackingNumber = formData.get("tracking_number")?.toString() || void 0;
    const notes = formData.get("notes")?.toString() || void 0;
    if (!orderId || !status) {
      return {
        error: "Order ID and status are required"
      };
    }
    try {
      await orderService.updateOrderStatus(
        orderId,
        status,
        trackingNumber,
        notes,
        locals.user.id
      );
      const statusFilter = url.searchParams.get("status");
      if (statusFilter) {
        throw redirect(303, `/admin/orders?status=${statusFilter}&updated=true`);
      } else {
        throw redirect(303, "/admin/orders?updated=true");
      }
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      const { message } = handleError(error);
      return {
        error: message
      };
    }
  }
};
export {
  actions,
  load
};
