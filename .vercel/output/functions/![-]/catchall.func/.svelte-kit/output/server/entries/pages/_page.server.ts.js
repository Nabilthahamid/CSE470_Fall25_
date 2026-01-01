import { productService } from "../../chunks/ProductService.js";
import { pcBuildService } from "../../chunks/PCBuildService.js";
import { h as handleError } from "../../chunks/errors.js";
const load = async ({ url }) => {
  try {
    const products = await productService.getAllProducts();
    let categories = [];
    try {
      categories = await pcBuildService.getAllCategories();
    } catch (error2) {
      console.error("Error loading component categories:", error2);
    }
    const productsByCategory = {};
    const regularProducts = [];
    products.forEach((product) => {
      const productWithCategory = product;
      if (productWithCategory.component_category_id) {
        const catId = productWithCategory.component_category_id;
        if (!productsByCategory[catId]) {
          productsByCategory[catId] = [];
        }
        productsByCategory[catId].push(product);
      } else {
        regularProducts.push(product);
      }
    });
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.display_name;
    });
    const error = url.searchParams.get("error");
    const success = url.searchParams.get("success");
    return {
      products,
      productsByCategory,
      regularProducts,
      categories,
      categoryMap,
      error: error ? decodeURIComponent(error) : null,
      success: success ? decodeURIComponent(success) : null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      products: [],
      productsByCategory: {},
      regularProducts: [],
      categories: [],
      categoryMap: {},
      error: message,
      success: null
    };
  }
};
export {
  load
};
