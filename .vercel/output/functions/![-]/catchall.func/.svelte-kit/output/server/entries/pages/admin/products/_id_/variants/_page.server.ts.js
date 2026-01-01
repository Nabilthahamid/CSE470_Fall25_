import { r as requireAdmin } from "../../../../../../chunks/auth.js";
import { s as supabase } from "../../../../../../chunks/supabase.js";
import { productService } from "../../../../../../chunks/ProductService.js";
import { h as handleError } from "../../../../../../chunks/errors.js";
class ProductVariantService {
  /**
   * Get all variants for a product
   */
  async getVariantsByProduct(productId) {
    try {
      const { data, error } = await supabase.from("product_variants").select("*").eq("product_id", productId).order("created_at", { ascending: true });
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch variants: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get variant by ID
   */
  async getVariantById(id) {
    const { data, error } = await supabase.from("product_variants").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch variant: ${error.message}`);
    }
    return data;
  }
  /**
   * Create variant
   */
  async createVariant(variant) {
    const { data, error } = await supabase.from("product_variants").insert({ ...variant, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create variant: ${error.message}`);
    return data;
  }
  /**
   * Bulk create variants
   */
  async bulkCreateVariants(variants) {
    const { data, error } = await supabase.from("product_variants").insert(variants.map((v) => ({ ...v, created_at: (/* @__PURE__ */ new Date()).toISOString() }))).select();
    if (error) throw new Error(`Failed to create variants: ${error.message}`);
    return data || [];
  }
  /**
   * Update variant
   */
  async updateVariant(id, variant) {
    const { data, error } = await supabase.from("product_variants").update({ ...variant, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update variant: ${error.message}`);
    return data;
  }
  /**
   * Delete variant
   */
  async deleteVariant(id) {
    const { error } = await supabase.from("product_variants").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete variant: ${error.message}`);
  }
  /**
   * Generate variants from attributes (e.g., all combinations of color and size)
   */
  generateVariantCombinations(productId, attributes, basePrice, baseStock = 0) {
    if (attributes.length === 0) return [];
    const combinations = [];
    const generate = (current, index) => {
      if (index === attributes.length) {
        combinations.push({ ...current });
        return;
      }
      const attr = attributes[index];
      for (const value of attr.values) {
        generate({ ...current, [attr.name]: value }, index + 1);
      }
    };
    generate({}, 0);
    return combinations.map((attrs, index) => {
      const name = Object.entries(attrs).map(([key, value]) => `${key}: ${value}`).join(", ");
      const sku = `VAR-${productId.slice(0, 8)}-${index + 1}`;
      return {
        product_id: productId,
        name,
        sku,
        attributes: attrs,
        price: basePrice,
        stock: baseStock,
        is_active: true
      };
    });
  }
}
const productVariantService = new ProductVariantService();
const load = async ({ locals, params }) => {
  requireAdmin(locals.user);
  try {
    const product = await productService.getProductById(params.id);
    if (!product) {
      throw new Error("Product not found");
    }
    const variants = await productVariantService.getVariantsByProduct(params.id);
    return {
      product,
      variants,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      product: null,
      variants: [],
      error: message
    };
  }
};
const actions = {
  createVariant: async ({ request, params }) => {
    const formData = await request.formData();
    const variant = {
      product_id: params.id,
      name: formData.get("name")?.toString() || "",
      sku: formData.get("sku")?.toString() || void 0,
      attributes: JSON.parse(formData.get("attributes")?.toString() || "{}"),
      price: formData.get("price") ? parseFloat(formData.get("price")?.toString() || "0") : void 0,
      stock: parseInt(formData.get("stock")?.toString() || "0"),
      image_url: formData.get("image_url")?.toString() || void 0,
      is_active: formData.get("is_active")?.toString() === "true"
    };
    try {
      await productVariantService.createVariant(variant);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  bulkCreateVariants: async ({ request, params }) => {
    const formData = await request.formData();
    const attributesJson = formData.get("attributes")?.toString() || "[]";
    const attributes = JSON.parse(attributesJson);
    const basePrice = formData.get("base_price") ? parseFloat(formData.get("base_price")?.toString() || "0") : void 0;
    const baseStock = parseInt(formData.get("base_stock")?.toString() || "0");
    try {
      const variants = productVariantService.generateVariantCombinations(
        params.id,
        attributes,
        basePrice,
        baseStock
      );
      await productVariantService.bulkCreateVariants(variants);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updateVariant: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const variant = {};
    if (formData.get("name")) variant.name = formData.get("name")?.toString();
    if (formData.get("sku")) variant.sku = formData.get("sku")?.toString();
    if (formData.get("attributes")) variant.attributes = JSON.parse(formData.get("attributes")?.toString() || "{}");
    if (formData.get("price")) variant.price = parseFloat(formData.get("price")?.toString() || "0");
    if (formData.get("stock")) variant.stock = parseInt(formData.get("stock")?.toString() || "0");
    if (formData.get("image_url")) variant.image_url = formData.get("image_url")?.toString();
    if (formData.get("is_active") !== null) variant.is_active = formData.get("is_active")?.toString() === "true";
    try {
      await productVariantService.updateVariant(id, variant);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteVariant: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await productVariantService.deleteVariant(id);
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
