// API: Similar products endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSimilarProductRecommendations } from '$lib/utils/recommendations';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const productId = params.id;
		const limit = parseInt(url.searchParams.get('limit') || '6');

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const similarProducts = await getSimilarProductRecommendations(productId, limit);

		return json({ similarProducts });
	} catch (error: any) {
		console.error('Similar products error:', error);
		return json({ error: error.message || 'Failed to get similar products' }, { status: 500 });
	}
};

