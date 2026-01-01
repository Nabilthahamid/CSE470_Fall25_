// API: Analyze customer behavior using Gemini
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { aiService } from '$lib/services/AIService';
import { orderService } from '$lib/services/OrderService';

export const POST: RequestHandler = async ({ request, locals }) => {
	requireAdmin(locals.user);

	try {
		const { userId } = await request.json();

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Fetch user orders
		const orders = await orderService.getAllOrders({ userId });

		if (orders.length === 0) {
			return json({
				insights: 'No order history available for this customer.',
				recommendations: ['Encourage first purchase with welcome offer'],
				segment: 'New',
				error: null
			});
		}

		// Calculate metrics
		const totalOrders = orders.length;
		const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
		const averageOrderValue = totalSpent / totalOrders;

		// Calculate order frequency (orders per month)
		const firstOrder = new Date(orders[orders.length - 1].created_at);
		const lastOrder = new Date(orders[0].created_at);
		const monthsDiff = Math.max(1, (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24 * 30));
		const orderFrequency = totalOrders / monthsDiff;

		// Get preferred categories
		const categoryCounts: { [key: string]: number } = {};
		orders.forEach(order => {
			if (order.items) {
				order.items.forEach(item => {
					// Extract category from product name or use 'General'
					const category = 'General'; // Could be enhanced with actual category data
					categoryCounts[category] = (categoryCounts[category] || 0) + 1;
				});
			}
		});
		const preferredCategories = Object.keys(categoryCounts)
			.sort((a, b) => categoryCounts[b] - categoryCounts[a])
			.slice(0, 5);

		// Analyze with Gemini
		const analysis = await aiService.analyzeCustomerBehavior({
			totalOrders,
			totalSpent,
			averageOrderValue,
			lastOrderDate: orders[0].created_at,
			orderFrequency,
			preferredCategories
		});

		return json({ ...analysis, error: null });
	} catch (error: any) {
		console.error('Error analyzing customer behavior:', error);
		return json(
			{ insights: '', recommendations: [], segment: 'Unknown', error: error.message || 'Failed to analyze customer behavior' },
			{ status: 500 }
		);
	}
};

