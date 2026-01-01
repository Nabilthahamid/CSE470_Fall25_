import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { s as supabase } from "../../../../../chunks/supabase.js";
import { h as handleError } from "../../../../../chunks/errors.js";
class ProductTemplateService {
  /**
   * Get all templates
   */
  async getAllTemplates() {
    try {
      const { data, error } = await supabase.from("product_templates").select("*").order("created_at", { ascending: false });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    const { data, error } = await supabase.from("product_templates").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch template: ${error.message}`);
    }
    return data;
  }
  /**
   * Create template
   */
  async createTemplate(template) {
    const { data, error } = await supabase.from("product_templates").insert({ ...template, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data;
  }
  /**
   * Update template
   */
  async updateTemplate(id, template) {
    const { data, error } = await supabase.from("product_templates").update({ ...template, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data;
  }
  /**
   * Delete template
   */
  async deleteTemplate(id) {
    const { error } = await supabase.from("product_templates").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }
  /**
   * Create product from template
   */
  async createProductFromTemplate(templateId, productName, overrides) {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error("Template not found");
    const { productService } = await import("../../../../../chunks/ProductService.js");
    return productService.createProduct({
      name: productName,
      description: overrides?.description || template.description || "",
      price: overrides?.base_price || template.base_price,
      cost_price: overrides?.cost_price || template.cost_price,
      stock: overrides?.default_stock || template.default_stock,
      component_category_id: overrides?.category_id || template.category_id || null,
      brand: overrides?.brand || template.brand || null,
      specifications: overrides?.specifications || template.specifications || null,
      tags: overrides?.tags || template.tags
    });
  }
}
const productTemplateService = new ProductTemplateService();
const load = async ({ locals }) => {
  requireAdmin(locals.user);
  try {
    const templates = await productTemplateService.getAllTemplates();
    return { templates, error: null };
  } catch (error) {
    const { message } = handleError(error);
    return { templates: [], error: message };
  }
};
const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const template = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || void 0,
      category_id: formData.get("category_id")?.toString() || void 0,
      brand: formData.get("brand")?.toString() || void 0,
      base_price: parseFloat(formData.get("base_price")?.toString() || "0"),
      cost_price: formData.get("cost_price") ? parseFloat(formData.get("cost_price")?.toString() || "0") : void 0,
      specifications: formData.get("specifications")?.toString() || void 0,
      default_stock: parseInt(formData.get("default_stock")?.toString() || "0"),
      tags: formData.get("tags")?.toString()?.split(",").map((t) => t.trim()).filter(Boolean) || void 0
    };
    try {
      await productTemplateService.createTemplate(template);
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
      await productTemplateService.deleteTemplate(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  createFromTemplate: async ({ request }) => {
    const formData = await request.formData();
    const templateId = formData.get("template_id")?.toString() || "";
    const productName = formData.get("product_name")?.toString() || "";
    try {
      await productTemplateService.createProductFromTemplate(templateId, productName);
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
