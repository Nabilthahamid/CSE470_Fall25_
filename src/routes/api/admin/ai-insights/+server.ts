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

		// Get enhanced AI insights
		const [salesPrediction, salesPredictionEnhanced, stockRecommendations, stockRecommendationsEnhanced, customerInsights, customerInsightsEnhanced] = await Promise.all([
			aiService.predictSales(sales), // Keep old method for backward compatibility
			aiService.predictSalesEnhanced(sales),
			aiService.getStockRecommendations(products, sales), // Keep old method
			aiService.getStockRecommendationsEnhanced(products, sales),
			aiService.getCustomerInsights(sales), // Keep old method
			aiService.getCustomerInsightsEnhanced(sales)
		]);

		return json({
			salesPrediction: salesPredictionEnhanced, // Use enhanced version
			stockRecommendations: stockRecommendationsEnhanced.slice(0, 10), // Top 10
			customerInsights: customerInsightsEnhanced // Use enhanced version
		});
	} catch (error: any) {
		console.error('AI Insights error:', error);
		return json(
			{ error: error.message || 'Failed to generate AI insights' },
			{ status: 500 }
		);
	}
};

