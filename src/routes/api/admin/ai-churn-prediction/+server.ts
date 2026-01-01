// API: Customer Churn Prediction endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { saleService } from '$lib/services/SaleService';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		requireAdmin(locals.user);

		const sales = await saleService.getAllSales();
		const churnPredictions = await aiService.predictChurn(sales);

		return json({ churnPredictions });
	} catch (error: any) {
		console.error('Churn Prediction error:', error);
		return json(
			{ error: error.message || 'Failed to predict customer churn' },
			{ status: 500 }
		);
	}
};

