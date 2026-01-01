import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
const POST = async ({ request }) => {
  try {
    const { rating, comment } = await request.json();
    if (rating === void 0) {
      return json({ error: "Rating is required" }, { status: 400 });
    }
    const analysis = await aiService.analyzeReviewSentiment({ rating, comment });
    return json(analysis);
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return json(
      { error: error.message || "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
};
export {
  POST
};
