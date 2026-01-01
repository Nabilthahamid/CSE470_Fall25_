import { s as supabase } from "./supabase.js";
import { productService } from "./ProductService.js";
class ComponentCategoryRepositoryImpl {
  async getAll() {
    const { data, error } = await supabase.from("component_categories").select("*").order("display_order", { ascending: true });
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return [];
      }
      throw new Error(`Failed to fetch component categories: ${error.message}`);
    }
    return data || [];
  }
  async getById(id) {
    const { data, error } = await supabase.from("component_categories").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch component category: ${error.message}`);
    }
    return data;
  }
  async getByName(name) {
    const { data, error } = await supabase.from("component_categories").select("*").eq("name", name).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch component category: ${error.message}`);
    }
    return data;
  }
}
class PCBuildRepositoryImpl {
  async getAll(userId) {
    let query = supabase.from("pc_builds").select("*");
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch PC builds: ${error.message}`);
    return data || [];
  }
  async getById(id, userId) {
    let query = supabase.from("pc_builds").select("*").eq("id", id);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query.single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch PC build: ${error.message}`);
    }
    if (!data) return null;
    const components = await this.getBuildComponents(id);
    return { ...data, components };
  }
  async getBuildComponents(buildId) {
    const { data, error } = await supabase.from("pc_build_components").select("*").eq("build_id", buildId);
    if (error) throw new Error(`Failed to fetch build components: ${error.message}`);
    const componentsWithData = await Promise.all(
      (data || []).map(async (component) => {
        const [product, category] = await Promise.all([
          productService.getProductById(component.product_id),
          supabase.from("component_categories").select("*").eq("id", component.component_category_id).single()
        ]);
        return {
          ...component,
          product: product || void 0,
          category: category.data || void 0
        };
      })
    );
    return componentsWithData;
  }
  async create(userId, input) {
    let totalPrice = 0;
    if (input.components && input.components.length > 0) {
      for (const comp of input.components) {
        const product = await productService.getProductById(comp.product_id);
        if (product) {
          totalPrice += product.price * (comp.quantity || 1);
        }
      }
    }
    const { data: buildData, error: buildError } = await supabase.from("pc_builds").insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      total_price: totalPrice
    }).select().single();
    if (buildError) throw new Error(`Failed to create PC build: ${buildError.message}`);
    if (input.components && input.components.length > 0) {
      const componentsToInsert = input.components.map((comp) => ({
        build_id: buildData.id,
        product_id: comp.product_id,
        component_category_id: comp.component_category_id,
        quantity: comp.quantity || 1
      }));
      const { error: compError } = await supabase.from("pc_build_components").insert(componentsToInsert);
      if (compError) {
        await supabase.from("pc_builds").delete().eq("id", buildData.id);
        throw new Error(`Failed to add components: ${compError.message}`);
      }
    }
    return await this.getById(buildData.id, userId) || buildData;
  }
  async update(id, userId, input) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("PC build not found or access denied");
    }
    let totalPrice = existing.total_price;
    if (input.components) {
      totalPrice = 0;
      for (const comp of input.components) {
        const product = await productService.getProductById(comp.product_id);
        if (product) {
          totalPrice += product.price * (comp.quantity || 1);
        }
      }
    }
    const updateData = {};
    if (input.name !== void 0) updateData.name = input.name;
    if (input.description !== void 0) updateData.description = input.description;
    if (input.components) updateData.total_price = totalPrice;
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("pc_builds").update(updateData).eq("id", id).eq("user_id", userId);
      if (error) throw new Error(`Failed to update PC build: ${error.message}`);
    }
    if (input.components) {
      await supabase.from("pc_build_components").delete().eq("build_id", id);
      if (input.components.length > 0) {
        const componentsToInsert = input.components.map((comp) => ({
          build_id: id,
          product_id: comp.product_id,
          component_category_id: comp.component_category_id,
          quantity: comp.quantity || 1
        }));
        const { error: compError } = await supabase.from("pc_build_components").insert(componentsToInsert);
        if (compError) {
          throw new Error(`Failed to update components: ${compError.message}`);
        }
      }
    }
    return await this.getById(id, userId) || existing;
  }
  async delete(id, userId) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("PC build not found or access denied");
    }
    const { error } = await supabase.from("pc_builds").delete().eq("id", id).eq("user_id", userId);
    if (error) throw new Error(`Failed to delete PC build: ${error.message}`);
  }
}
class PCBuildService {
  repository;
  categoryRepository;
  constructor(repository, categoryRepository) {
    this.repository = repository || new PCBuildRepositoryImpl();
    this.categoryRepository = categoryRepository || new ComponentCategoryRepositoryImpl();
  }
  async getAllBuilds(userId) {
    return await this.repository.getAll(userId);
  }
  async getBuildById(id, userId) {
    const build = await this.repository.getById(id, userId);
    if (!build) throw new Error("PC build not found");
    return build;
  }
  async createBuild(userId, input) {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Build name is required");
    }
    return await this.repository.create(userId, input);
  }
  async updateBuild(id, userId, input) {
    return await this.repository.update(id, userId, input);
  }
  async deleteBuild(id, userId) {
    return await this.repository.delete(id, userId);
  }
  async getAllCategories() {
    return await this.categoryRepository.getAll();
  }
  async getCategoryById(id) {
    const category = await this.categoryRepository.getById(id);
    if (!category) throw new Error("Component category not found");
    return category;
  }
  async getCategoryByName(name) {
    const category = await this.categoryRepository.getByName(name);
    if (!category) throw new Error("Component category not found");
    return category;
  }
}
const pcBuildService = new PCBuildService();
export {
  PCBuildService,
  pcBuildService
};
