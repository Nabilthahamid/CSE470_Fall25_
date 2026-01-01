// API: Cart Recommendations endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { cartItems } = await request.json();

		if (!cartItems || !Array.isArray(cartItems)) {
			return json({ error: 'Cart items array is required' }, { status: 400 });
		}

		// Ensure cart items have product data
		const validCartItems = cartItems.filter(item => item.product && item.product_id);

		if (validCartItems.length === 0) {
			return json({
				recommendations: [],
				summary: 'No valid cart items found.'
			});
		}

		// Fetch all products for recommendations
		const allProducts = await productService.getAllProducts();

		const recommendations = await aiService.recommendCartProducts(validCartItems, allProducts);

		return json(recommendations);
	} catch (error: any) {
		console.error('Cart recommendations error:', error);
		return json(
			{ error: error.message || 'Failed to get recommendations' },
			{ status: 500 }
		);
	}
};

