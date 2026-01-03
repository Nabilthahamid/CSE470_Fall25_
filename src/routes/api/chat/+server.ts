// API: Chat endpoint for AI chatbot
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { handleChatMessage } from '$lib/utils/ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { message, userId, conversationHistory } = await request.json();

		if (!message || typeof message !== 'string' || message.trim().length === 0) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		// Use userId from request or from session
		const effectiveUserId = userId || locals.user?.id || null;

		// Get AI response with product suggestions
		const result = await handleChatMessage(
			message.trim(),
			effectiveUserId,
			conversationHistory || []
		);

		return json({ 
			response: result.response,
			products: result.products || []
		});
	} catch (error) {
		console.error('Chat API error:', error);
		return json(
			{ error: 'Failed to process chat message. Please try again.' },
			{ status: 500 }
		);
	}
};
