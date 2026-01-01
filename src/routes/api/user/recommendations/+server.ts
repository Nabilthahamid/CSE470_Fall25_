// API: Personalized product recommendations
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { userRecommendationService } from '$lib/services/UserRecommendationService';
import { cartService } from '$lib/services/CartService';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const userId = locals.user?.id;
		const limit = parseInt(url.searchParams.get('limit') || '10');

		if (!userId) {
			return json({ recommendations: [], message: 'Please log in for personalized recommendations' });
		}

		// Get user context
		const browsingHistory = await userRecommendationService.getUserBrowsingHistory(userId);
		const purchaseHistory = await userRecommendationService.getUserPurchaseHistory(userId);
		
		// Get cart items
		let cartItems: string[] = [];
		try {
			const cart = await cartService.getCartItems(userId);
			cartItems = cart.map(item => item.product_id);
		} catch (error) {
			console.warn('Could not fetch cart items:', error);
		}

		// Get recommendations
		const recommendations = await userRecommendationService.getPersonalizedRecommendations({
			userId,
			browsingHistory,
			purchaseHistory,
			cartItems
		}, limit);

		return json({ recommendations });
	} catch (error: any) {
		console.error('Recommendations error:', error);
		return json({ error: error.message || 'Failed to get recommendations' }, { status: 500 });
	}
};

