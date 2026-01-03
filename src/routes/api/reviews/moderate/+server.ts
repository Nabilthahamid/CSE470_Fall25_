// API: Review Moderation endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { moderateReview } from '$lib/utils/ai';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { rating, comment, user_id } = await request.json();

		if (rating === undefined) {
			return json({ error: 'Rating is required' }, { status: 400 });
		}

		const moderation = await moderateReview({ rating, comment, user_id });

		return json(moderation);
	} catch (error: any) {
		console.error('Review moderation error:', error);
		return json(
			{ error: error.message || 'Failed to moderate review' },
			{ status: 500 }
		);
	}
};

