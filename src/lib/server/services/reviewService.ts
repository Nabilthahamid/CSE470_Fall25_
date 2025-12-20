import { supabaseAdmin } from "$lib/server/db/supabase";
import type { Database } from "$lib/types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

/**
 * Review Service - Business Logic Layer
 * Handles all review and rating operations
 */

export interface ReviewWithUser extends Review {
  user: {
    email: string;
    full_name: string | null;
  };
}

export interface ProductReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    rating: number;
    count: number;
  }[];
}

/**
 * Check if a user has purchased a product
 * @param userId - The user ID
 * @param productId - The product ID
 * @returns True if user has purchased the product, false otherwise
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  // First get orders for the user
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["delivered", "shipped", "processing"]);

  if (ordersError || !orders || orders.length === 0) {
    return false;
  }

  const orderIds = orders.map((o) => o.id);

  // Check if any order items match the product
  const { data, error } = await supabaseAdmin
    .from("order_items")
    .select("id")
    .eq("product_id", productId)
    .in("order_id", orderIds)
    .limit(1);

  if (error) {
    console.error("Error checking purchase:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Get all reviews for a product
 * @param productId - The product ID
 * @returns Array of reviews with user information
 */
export async function getProductReviews(
  productId: string
): Promise<ReviewWithUser[]> {
  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
  }

  if (!reviews || reviews.length === 0) {
    return [];
  }

  // Get user information for each review
  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
  }

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { email: p.email, full_name: p.full_name }]) ||
      []
  );

  return reviews.map((review) => ({
    ...review,
    user: profileMap.get(review.user_id) || {
      email: "Unknown",
      full_name: null,
    },
  }));
}

/**
 * Get review statistics for a product
 * @param productId - The product ID
 * @returns Review statistics including average rating and distribution
 */
export async function getProductReviewStats(
  productId: string
): Promise<ProductReviewStats> {
  const { data: reviews, error } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) {
    throw new Error(`Failed to fetch review stats: ${error.message}`);
  }

  if (!reviews || reviews.length === 0) {
    return {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: 0,
      })),
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Calculate rating distribution
  const distribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  return {
    average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    total_reviews: reviews.length,
    rating_distribution: distribution,
  };
}

/**
 * Create a new review
 * @param productId - The product ID
 * @param userId - The user ID
 * @param rating - Rating (1-5)
 * @param comment - Optional review comment
 * @returns Created review
 */
export async function createReview(
  productId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check if user has purchased the product
  const hasPurchased = await hasUserPurchasedProduct(userId, productId);
  if (!hasPurchased) {
    throw new Error(
      "You must purchase this product before you can leave a review"
    );
  }

  // Check if user already reviewed this product
  const { data: existingReview } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();

  if (existingReview) {
    throw new Error("You have already reviewed this product");
  }

  // Create the review
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment || null,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create review: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create review: No data returned");
  }

  return data;
}

/**
 * Update an existing review
 * @param reviewId - The review ID
 * @param userId - The user ID (for authorization)
 * @param rating - Updated rating (1-5)
 * @param comment - Updated comment
 * @returns Updated review
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Verify the review belongs to the user
  const { data: review, error: fetchError } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !review) {
    throw new Error(
      "Review not found or you don't have permission to update it"
    );
  }

  // Update the review
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({
      rating,
      comment: comment || null,
    } as any)
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to update review: No data returned");
  }

  return data;
}

/**
 * Delete a review
 * @param reviewId - The review ID
 * @param userId - The user ID (for authorization)
 */
export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<void> {
  // Verify the review belongs to the user
  const { data: review, error: fetchError } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !review) {
    throw new Error(
      "Review not found or you don't have permission to delete it"
    );
  }

  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}

/**
 * Get user's review for a product
 * @param productId - The product ID
 * @param userId - The user ID
 * @returns User's review if exists, null otherwise
 */
export async function getUserReview(
  productId: string,
  userId: string
): Promise<Review | null> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No review found
    }
    throw new Error(`Failed to fetch user review: ${error.message}`);
  }

  return data;
}
