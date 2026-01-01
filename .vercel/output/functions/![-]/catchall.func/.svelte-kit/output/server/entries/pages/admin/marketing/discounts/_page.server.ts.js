import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { d as discountService } from "../../../../../chunks/DiscountService.js";
import { h as handleError } from "../../../../../chunks/errors.js";
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const activeTab = url.searchParams.get("tab") || "discounts";
    const [discounts, analytics, usage] = await Promise.all([
      discountService.getAllDiscounts(),
      discountService.getDiscountAnalytics(startDate, endDate),
      discountService.getDiscountUsage(startDate, endDate)
    ]);
    return {
      activeTab,
      discounts,
      analytics,
      usage,
      startDate: startDate || "",
      endDate: endDate || "",
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      activeTab: "discounts",
      discounts: [],
      analytics: {
        totalDiscounts: 0,
        activeDiscounts: 0,
        totalUsage: 0,
        totalDiscountAmount: 0,
        revenueImpact: 0,
        byType: [],
        topDiscounts: [],
        byMonth: []
      },
      usage: [],
      startDate: "",
      endDate: "",
      error: message
    };
  }
};
const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const discount = {
      code: formData.get("code")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || void 0,
      discount_type: formData.get("discount_type")?.toString() || "percentage",
      discount_value: parseFloat(formData.get("discount_value")?.toString() || "0"),
      minimum_purchase: formData.get("minimum_purchase") ? parseFloat(formData.get("minimum_purchase")?.toString() || "0") : void 0,
      maximum_discount: formData.get("maximum_discount") ? parseFloat(formData.get("maximum_discount")?.toString() || "0") : void 0,
      usage_limit_total: formData.get("usage_limit_total") ? parseInt(formData.get("usage_limit_total")?.toString() || "0") : void 0,
      usage_limit_per_customer: formData.get("usage_limit_per_customer") ? parseInt(formData.get("usage_limit_per_customer")?.toString() || "0") : void 0,
      start_date: formData.get("start_date")?.toString() || void 0,
      end_date: formData.get("end_date")?.toString() || void 0,
      is_active: formData.get("is_active")?.toString() === "true",
      applicable_to: formData.get("applicable_to")?.toString() || "all",
      applicable_ids: formData.get("applicable_ids")?.toString()?.split(",").map((id) => id.trim()).filter(Boolean) || void 0
    };
    try {
      await discountService.createDiscount(discount);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const discount = {};
    if (formData.get("name")) discount.name = formData.get("name")?.toString();
    if (formData.get("description")) discount.description = formData.get("description")?.toString();
    if (formData.get("discount_type")) discount.discount_type = formData.get("discount_type")?.toString();
    if (formData.get("discount_value")) discount.discount_value = parseFloat(formData.get("discount_value")?.toString() || "0");
    if (formData.get("minimum_purchase")) discount.minimum_purchase = parseFloat(formData.get("minimum_purchase")?.toString() || "0");
    if (formData.get("maximum_discount")) discount.maximum_discount = parseFloat(formData.get("maximum_discount")?.toString() || "0");
    if (formData.get("usage_limit_total")) discount.usage_limit_total = parseInt(formData.get("usage_limit_total")?.toString() || "0");
    if (formData.get("usage_limit_per_customer")) discount.usage_limit_per_customer = parseInt(formData.get("usage_limit_per_customer")?.toString() || "0");
    if (formData.get("start_date")) discount.start_date = formData.get("start_date")?.toString();
    if (formData.get("end_date")) discount.end_date = formData.get("end_date")?.toString();
    if (formData.get("is_active") !== null) discount.is_active = formData.get("is_active")?.toString() === "true";
    if (formData.get("applicable_to")) discount.applicable_to = formData.get("applicable_to")?.toString();
    if (formData.get("applicable_ids")) discount.applicable_ids = formData.get("applicable_ids")?.toString()?.split(",").map((id2) => id2.trim()).filter(Boolean);
    try {
      await discountService.updateDiscount(id, discount);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await discountService.deleteDiscount(id);
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
