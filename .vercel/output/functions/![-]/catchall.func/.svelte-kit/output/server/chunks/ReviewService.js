import { s as supabase } from "./supabase.js";
class ReviewRepositoryImpl {
  async getAll(filters) {
    let query = supabase.from("reviews").select(
      `
				*,
				products(name),
				users(name)
			`
    ).order("created_at", { ascending: false });
    if (filters?.productId) {
      query = query.eq("product_id", filters.productId);
    }
    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.minRating) {
      query = query.gte("rating", filters.minRating);
    }
    const { data, error } = await query;
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return [];
      }
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
    return (data || []).map((review) => ({
      ...review,
      product_name: review.products?.name,
      user_name: review.users?.name
    }));
  }
  async getById(id) {
    const { data, error } = await supabase.from("reviews").select(
      `
				*,
				products!inner(name),
				users!inner(name)
			`
    ).eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch review: ${error.message}`);
    }
    return {
      ...data,
      product_name: data.products?.name,
      user_name: data.users?.name
    };
  }
  async getByProduct(productId) {
    return this.getAll({ productId });
  }
  async getByUser(userId) {
    return this.getAll({ userId });
  }
  async create(input, userId) {
    const { data: purchases, error: purchaseError } = await supabase.from("sales").select("id").eq("product_id", input.product_id).eq("user_id", userId).limit(1);
    if (purchaseError) {
      throw new Error(`Failed to check purchase status: ${purchaseError.message}`);
    }
    if (!purchases || purchases.length === 0) {
      throw new Error("You must purchase this product before you can review it");
    }
    const existing = await supabase.from("reviews").select("id").eq("product_id", input.product_id).eq("user_id", userId).maybeSingle();
    if (existing.data) {
      throw new Error("You have already reviewed this product");
    }
    const { data, error } = await supabase.from("reviews").insert({
      product_id: input.product_id,
      user_id: userId,
      rating: input.rating,
      comment: input.comment || null
    }).select().single();
    if (error) throw new Error(`Failed to create review: ${error.message}`);
    return data;
  }
  async update(id, userId, input) {
    const { data, error } = await supabase.from("reviews").update({
      ...input,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id).eq("user_id", userId).select().single();
    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Review not found or you do not have permission to update it");
      }
      throw new Error(`Failed to update review: ${error.message}`);
    }
    return data;
  }
  async delete(id, userId) {
    const { error } = await supabase.from("reviews").delete().eq("id", id).eq("user_id", userId);
    if (error) throw new Error(`Failed to delete review: ${error.message}`);
  }
  async getProductAverageRating(productId) {
    const { data, error } = await supabase.from("reviews").select("rating").eq("product_id", productId);
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return 0;
      }
      throw new Error(`Failed to fetch rating: ${error.message}`);
    }
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return sum / data.length;
  }
}
class ReviewService {
  repository;
  constructor(repository) {
    this.repository = repository || new ReviewRepositoryImpl();
  }
  async getAllReviews(filters) {
    return await this.repository.getAll(filters);
  }
  async getReviewById(id) {
    if (!id) throw new Error("Review ID is required");
    const review = await this.repository.getById(id);
    if (!review) throw new Error("Review not found");
    return review;
  }
  async getReviewsByProduct(productId) {
    return await this.repository.getByProduct(productId);
  }
  async getReviewsByUser(userId) {
    return await this.repository.getByUser(userId);
  }
  async createReview(input, userId) {
    if (!input.product_id) throw new Error("Product ID is required");
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    return await this.repository.create(input, userId);
  }
  async updateReview(id, userId, input) {
    if (!id) throw new Error("Review ID is required");
    if (input.rating !== void 0 && (input.rating < 1 || input.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }
    return await this.repository.update(id, userId, input);
  }
  async deleteReview(id, userId) {
    if (!id) throw new Error("Review ID is required");
    await this.repository.delete(id, userId);
  }
  async getProductAverageRating(productId) {
    return await this.repository.getProductAverageRating(productId);
  }
}
const reviewService = new ReviewService();
export {
  reviewService as r
};
