// API: Review Summary endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { reviewService } from '$lib/services/ReviewService';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const productId = url.searchParams.get('productId');

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const reviews = await reviewService.getReviewsByProduct(productId);

		const summary = await aiService.generateReviewSummary(
			reviews.map(r => ({ rating: r.rating, comment: r.comment }))
		);

		return json(summary);
	} catch (error: any) {
		console.error('Review summary error:', error);
		return json(
			{ error: error.message || 'Failed to generate review summary' },
			{ status: 500 }
		);
	}
};

