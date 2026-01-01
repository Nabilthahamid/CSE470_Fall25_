// API: Admin AI Price Optimization endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { saleService } from '$lib/services/SaleService';
import { productService } from '$lib/services/ProductService';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		requireAdmin(locals.user);

		const sales = await saleService.getAllSales();
		const products = await productService.getAllProducts();

		// Get price optimizations
		const optimizations = await aiService.optimizePrices(products, sales);

		return json({ optimizations });
	} catch (error: any) {
		console.error('AI Price Optimization error:', error);
		return json(
			{ error: error.message || 'Failed to generate price optimizations' },
			{ status: 500 }
		);
	}
};

