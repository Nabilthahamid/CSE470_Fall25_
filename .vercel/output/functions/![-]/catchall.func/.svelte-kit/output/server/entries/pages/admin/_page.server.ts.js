import { r as requireAdmin } from "../../../chunks/auth.js";
import { n as notificationService } from "../../../chunks/NotificationService.js";
import { productService } from "../../../chunks/ProductService.js";
import { o as orderService } from "../../../chunks/OrderService.js";
import { s as saleService } from "../../../chunks/SaleService.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async ({ locals }) => {
  requireAdmin(locals.user);
  try {
    notificationService.checkLowStockAndNotify().catch((err) => {
      console.error("Background low stock check failed:", err);
    });
    let notifications = [];
    let unreadCount = 0;
    try {
      notifications = await notificationService.getAllNotifications(locals.user.id, {
        is_read: false
      });
      unreadCount = await notificationService.getUnreadCount(locals.user.id);
    } catch (notifError) {
      console.error("Error loading notifications:", notifError);
    }
    let stats = {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalOrders: 0,
      pendingOrders: 0,
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      todayOrders: 0,
      weekOrders: 0,
      monthOrders: 0
    };
    try {
      const products = await productService.getAllProducts();
      stats.totalProducts = products.length;
      stats.lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
      stats.outOfStockCount = products.filter((p) => p.stock === 0).length;
      const orders = await orderService.getAllOrders();
      stats.totalOrders = orders.length;
      stats.pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
      const now = /* @__PURE__ */ new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const allSales = await saleService.getAllSales();
      const todaySales = allSales.filter((s) => {
        const saleDate = new Date(s.created_at || "");
        return saleDate >= todayStart;
      });
      const weekSales = allSales.filter((s) => {
        const saleDate = new Date(s.created_at || "");
        return saleDate >= weekStart;
      });
      const monthSales = allSales.filter((s) => {
        const saleDate = new Date(s.created_at || "");
        return saleDate >= monthStart;
      });
      stats.todayRevenue = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
      stats.weekRevenue = weekSales.reduce((sum, s) => sum + s.total_amount, 0);
      stats.monthRevenue = monthSales.reduce((sum, s) => sum + s.total_amount, 0);
      stats.todayOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at || "");
        return orderDate >= todayStart;
      }).length;
      stats.weekOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at || "");
        return orderDate >= weekStart;
      }).length;
      stats.monthOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at || "");
        return orderDate >= monthStart;
      }).length;
    } catch (statsError) {
      console.error("Error loading dashboard statistics:", statsError);
    }
    return {
      user: locals.user,
      notifications,
      unreadCount,
      stats
    };
  } catch (error) {
    console.error("Error loading admin page:", error);
    return {
      user: locals.user,
      notifications: [],
      unreadCount: 0,
      stats: {
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalOrders: 0,
        pendingOrders: 0,
        todayRevenue: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        todayOrders: 0,
        weekOrders: 0,
        monthOrders: 0
      }
    };
  }
};
const actions = {
  markNotificationRead: async ({ request, locals }) => {
    requireAdmin(locals.user);
    const formData = await request.formData();
    const notificationId = formData.get("id")?.toString();
    if (!notificationId) {
      return { error: "Notification ID is required" };
    }
    try {
      await notificationService.markAsRead(notificationId, locals.user.id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  markAllRead: async ({ locals }) => {
    requireAdmin(locals.user);
    try {
      await notificationService.markAllAsRead(locals.user.id);
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
