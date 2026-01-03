// CONTROLLER: AI Comparison Analysis endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { productIds } = await request.json();

		if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
			return json({ error: 'Product IDs are required' }, { status: 400 });
		}

		// Fetch product details
		const allProductsModels = await ProductModel.getAll();
		const allProducts = allProductsModels.map(p => p.toJSON());
		const products = allProducts.filter((p) => productIds.includes(p.id));

		if (products.length === 0) {
			return json({ error: 'No products found' }, { status: 404 });
		}

		// Basic comparison insights (AI service removed)
		const insights = {
			summary: `Comparing ${products.length} products`,
			recommendations: products.map((p, i) => `${i + 1}. ${p.name} - ${p.price} Tk`),
			bestValue: products.sort((a, b) => a.price - b.price)[0]?.name || 'N/A'
		};

		return json({ insights, products });
	} catch (error) {
		const { message } = handleError(error);
		return json({ error: message }, { status: 500 });
	}
};

