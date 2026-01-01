import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
const POST = async ({ request }) => {
  try {
    const { rating, comment, user_id } = await request.json();
    if (rating === void 0) {
      return json({ error: "Rating is required" }, { status: 400 });
    }
    const moderation = await aiService.moderateReview({ rating, comment, user_id });
    return json(moderation);
  } catch (error) {
    console.error("Review moderation error:", error);
    return json(
      { error: error.message || "Failed to moderate review" },
      { status: 500 }
    );
  }
};
export {
  POST
};
