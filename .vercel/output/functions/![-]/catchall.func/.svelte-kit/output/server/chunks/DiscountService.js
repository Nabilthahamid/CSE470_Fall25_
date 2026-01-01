import { s as supabase } from "./supabase.js";
class DiscountService {
  /**
   * Get all discounts
   */
  async getAllDiscounts() {
    try {
      const { data, error } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch discounts: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get active discounts
   */
  async getActiveDiscounts() {
    const discounts = await this.getAllDiscounts();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return discounts.filter(
      (d) => d.is_active && (!d.start_date || d.start_date <= now) && (!d.end_date || d.end_date >= now)
    );
  }
  /**
   * Get discount by code
   */
  async getDiscountByCode(code) {
    const { data, error } = await supabase.from("discounts").select("*").eq("code", code.toUpperCase()).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch discount: ${error.message}`);
    }
    return data;
  }
  /**
   * Get discount by ID
   */
  async getDiscountById(id) {
    const { data, error } = await supabase.from("discounts").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch discount: ${error.message}`);
    }
    return data;
  }
  /**
   * Validate discount code
   */
  async validateDiscount(code, userId, cartTotal, productIds) {
    const discount = await this.getDiscountByCode(code);
    if (!discount) {
      return { valid: false, error: "Invalid discount code" };
    }
    if (!discount.is_active) {
      return { valid: false, error: "Discount code is not active" };
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (discount.start_date && discount.start_date > now) {
      return { valid: false, error: "Discount code has not started yet" };
    }
    if (discount.end_date && discount.end_date < now) {
      return { valid: false, error: "Discount code has expired" };
    }
    if (discount.minimum_purchase && cartTotal < discount.minimum_purchase) {
      return {
        valid: false,
        error: `Minimum purchase of Tk ${discount.minimum_purchase} required`
      };
    }
    if (discount.usage_limit_total && discount.used_count >= discount.usage_limit_total) {
      return { valid: false, error: "Discount code usage limit reached" };
    }
    if (discount.usage_limit_per_customer) {
      const { data: usage } = await supabase.from("discount_usage").select("id").eq("discount_id", discount.id).eq("user_id", userId);
      if (usage && usage.length >= discount.usage_limit_per_customer) {
        return { valid: false, error: "You have already used this discount code" };
      }
    }
    if (discount.applicable_to === "products" && discount.applicable_ids && productIds) {
      const hasApplicableProduct = productIds.some(
        (id) => discount.applicable_ids?.includes(id)
      );
      if (!hasApplicableProduct) {
        return { valid: false, error: "Discount code does not apply to selected products" };
      }
    }
    return { valid: true, discount };
  }
  /**
   * Calculate discount amount
   */
  calculateDiscountAmount(discount, cartTotal) {
    if (discount.discount_type === "free_shipping") {
      return 0;
    }
    if (discount.discount_type === "percentage") {
      let amount = cartTotal * discount.discount_value / 100;
      if (discount.maximum_discount && amount > discount.maximum_discount) {
        amount = discount.maximum_discount;
      }
      return amount;
    }
    if (discount.discount_type === "fixed_amount") {
      return discount.discount_value > cartTotal ? cartTotal : discount.discount_value;
    }
    return 0;
  }
  /**
   * Record discount usage
   */
  async recordUsage(discountId, orderId, userId, discountAmount) {
    try {
      await supabase.from("discount_usage").insert({
        discount_id: discountId,
        order_id: orderId,
        user_id: userId,
        discount_amount: discountAmount,
        used_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const discount = await this.getDiscountById(discountId);
      if (discount) {
        await supabase.from("discounts").update({ used_count: discount.used_count + 1 }).eq("id", discountId);
      }
    } catch (error) {
      console.error("Error recording discount usage:", error);
    }
  }
  /**
   * Create discount
   */
  async createDiscount(discount) {
    discount.code = discount.code.toUpperCase();
    const { data, error } = await supabase.from("discounts").insert({ ...discount, used_count: 0, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create discount: ${error.message}`);
    return data;
  }
  /**
   * Update discount
   */
  async updateDiscount(id, discount) {
    if (discount.code) {
      discount.code = discount.code.toUpperCase();
    }
    const { data, error } = await supabase.from("discounts").update({ ...discount, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update discount: ${error.message}`);
    return data;
  }
  /**
   * Delete discount
   */
  async deleteDiscount(id) {
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete discount: ${error.message}`);
  }
  /**
   * Get discount analytics
   */
  async getDiscountAnalytics(startDate, endDate) {
    const discounts = await this.getAllDiscounts();
    const allUsage = await this.getDiscountUsage(startDate, endDate);
    const totalDiscounts = discounts.length;
    const activeDiscounts = discounts.filter((d) => d.is_active).length;
    const totalUsage = allUsage.length;
    const totalDiscountAmount = allUsage.reduce((sum, u) => sum + u.discount_amount, 0);
    const revenueImpact = totalDiscountAmount;
    const typeMap = /* @__PURE__ */ new Map();
    discounts.forEach((d) => {
      const existing = typeMap.get(d.discount_type) || { count: 0, totalAmount: 0 };
      const usage = allUsage.filter((u) => u.discount_id === d.id);
      typeMap.set(d.discount_type, {
        count: existing.count + 1,
        totalAmount: existing.totalAmount + usage.reduce((sum, u) => sum + u.discount_amount, 0)
      });
    });
    const discountUsageMap = /* @__PURE__ */ new Map();
    allUsage.forEach((u) => {
      const existing = discountUsageMap.get(u.discount_id) || { usage: 0, totalAmount: 0 };
      discountUsageMap.set(u.discount_id, {
        usage: existing.usage + 1,
        totalAmount: existing.totalAmount + u.discount_amount
      });
    });
    const topDiscounts = Array.from(discountUsageMap.entries()).map(([discountId, data]) => {
      const discount = discounts.find((d) => d.id === discountId);
      return {
        code: discount?.code || "Unknown",
        ...data
      };
    }).sort((a, b) => b.usage - a.usage).slice(0, 10);
    const monthlyMap = /* @__PURE__ */ new Map();
    allUsage.forEach((u) => {
      const date = new Date(u.used_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) || { usage: 0, totalAmount: 0 };
      monthlyMap.set(monthKey, {
        usage: existing.usage + 1,
        totalAmount: existing.totalAmount + u.discount_amount
      });
    });
    const byMonth = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month));
    return {
      totalDiscounts,
      activeDiscounts,
      totalUsage,
      totalDiscountAmount,
      revenueImpact,
      byType: Array.from(typeMap.entries()).map(([type, data]) => ({ type, ...data })),
      topDiscounts,
      byMonth
    };
  }
  /**
   * Get discount usage
   */
  async getDiscountUsage(startDate, endDate) {
    try {
      let query = supabase.from("discount_usage").select("*").order("used_at", { ascending: false });
      if (startDate) {
        query = query.gte("used_at", startDate);
      }
      if (endDate) {
        query = query.lte("used_at", endDate);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch discount usage: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
}
const discountService = new DiscountService();
export {
  discountService as d
};
