// API: Customer Churn Prediction endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SaleModel } from '$lib/models/SaleModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		requireAdmin(locals.user);

		const salesModels = await SaleModel.getAll();
		const sales = salesModels.map(s => s.toJSON());
		// Basic churn prediction (AI service removed)
		const churnPredictions: any[] = [];

		return json({ churnPredictions });
	} catch (error: any) {
		console.error('Churn Prediction error:', error);
		return json(
			{ error: error.message || 'Failed to predict customer churn' },
			{ status: 500 }
		);
	}
};

