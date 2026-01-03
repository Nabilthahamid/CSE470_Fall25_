// API: Customer Lifetime Value endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SaleModel } from '$lib/models/SaleModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		const userId = url.searchParams.get('userId');

		if (!userId) {
			return json({ error: 'userId parameter is required' }, { status: 400 });
		}

		const allSalesModels = await SaleModel.getAll();
		const sales = allSalesModels.filter(s => s.user_id === userId).map(s => s.toJSON());
		// Basic CLV calculation (AI service removed)
		const totalValue = sales.reduce((sum, s) => sum + s.total_amount, 0);
		const clv = {
			userId,
			lifetimeValue: totalValue,
			averageOrderValue: sales.length > 0 ? totalValue / sales.length : 0,
			totalOrders: sales.length
		};

		return json(clv);
	} catch (error: any) {
		console.error('CLV Calculation error:', error);
		return json(
			{ error: error.message || 'Failed to calculate customer lifetime value' },
			{ status: 500 }
		);
	}
};

