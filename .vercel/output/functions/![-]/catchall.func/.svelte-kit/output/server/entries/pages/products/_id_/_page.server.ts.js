import { error } from "@sveltejs/kit";
import { productService } from "../../../../chunks/ProductService.js";
import { r as reviewService } from "../../../../chunks/ReviewService.js";
import { s as saleService } from "../../../../chunks/SaleService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ params, locals }) => {
  try {
    const product = await productService.getProductById(params.id);
    let reviews = [];
    let averageRating = 0;
    try {
      reviews = await reviewService.getReviewsByProduct(params.id);
      averageRating = await reviewService.getProductAverageRating(params.id);
    } catch (reviewError) {
      console.error("Error loading reviews:", reviewError);
    }
    let canReview = false;
    if (locals.user?.id) {
      try {
        const userSales = await saleService.getAllSales({
          userId: locals.user.id,
          productId: params.id
        });
        canReview = userSales.length > 0;
      } catch (saleError) {
        console.error("Error checking sales:", saleError);
      }
    }
    let userReview = null;
    if (locals.user?.id) {
      try {
        const userReviews = await reviewService.getAllReviews({
          userId: locals.user.id,
          productId: params.id
        });
        userReview = userReviews.length > 0 ? userReviews[0] : null;
      } catch (reviewError) {
        console.error("Error loading user review:", reviewError);
      }
    }
    let relatedProducts = [];
    try {
      const allProducts = await productService.getAllProducts();
      relatedProducts = allProducts.filter((p) => p.id !== params.id && p.stock > 0).slice(0, 4);
    } catch (err) {
      console.error("Error loading related products:", err);
    }
    return {
      product,
      reviews,
      averageRating,
      canReview,
      userReview,
      relatedProducts,
      user: locals.user || null,
      error: null
    };
  } catch (err) {
    const { message, statusCode } = handleError(err);
    throw error(statusCode, message);
  }
};
const actions = {
  createReview: async ({ request, params, locals }) => {
    if (!locals.user) {
      return { error: "You must be logged in to review" };
    }
    const formData = await request.formData();
    const rating = parseInt(formData.get("rating")?.toString() || "0");
    const comment = formData.get("comment")?.toString() || "";
    try {
      const userSales = await saleService.getAllSales({
        userId: locals.user.id,
        productId: params.id
      });
      if (userSales.length === 0) {
        return { error: "You must purchase this product before you can review it" };
      }
      const existingReviews = await reviewService.getAllReviews({
        userId: locals.user.id,
        productId: params.id
      });
      if (existingReviews.length > 0) {
        return { error: "You have already reviewed this product" };
      }
      try {
        const { aiService } = await import("../../../../chunks/AIService.js");
        const moderation = await aiService.moderateReview({
          rating,
          comment: comment || null,
          user_id: locals.user.id
        });
        if (moderation.recommendation === "reject") {
          return { error: "Your review was flagged as inappropriate. Please revise and try again." };
        } else if (moderation.recommendation === "review" && moderation.flags.length > 0) {
          console.log("Review flagged for manual review:", moderation.flags);
        }
      } catch (modError) {
        console.error("Moderation check failed, proceeding with review:", modError);
      }
      await reviewService.createReview(
        {
          product_id: params.id,
          rating,
          comment: comment || null
        },
        locals.user.id
      );
      return { success: true };
    } catch (err) {
      const { message } = handleError(err);
      return { error: message };
    }
  },
  updateReview: async ({ request, params, locals }) => {
    if (!locals.user) {
      return { error: "You must be logged in" };
    }
    const formData = await request.formData();
    const reviewId = formData.get("review_id")?.toString();
    const rating = parseInt(formData.get("rating")?.toString() || "0");
    const comment = formData.get("comment")?.toString() || "";
    if (!reviewId) {
      return { error: "Review ID is required" };
    }
    try {
      await reviewService.updateReview(reviewId, locals.user.id, {
        rating,
        comment: comment || null
      });
      return { success: true };
    } catch (err) {
      const { message } = handleError(err);
      return { error: message };
    }
  },
  deleteReview: async ({ request, locals }) => {
    if (!locals.user) {
      return { error: "You must be logged in" };
    }
    const formData = await request.formData();
    const reviewId = formData.get("review_id")?.toString();
    if (!reviewId) {
      return { error: "Review ID is required" };
    }
    try {
      await reviewService.deleteReview(reviewId, locals.user.id);
      return { success: true };
    } catch (err) {
      const { message } = handleError(err);
      return { error: message };
    }
  }
};
export {
  actions,
  load
};
