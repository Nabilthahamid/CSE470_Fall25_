import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { pcBuildService } from "../../../../../chunks/PCBuildService.js";
import { h as handleError } from "../../../../../chunks/errors.js";
const load = async ({ locals }) => {
  requireAdmin(locals.user);
  try {
    const products = await productService.getAllProducts();
    let categories = [];
    try {
      categories = await pcBuildService.getAllCategories();
    } catch (error) {
      console.error("Error loading categories:", error);
    }
    return {
      products,
      categories,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      products: [],
      categories: [],
      error: message
    };
  }
};
export {
  load
};
