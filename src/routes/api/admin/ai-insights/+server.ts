// API: Admin AI Insights endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SaleModel } from '$lib/models/SaleModel';
import { ProductModel } from '$lib/models/ProductModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		requireAdmin(locals.user);

		// Get sales and products data
		const salesModels = await SaleModel.getAll();
		const sales = salesModels.map(s => s.toJSON());
		const productsModels = await ProductModel.getAll();
		const products = productsModels.map(p => p.toJSON());

		// Basic insights (AI service removed)
		const salesPrediction = {
			nextMonth: 0,
			trend: 'stable',
			confidence: 0.5
		};
		const stockRecommendations = [];
		const customerInsights = {
			topCustomers: [],
			trends: []
		};

		return json({
			salesPrediction,
			stockRecommendations: stockRecommendations.slice(0, 10),
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

