// CONTROLLER: AI Comparison Analysis endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { productIds } = await request.json();

		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			return json({ error: 'Product IDs are required' }, { status: 400 });
		}

		// Fetch product details
		const allProducts = await productService.getAllProducts();
		const products = allProducts.filter((p) => productIds.includes(p.id));

		if (products.length === 0) {
			return json({ error: 'No products found' }, { status: 404 });
		}

		// Analyze products with AI
		const insights = await aiService.analyzeComparisonWithAI(products);

		return json({ insights, products });
	} catch (error) {
		const { message } = handleError(error);
		return json({ error: message }, { status: 500 });
	}
};

