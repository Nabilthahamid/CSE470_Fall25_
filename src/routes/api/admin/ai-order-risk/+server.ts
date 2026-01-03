// API: Order Risk Scoring endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { scoreOrderRisk } from '$lib/utils/ai';
import { OrderModel } from '$lib/models/OrderModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		const orderId = url.searchParams.get('orderId');

		if (orderId) {
			// Get risk score for a specific order
			const orderModel = await OrderModel.getById(orderId);
			if (!orderModel) {
				return json({ error: 'Order not found' }, { status: 404 });
			}
			const riskScore = await scoreOrderRisk(orderModel.toJSON());
			return json(riskScore);
		} else {
			// Get risk scores for all orders
			const ordersModels = await OrderModel.getAll();
			const orders = ordersModels.map(o => o.toJSON());
			const riskScores = await Promise.all(
				orders.map(order => scoreOrderRisk(order))
			);
			return json({ riskScores });
		}
	} catch (error: any) {
		console.error('Order Risk Scoring error:', error);
		return json(
			{ error: error.message || 'Failed to calculate order risk scores' },
			{ status: 500 }
		);
	}
};

