// API: Admin AI Sales Analytics endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { saleService } from '$lib/services/SaleService';
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

		const sales = await saleService.getAllSales(filters);

		// Get AI analytics
		const analytics = await aiService.analyzeSales(sales);

		return json(analytics);
	} catch (error: any) {
		console.error('AI Sales Analytics error:', error);
		return json(
			{ error: error.message || 'Failed to generate AI analytics' },
			{ status: 500 }
		);
	}
};

