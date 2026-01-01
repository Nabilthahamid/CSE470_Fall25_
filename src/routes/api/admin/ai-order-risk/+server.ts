// API: Order Risk Scoring endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { orderService } from '$lib/services/OrderService';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		const orderId = url.searchParams.get('orderId');

		if (orderId) {
			// Get risk score for a specific order
			const order = await orderService.getOrderById(orderId);
			if (!order) {
				return json({ error: 'Order not found' }, { status: 404 });
			}
			const riskScore = await aiService.scoreOrderRisk(order);
			return json(riskScore);
		} else {
			// Get risk scores for all orders
			const orders = await orderService.getAllOrders();
			const riskScores = await Promise.all(
				orders.map(order => aiService.scoreOrderRisk(order))
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

