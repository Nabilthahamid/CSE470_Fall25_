// API: Admin AI Insights endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { saleService } from '$lib/services/SaleService';
import { productService } from '$lib/services/ProductService';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		requireAdmin(locals.user);

		// Get sales and products data
		const sales = await saleService.getAllSales();
		const products = await productService.getAllProducts();

		// Get AI insights
		const [salesPrediction, stockRecommendations, customerInsights] = await Promise.all([
			aiService.predictSales(sales),
			aiService.getStockRecommendations(products, sales),
			aiService.getCustomerInsights(sales)
		]);

		return json({
			salesPrediction,
			stockRecommendations: stockRecommendations.slice(0, 5), // Top 5
			customerInsights
		});
	} catch (error: any) {
		console.error('AI Insights error:', error);
		return json(
			{ error: error.message || 'Failed to generate AI insights' },
			{ status: 500 }
		);
	}
};

