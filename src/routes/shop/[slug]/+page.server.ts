import { getProductBySlug } from "$lib/server/services/productService";
import {
  getProductReviews,
  getProductReviewStats,
  hasUserPurchasedProduct,
  getUserReview,
} from "$lib/server/services/reviewService";
import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";

/**
 * Controller (Entry Point) - Single Product Detail
 * This file handles the server-side data loading for a single product page
 * Business logic is delegated to the productService
 */
export const load: PageServerLoad = async ({ params, locals }) => {
  const slug = params.slug;

  if (!slug) {
    throw error(400, "Product slug is required");
  }

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      throw error(404, `Product with slug "${slug}" not found`);
    }

    // Get reviews and stats
    const [reviews, reviewStats] = await Promise.all([
      getProductReviews(product.id),
      getProductReviewStats(product.id),
    ]);

    // Check if user has purchased and can review
    let canReview = false;
    let userReview = null;
    if (locals.user) {
      canReview = await hasUserPurchasedProduct(locals.user.id, product.id);
      if (canReview) {
        userReview = await getUserReview(product.id, locals.user.id);
      }
    }

    return {
      product,
      reviews,
      reviewStats,
      canReview,
      userReview,
      user: locals.user,
    };
  } catch (err) {
    // Re-throw SvelteKit errors
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    const message =
      err instanceof Error ? err.message : "Failed to load product";
    throw error(500, message);
  }
};

export const actions: Actions = {
  createReview: async ({ request, locals, params }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to leave a review" });
    }

    const slug = params.slug;
    if (!slug) {
      return fail(400, { error: "Product slug is required" });
    }

    const formData = await request.formData();
    const rating = formData.get("rating")?.toString();
    const comment = formData.get("comment")?.toString() || "";

    if (!rating) {
      return fail(400, { error: "Rating is required" });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return fail(400, { error: "Rating must be between 1 and 5" });
    }

    try {
      // Get product
      const product = await getProductBySlug(slug);
      if (!product) {
        return fail(404, { error: "Product not found" });
      }

      // Create review
      const { createReview } =
        await import("$lib/server/services/reviewService");
      await createReview(product.id, locals.user.id, ratingNum, comment);

      return { success: true, message: "Review submitted successfully" };
    } catch (err: any) {
      return fail(400, { error: err.message || "Failed to create review" });
    }
  },

  updateReview: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to update a review" });
    }

    const formData = await request.formData();
    const reviewId = formData.get("reviewId")?.toString();
    const rating = formData.get("rating")?.toString();
    const comment = formData.get("comment")?.toString() || "";

    if (!reviewId || !rating) {
      return fail(400, { error: "Review ID and rating are required" });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return fail(400, { error: "Rating must be between 1 and 5" });
    }

    try {
      const { updateReview } =
        await import("$lib/server/services/reviewService");
      await updateReview(reviewId, locals.user.id, ratingNum, comment);

      return { success: true, message: "Review updated successfully" };
    } catch (err: any) {
      return fail(400, { error: err.message || "Failed to update review" });
    }
  },

  deleteReview: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to delete a review" });
    }

    const formData = await request.formData();
    const reviewId = formData.get("reviewId")?.toString();

    if (!reviewId) {
      return fail(400, { error: "Review ID is required" });
    }

    try {
      const { deleteReview } =
        await import("$lib/server/services/reviewService");
      await deleteReview(reviewId, locals.user.id);

      return { success: true, message: "Review deleted successfully" };
    } catch (err: any) {
      return fail(400, { error: err.message || "Failed to delete review" });
    }
  },
};
