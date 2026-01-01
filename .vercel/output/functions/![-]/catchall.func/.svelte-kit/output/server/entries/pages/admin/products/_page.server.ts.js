import "@sveltejs/kit";
import { r as requireAdmin } from "../../../../chunks/auth.js";
import { productService } from "../../../../chunks/ProductService.js";
import { pcBuildService } from "../../../../chunks/PCBuildService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const searchQuery = url.searchParams.get("search") || "";
    const categoryId = url.searchParams.get("category") || "";
    const brand = url.searchParams.get("brand") || "";
    const stockStatus = url.searchParams.get("stockStatus") || "all";
    const minPrice = url.searchParams.get("minPrice") ? parseFloat(url.searchParams.get("minPrice")) : void 0;
    const maxPrice = url.searchParams.get("maxPrice") ? parseFloat(url.searchParams.get("maxPrice")) : void 0;
    const startDate = url.searchParams.get("startDate") || "";
    const endDate = url.searchParams.get("endDate") || "";
    const hasFilters = searchQuery || categoryId || brand || stockStatus !== "all" || minPrice !== void 0 || maxPrice !== void 0 || startDate || endDate;
    const products = hasFilters ? await productService.filterProducts({
      search: searchQuery || void 0,
      categoryId: categoryId || void 0,
      brand: brand || void 0,
      stockStatus,
      minPrice,
      maxPrice,
      startDate: startDate || void 0,
      endDate: endDate || void 0
    }) : await productService.getAllProducts();
    let categories = [];
    try {
      categories = await pcBuildService.getAllCategories();
    } catch (error) {
      console.error("Error loading component categories:", error);
    }
    let brands = [];
    try {
      const allProducts = await productService.getAllProducts();
      brands = [...new Set(allProducts.map((p) => p.brand).filter(Boolean))];
      brands.sort();
    } catch (error) {
      console.error("Error loading brands:", error);
    }
    return {
      products,
      categories,
      brands,
      searchQuery,
      filters: {
        categoryId,
        brand,
        stockStatus,
        minPrice: minPrice?.toString() || "",
        maxPrice: maxPrice?.toString() || "",
        startDate,
        endDate
      },
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      products: [],
      categories: [],
      brands: [],
      searchQuery: "",
      filters: {
        categoryId: "",
        brand: "",
        stockStatus: "all",
        minPrice: "",
        maxPrice: "",
        startDate: "",
        endDate: ""
      },
      error: message
    };
  }
};
const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const price = parseFloat(formData.get("price")?.toString() || "0");
    const cost_price = parseFloat(formData.get("cost_price")?.toString() || "0");
    const stock = parseInt(formData.get("stock")?.toString() || "0");
    const image_url = formData.get("image_url")?.toString() || null;
    const image_file = formData.get("image_file");
    const component_category_id = formData.get("component_category_id")?.toString() || null;
    const brand = formData.get("brand")?.toString() || null;
    const specifications = formData.get("specifications")?.toString() || null;
    let finalImageUrl = image_url || null;
    if (image_file && image_file.size > 0) {
      try {
        const { uploadImage } = await import("../../../../chunks/storage.js");
        finalImageUrl = await uploadImage(image_file);
      } catch (error) {
        const { message } = handleError(error);
        return {
          error: `Image upload failed: ${message}`,
          name,
          description,
          price,
          stock,
          image_url
        };
      }
    }
    try {
      await productService.createProduct({
        name,
        description,
        price,
        cost_price,
        stock,
        image_url: finalImageUrl,
        component_category_id: component_category_id || null,
        brand: brand || null,
        specifications: specifications || null
      });
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return {
        error: message,
        name,
        description,
        price,
        stock,
        image_url
      };
    }
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await productService.deleteProduct(id);
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
