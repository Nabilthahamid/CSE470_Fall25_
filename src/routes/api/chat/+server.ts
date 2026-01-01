// API: Chat endpoint for AI chatbot
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { message, userId, conversationHistory } = await request.json();

		if (!message || typeof message !== 'string' || message.trim().length === 0) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		// Use userId from request or from session
		const effectiveUserId = userId || locals.user?.id || null;

		// Get AI response
		const response = await aiService.handleChatMessage(
			message.trim(),
			effectiveUserId,
			conversationHistory || []
		);

		return json({ response });
	} catch (error) {
		console.error('Chat API error:', error);
		return json(
			{ error: 'Failed to process chat message. Please try again.' },
			{ status: 500 }
		);
	}
};
