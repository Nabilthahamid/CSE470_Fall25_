import { json } from "@sveltejs/kit";
import { aiService } from "../../../../chunks/AIService.js";
const POST = async ({ request, locals }) => {
  try {
    const { message, userId, conversationHistory } = await request.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return json({ error: "Message is required" }, { status: 400 });
    }
    const effectiveUserId = userId || locals.user?.id || null;
    const response = await aiService.handleChatMessage(
      message.trim(),
      effectiveUserId,
      conversationHistory || []
    );
    return json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return json(
      { error: "Failed to process chat message. Please try again." },
      { status: 500 }
    );
  }
};
export {
  POST
};
