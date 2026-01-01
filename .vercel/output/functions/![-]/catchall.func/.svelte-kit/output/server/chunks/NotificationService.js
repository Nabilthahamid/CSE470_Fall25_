import { s as supabase } from "./supabase.js";
class NotificationRepositoryImpl {
  async getAll(userId, filters) {
    let query = supabase.from("notifications").select(
      `
				*,
				products(name)
			`
    ).order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.is_read !== void 0) {
      query = query.eq("is_read", filters.is_read);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
    return (data || []).map((notif) => ({
      ...notif,
      product_name: notif.products?.name
    }));
  }
  async getById(id) {
    const { data, error } = await supabase.from("notifications").select(
      `
				*,
				products(name)
			`
    ).eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch notification: ${error.message}`);
    }
    return {
      ...data,
      product_name: data.products?.name
    };
  }
  async getUnreadCount(userId) {
    try {
      let query = supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false);
      if (userId) {
        query = query.eq("user_id", userId);
      }
      const { count, error } = await query;
      if (error) {
        if (error.code === "PGRST301" || error.message.includes("fetch")) {
          return 0;
        }
        throw new Error(`Failed to fetch unread count: ${error.message}`);
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }
  async create(input) {
    const { data, error } = await supabase.from("notifications").insert(input).select().single();
    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    return data;
  }
  async markAsRead(id, userId) {
    let query = supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { error } = await query;
    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
  async markAllAsRead(userId) {
    let query = supabase.from("notifications").update({ is_read: true });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { error } = await query;
    if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
  async delete(id) {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete notification: ${error.message}`);
  }
}
class NotificationService {
  repository;
  constructor(repository) {
    this.repository = repository || new NotificationRepositoryImpl();
  }
  async getAllNotifications(userId, filters) {
    return await this.repository.getAll(userId, filters);
  }
  async getNotificationById(id) {
    if (!id) throw new Error("Notification ID is required");
    const notification = await this.repository.getById(id);
    if (!notification) throw new Error("Notification not found");
    return notification;
  }
  async getUnreadCount(userId) {
    return await this.repository.getUnreadCount(userId);
  }
  async createNotification(input) {
    if (!input.title) throw new Error("Title is required");
    if (!input.message) throw new Error("Message is required");
    if (!input.type) throw new Error("Type is required");
    return await this.repository.create(input);
  }
  async markAsRead(id, userId) {
    if (!id) throw new Error("Notification ID is required");
    await this.repository.markAsRead(id, userId);
  }
  async markAllAsRead(userId) {
    await this.repository.markAllAsRead(userId);
  }
  async deleteNotification(id) {
    if (!id) throw new Error("Notification ID is required");
    await this.repository.delete(id);
  }
  async checkLowStockAndNotify() {
    try {
      const { data: lowStockProducts, error } = await supabase.rpc("check_low_stock");
      if (error) {
        if (error.code === "42883" || error.message.includes("function") || error.message.includes("does not exist")) {
          return this.checkLowStockManually();
        }
        console.error("Error checking low stock:", error);
        return this.checkLowStockManually();
      }
      if (!lowStockProducts || lowStockProducts.length === 0) {
        return;
      }
      const { data: admins, error: adminError } = await supabase.from("users").select("id").eq("role", "admin");
      if (adminError || !admins || admins.length === 0) {
        console.error("Error fetching admin users:", adminError);
        return;
      }
      for (const product of lowStockProducts) {
        for (const admin of admins) {
          try {
            await this.repository.create({
              user_id: admin.id,
              type: "low_stock",
              title: "Low Stock Alert",
              message: `Product "${product.product_name}" has only ${product.stock} items remaining in stock. Please restock soon.`,
              product_id: product.product_id
            });
          } catch (err) {
            console.error("Error creating notification:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error in checkLowStockAndNotify:", error);
    }
  }
  async checkLowStockManually() {
    try {
      const { error: tableCheckError } = await supabase.from("notifications").select("id").limit(1);
      if (tableCheckError) {
        return;
      }
      const { data: products, error: productsError } = await supabase.from("products").select("id, name, stock").lte("stock", 3).gte("stock", 0);
      if (productsError || !products || products.length === 0) {
        return;
      }
      const oneDayAgo = /* @__PURE__ */ new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      for (const product of products) {
        const { data: existingNotifications } = await supabase.from("notifications").select("id").eq("product_id", product.id).eq("type", "low_stock").eq("is_read", false).gte("created_at", oneDayAgo.toISOString());
        if (existingNotifications && existingNotifications.length > 0) {
          continue;
        }
        const { data: admins } = await supabase.from("users").select("id").eq("role", "admin");
        if (!admins || admins.length === 0) {
          continue;
        }
        for (const admin of admins) {
          try {
            await this.repository.create({
              user_id: admin.id,
              type: "low_stock",
              title: "Low Stock Alert",
              message: `Product "${product.name}" has only ${product.stock} items remaining in stock. Please restock soon.`,
              product_id: product.id
            });
          } catch (err) {
            console.error("Error creating notification:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error in checkLowStockManually:", error);
    }
  }
}
const notificationService = new NotificationService();
export {
  notificationService as n
};
