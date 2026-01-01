import { s as supabase } from "./supabase.js";
class ProductRepositoryImpl {
  async getAll() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return data || [];
  }
  async search(query) {
    if (!query || query.trim().length === 0) {
      return this.getAll();
    }
    const searchTerm = `%${query.trim()}%`;
    const { data: nameData } = await supabase.from("products").select("*").ilike("name", searchTerm).order("created_at", { ascending: false });
    const { data: descData } = await supabase.from("products").select("*").ilike("description", searchTerm).order("created_at", { ascending: false });
    const combined = [...nameData || [], ...descData || []];
    const unique = combined.filter(
      (product, index, self) => index === self.findIndex((p) => p.id === product.id)
    );
    return unique;
  }
  async getByCategory(categoryId) {
    const { data, error } = await supabase.from("products").select("*").eq("component_category_id", categoryId).order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch products by category: ${error.message}`);
    return data || [];
  }
  async getById(id) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
    return data;
  }
  async create(input) {
    const insertData = {
      ...input,
      cost_price: input.cost_price ?? 0,
      component_category_id: input.component_category_id || null,
      brand: input.brand || null,
      specifications: input.specifications || null
    };
    const { data, error } = await supabase.from("products").insert(insertData).select().single();
    if (error) throw new Error(`Failed to create product: ${error.message}`);
    return data;
  }
  async update(id, input) {
    const { data, error } = await supabase.from("products").update({ ...input, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update product: ${error.message}`);
    return data;
  }
  async delete(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete product: ${error.message}`);
  }
}
class ProductService {
  repository;
  constructor(repository) {
    this.repository = repository || new ProductRepositoryImpl();
  }
  /**
   * Get all products
   */
  async getAllProducts() {
    return await this.repository.getAll();
  }
  /**
   * Search products by name or description
   */
  async searchProducts(query) {
    return await this.repository.search(query);
  }
  /**
   * Get products by category ID
   */
  async getProductsByCategory(categoryId) {
    if (!categoryId) throw new Error("Category ID is required");
    return await this.repository.getByCategory(categoryId);
  }
  /**
   * Filter products with advanced filters
   */
  async filterProducts(filters) {
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }
    if (filters.categoryId) {
      query = query.eq("component_category_id", filters.categoryId);
    }
    if (filters.brand) {
      query = query.ilike("brand", `%${filters.brand}%`);
    }
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case "in_stock":
          query = query.gt("stock", 0);
          break;
        case "low_stock":
          query = query.gt("stock", 0).lte("stock", 10);
          break;
        case "out_of_stock":
          query = query.eq("stock", 0);
          break;
      }
    }
    if (filters.minPrice !== void 0) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== void 0) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to filter products: ${error.message}`);
    return data || [];
  }
  /**
   * Get product by ID
   */
  async getProductById(id) {
    if (!id) throw new Error("Product ID is required");
    const product = await this.repository.getById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }
  /**
   * Create product with validation
   */
  async createProduct(input) {
    if (!input.name || input.name.trim().length < 2) {
      throw new Error("Product name must be at least 2 characters");
    }
    if (!input.description || input.description.trim().length < 5) {
      throw new Error("Product description must be at least 5 characters");
    }
    if (input.price < 0) {
      throw new Error("Price cannot be negative");
    }
    const costPrice = input.cost_price || 0;
    if (costPrice < 0) {
      throw new Error("Cost price cannot be negative");
    }
    if (input.stock < 0) {
      throw new Error("Stock cannot be negative");
    }
    return await this.repository.create(input);
  }
  /**
   * Update product with validation
   */
  async updateProduct(id, input) {
    if (!id) throw new Error("Product ID is required");
    if (input.name && input.name.trim().length < 2) {
      throw new Error("Product name must be at least 2 characters");
    }
    if (input.description && input.description.trim().length < 5) {
      throw new Error("Product description must be at least 5 characters");
    }
    if (input.price !== void 0 && input.price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (input.cost_price !== void 0 && input.cost_price < 0) {
      throw new Error("Cost price cannot be negative");
    }
    if (input.stock !== void 0 && input.stock < 0) {
      throw new Error("Stock cannot be negative");
    }
    return await this.repository.update(id, input);
  }
  /**
   * Delete product
   */
  async deleteProduct(id) {
    if (!id) throw new Error("Product ID is required");
    await this.repository.delete(id);
  }
}
const productService = new ProductService();
export {
  ProductService,
  productService
};
