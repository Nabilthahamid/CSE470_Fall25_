import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { r as reviewService } from "../../../../../chunks/ReviewService.js";
const GET = async ({ url }) => {
  try {
    const productId = url.searchParams.get("productId");
    if (!productId) {
      return json({ error: "Product ID is required" }, { status: 400 });
    }
    const reviews = await reviewService.getReviewsByProduct(productId);
    const summary = await aiService.generateReviewSummary(
      reviews.map((r) => ({ rating: r.rating, comment: r.comment }))
    );
    return json(summary);
  } catch (error) {
    console.error("Review summary error:", error);
    return json(
      { error: error.message || "Failed to generate review summary" },
      { status: 500 }
    );
  }
};
export {
  GET
};
