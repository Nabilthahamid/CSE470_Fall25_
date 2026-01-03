// API: Review Sentiment Analysis endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeReviewSentiment } from '$lib/utils/ai';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { rating, comment } = await request.json();

		if (rating === undefined) {
			return json({ error: 'Rating is required' }, { status: 400 });
		}

		const analysis = await analyzeReviewSentiment({ rating, comment });

		return json(analysis);
	} catch (error: any) {
		console.error('Sentiment analysis error:', error);
		return json(
			{ error: error.message || 'Failed to analyze sentiment' },
			{ status: 500 }
		);
	}
};

