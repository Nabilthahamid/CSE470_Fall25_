import { r as requireAdmin } from "../../../../chunks/auth.js";
import { s as supabase } from "../../../../chunks/supabase.js";
import { o as orderService } from "../../../../chunks/OrderService.js";
import { h as handleError } from "../../../../chunks/errors.js";
class ReturnService {
  /**
   * Get all return requests
   */
  async getAllReturns(filters) {
    try {
      let query = supabase.from("return_requests").select("*").order("created_at", { ascending: false });
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.orderId) {
        query = query.eq("order_id", filters.orderId);
      }
      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch returns: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get return request by ID
   */
  async getReturnById(id) {
    const { data, error } = await supabase.from("return_requests").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch return: ${error.message}`);
    }
    return data;
  }
  /**
   * Create return request
   */
  async createReturnRequest(returnRequest, userId) {
    const order = await orderService.getOrderById(returnRequest.order_id);
    if (!order) {
      throw new Error("Order not found");
    }
    const { data, error } = await supabase.from("return_requests").insert({
      ...returnRequest,
      user_id: userId,
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).select().single();
    if (error) throw new Error(`Failed to create return request: ${error.message}`);
    return data;
  }
  /**
   * Update return request
   */
  async updateReturnRequest(id, update) {
    const { data, error } = await supabase.from("return_requests").update({ ...update, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update return request: ${error.message}`);
    return data;
  }
  /**
   * Process refund
   */
  async processRefund(returnId, refundAmount, refundMethod, adminNotes) {
    const returnRequest = await this.getReturnById(returnId);
    if (!returnRequest) {
      throw new Error("Return request not found");
    }
    const updated = await this.updateReturnRequest(returnId, {
      status: "refunded",
      refund_amount: refundAmount,
      refund_method: refundMethod,
      admin_notes: adminNotes
    });
    return updated;
  }
  /**
   * Approve return request
   */
  async approveReturn(id, adminNotes) {
    return this.updateReturnRequest(id, {
      status: "approved",
      admin_notes: adminNotes
    });
  }
  /**
   * Reject return request
   */
  async rejectReturn(id, adminNotes) {
    return this.updateReturnRequest(id, {
      status: "rejected",
      admin_notes: adminNotes
    });
  }
  /**
   * Complete return (after item received)
   */
  async completeReturn(id) {
    return this.updateReturnRequest(id, {
      status: "completed"
    });
  }
  /**
   * Get return reasons analytics
   */
  async getReturnReasons() {
    const returns = await this.getAllReturns();
    const reasonMap = /* @__PURE__ */ new Map();
    returns.forEach((r) => {
      const existing = reasonMap.get(r.reason) || { reason: r.reason, category: "Other", count: 0 };
      reasonMap.set(r.reason, { ...existing, count: existing.count + 1 });
    });
    return Array.from(reasonMap.values()).map((r) => ({
      reason: r.reason,
      category: r.category,
      count: r.count
    }));
  }
  /**
   * Get return analytics
   */
  async getReturnAnalytics(startDate, endDate) {
    const returns = await this.getAllReturns({ startDate, endDate });
    const orders = await orderService.getAllOrders({ startDate, endDate });
    const totalReturns = returns.length;
    const totalOrders = orders.length;
    const returnRate = totalOrders > 0 ? totalReturns / totalOrders * 100 : 0;
    const reasonMap = /* @__PURE__ */ new Map();
    returns.forEach((r) => {
      reasonMap.set(r.reason, (reasonMap.get(r.reason) || 0) + 1);
    });
    const byReason = Array.from(reasonMap.entries()).map(([reason, count]) => ({
      reason,
      count,
      percentage: totalReturns > 0 ? count / totalReturns * 100 : 0
    }));
    const statusMap = /* @__PURE__ */ new Map();
    returns.forEach((r) => {
      statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
    });
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalReturns > 0 ? count / totalReturns * 100 : 0
    }));
    const refundedReturns = returns.filter((r) => r.status === "refunded" && r.refund_amount);
    const totalRefunded = refundedReturns.reduce((sum, r) => sum + (r.refund_amount || 0), 0);
    const averageRefundAmount = refundedReturns.length > 0 ? totalRefunded / refundedReturns.length : 0;
    const monthlyMap = /* @__PURE__ */ new Map();
    returns.forEach((r) => {
      if (!r.created_at) return;
      const date = new Date(r.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) || { count: 0, refunded: 0 };
      monthlyMap.set(monthKey, {
        count: existing.count + 1,
        refunded: existing.refunded + (r.refund_amount || 0)
      });
    });
    const byMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month));
    return {
      totalReturns,
      returnRate,
      byReason,
      byStatus,
      totalRefunded,
      averageRefundAmount,
      byMonth
    };
  }
}
const returnService = new ReturnService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const status = url.searchParams.get("status") || void 0;
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const activeTab = url.searchParams.get("tab") || "requests";
    const [returns, reasons, analytics] = await Promise.all([
      returnService.getAllReturns({ status, startDate, endDate }),
      returnService.getReturnReasons(),
      returnService.getReturnAnalytics(startDate, endDate)
    ]);
    return {
      activeTab,
      returns,
      reasons,
      analytics,
      filters: { status, startDate, endDate },
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      activeTab: "requests",
      returns: [],
      reasons: [],
      analytics: {
        totalReturns: 0,
        returnRate: 0,
        byReason: [],
        byStatus: [],
        totalRefunded: 0,
        averageRefundAmount: 0,
        byMonth: []
      },
      filters: { status: void 0, startDate: void 0, endDate: void 0 },
      error: message
    };
  }
};
const actions = {
  approveReturn: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const adminNotes = formData.get("admin_notes")?.toString() || void 0;
    try {
      await returnService.approveReturn(id, adminNotes);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  rejectReturn: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const adminNotes = formData.get("admin_notes")?.toString() || void 0;
    try {
      await returnService.rejectReturn(id, adminNotes);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  processRefund: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const refundAmount = parseFloat(formData.get("refund_amount")?.toString() || "0");
    const refundMethod = formData.get("refund_method")?.toString() || "";
    const adminNotes = formData.get("admin_notes")?.toString() || void 0;
    try {
      await returnService.processRefund(id, refundAmount, refundMethod, adminNotes);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  completeReturn: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await returnService.completeReturn(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  }
};
export {
  actions,
  load
};
