// API: Admin AI Sales Analytics endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SaleModel } from '$lib/models/SaleModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		// Get filters from query params
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const productId = url.searchParams.get('productId') || undefined;

		const filters: any = {};
		if (startDate) filters.startDate = startDate;
		if (endDate) filters.endDate = endDate;
		if (productId) filters.productId = productId;

		const salesModels = await SaleModel.getAll();
		let sales = salesModels.map(s => s.toJSON());
		
		// Apply filters
		if (filters.startDate) {
			sales = sales.filter(s => new Date(s.created_at) >= new Date(filters.startDate));
		}
		if (filters.endDate) {
			sales = sales.filter(s => new Date(s.created_at) <= new Date(filters.endDate));
		}
		if (filters.productId) {
			sales = sales.filter(s => s.product_id === filters.productId);
		}

		// Basic analytics (AI service removed)
		const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
		const analytics = {
			totalRevenue,
			totalSales: sales.length,
			averageOrderValue: sales.length > 0 ? totalRevenue / sales.length : 0
		};

		return json(analytics);
	} catch (error: any) {
		console.error('AI Sales Analytics error:', error);
		return json(
			{ error: error.message || 'Failed to generate AI analytics' },
			{ status: 500 }
		);
	}
};

