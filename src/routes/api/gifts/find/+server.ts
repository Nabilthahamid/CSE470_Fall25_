// API: Gift finder
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { giftRecommendationService } from '$lib/services/GiftRecommendationService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const criteria = await request.json();
		const limit = criteria.limit || 10;

		const gifts = await giftRecommendationService.findGifts(criteria, limit);
		const bundles = await giftRecommendationService.suggestGiftBundles(criteria, 5);

		return json({ gifts, bundles });
	} catch (error: any) {
		console.error('Gift finder error:', error);
		return json({ error: error.message || 'Failed to find gifts' }, { status: 500 });
	}
};

