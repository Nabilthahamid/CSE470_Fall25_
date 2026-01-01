// API: Admin AI Inventory Predictions endpoint
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

		// Get inventory predictions
		const predictions = await aiService.predictInventory(products, sales);

		return json({ predictions });
	} catch (error: any) {
		console.error('AI Inventory error:', error);
		return json(
			{ error: error.message || 'Failed to generate inventory predictions' },
			{ status: 500 }
		);
	}
};

