import { redirect } from "@sveltejs/kit";
import { r as requireAdmin } from "../../../../../../chunks/auth.js";
import { productService } from "../../../../../../chunks/ProductService.js";
import { pcBuildService } from "../../../../../../chunks/PCBuildService.js";
import { h as handleError } from "../../../../../../chunks/errors.js";
const load = async ({ params, locals }) => {
  requireAdmin(locals.user);
  try {
    const product = await productService.getProductById(params.id);
    let categories = [];
    try {
      categories = await pcBuildService.getAllCategories();
    } catch (error) {
      console.error("Error loading component categories:", error);
    }
    let allProducts = [];
    try {
      allProducts = await productService.getAllProducts();
    } catch (error) {
      console.error("Error loading products:", error);
    }
    return { product, categories, allProducts };
  } catch (error) {
    const { message } = handleError(error);
    throw redirect(302, "/admin/products?error=" + encodeURIComponent(message));
  }
};
const actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const price = formData.get("price")?.toString();
    const cost_price = formData.get("cost_price")?.toString();
    const stock = formData.get("stock")?.toString();
    const image_url = formData.get("image_url")?.toString();
    const image_file = formData.get("image_file");
    const delete_image = formData.get("delete_image")?.toString() === "true";
    const component_category_id = formData.get("component_category_id")?.toString() || null;
    const brand = formData.get("brand")?.toString() || null;
    const specifications = formData.get("specifications")?.toString() || null;
    const tags = formData.get("tags")?.toString() || "";
    const related_product_ids = formData.get("related_product_ids")?.toString() || "";
    const slug = formData.get("slug")?.toString() || null;
    const meta_title = formData.get("meta_title")?.toString() || null;
    const meta_description = formData.get("meta_description")?.toString() || null;
    const images = formData.get("images")?.toString() || "";
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (cost_price) updateData.cost_price = parseFloat(cost_price);
    if (stock) updateData.stock = parseInt(stock);
    if (component_category_id !== null) updateData.component_category_id = component_category_id || null;
    if (brand !== null) updateData.brand = brand || null;
    if (specifications !== null) updateData.specifications = specifications || null;
    if (tags) updateData.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (related_product_ids) updateData.related_product_ids = related_product_ids.split(",").map((id) => id.trim()).filter(Boolean);
    if (slug !== null) updateData.slug = slug || null;
    if (meta_title !== null) updateData.meta_title = meta_title || null;
    if (meta_description !== null) updateData.meta_description = meta_description || null;
    if (images) updateData.images = images.split(",").map((img) => img.trim()).filter(Boolean);
    if (image_file && image_file.size > 0) {
      try {
        const { uploadImage } = await import("../../../../../../chunks/storage.js");
        updateData.image_url = await uploadImage(image_file);
      } catch (error) {
        const { message } = handleError(error);
        return { error: `Image upload failed: ${message}` };
      }
    } else if (delete_image) {
      updateData.image_url = null;
    } else if (image_url !== null && image_url !== void 0) {
      updateData.image_url = image_url || null;
    }
    try {
      await productService.updateProduct(params.id, updateData);
      throw redirect(302, "/admin/products");
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && error.status === 302) {
        throw error;
      }
      const { message } = handleError(error);
      return { error: message };
    }
  }
};
export {
  actions,
  load
};
