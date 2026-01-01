import { productService } from "../../../chunks/ProductService.js";
import { pcBuildService } from "../../../chunks/PCBuildService.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async ({ url }) => {
  try {
    const searchQuery = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("category") || "";
    const error = url.searchParams.get("error");
    const success = url.searchParams.get("success");
    let products;
    let category = null;
    if (categoryId) {
      products = await productService.getProductsByCategory(categoryId);
      try {
        category = await pcBuildService.getCategoryById(categoryId);
      } catch (err) {
        console.error("Error loading category:", err);
      }
    } else if (searchQuery.trim()) {
      products = await productService.searchProducts(searchQuery);
    } else {
      products = await productService.getAllProducts();
    }
    return {
      products,
      searchQuery,
      categoryId,
      category,
      error: error ? decodeURIComponent(error) : null,
      success: success ? decodeURIComponent(success) : null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      products: [],
      searchQuery: "",
      categoryId: "",
      category: null,
      error: message,
      success: null
    };
  }
};
export {
  load
};
