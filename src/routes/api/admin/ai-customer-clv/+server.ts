// API: Customer Lifetime Value endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { saleService } from '$lib/services/SaleService';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		const userId = url.searchParams.get('userId');

		if (!userId) {
			return json({ error: 'userId parameter is required' }, { status: 400 });
		}

		const allSales = await saleService.getAllSales();
		const sales = allSales.filter(s => s.user_id === userId);
		const clv = await aiService.calculateCustomerLifetimeValue(userId, sales);

		return json(clv);
	} catch (error: any) {
		console.error('CLV Calculation error:', error);
		return json(
			{ error: error.message || 'Failed to calculate customer lifetime value' },
			{ status: 500 }
		);
	}
};

