// API: Personalized product recommendations
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPersonalizedRecommendations } from '$lib/utils/recommendations';
import { CartModel } from '$lib/models/CartModel';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const userId = locals.user?.id;
		const limit = parseInt(url.searchParams.get('limit') || '10');

		if (!userId) {
			return json({ recommendations: [], message: 'Please log in for personalized recommendations' });
		}

		// Get cart items
		let cartItems: string[] = [];
		try {
			const cart = await CartModel.getCartItems(userId);
			cartItems = cart.map(item => item.product_id);
		} catch (error) {
			console.warn('Could not fetch cart items:', error);
		}

		// Get recommendations (simplified - can be enhanced with browsing/purchase history)
		const recommendations = await getPersonalizedRecommendations({
			userId,
			cartItems
		}, limit);

		return json({ recommendations });
	} catch (error: any) {
		console.error('Recommendations error:', error);
		return json({ error: error.message || 'Failed to get recommendations' }, { status: 500 });
	}
};

