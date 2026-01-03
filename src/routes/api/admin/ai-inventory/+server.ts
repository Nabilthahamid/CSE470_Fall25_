// API: Admin AI Inventory Predictions endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SaleModel } from '$lib/models/SaleModel';
import { ProductModel } from '$lib/models/ProductModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		requireAdmin(locals.user);

		const salesModels = await SaleModel.getAll();
		const sales = salesModels.map(s => s.toJSON());
		const productsModels = await ProductModel.getAll();
		const products = productsModels.map(p => p.toJSON());

		// Basic inventory predictions (AI service removed)
		const predictions: any[] = [];

		return json({ predictions });
	} catch (error: any) {
		console.error('AI Inventory error:', error);
		return json(
			{ error: error.message || 'Failed to generate inventory predictions' },
			{ status: 500 }
		);
	}
};

