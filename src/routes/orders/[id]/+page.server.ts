// CONTROLLER: Single order tracking page
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { orderService } from '$lib/services/OrderService';
import { returnService } from '$lib/services/ReturnService';
import { handleError } from '$lib/utils/errors';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireAuth(locals.user);

	try {
		const order = await orderService.getOrderById(params.id);

		// Check if order belongs to user (unless admin)
		if (order.user_id && order.user_id !== locals.user.id && locals.user.role !== 'admin') {
			throw error(403, 'Access denied');
		}

		// Load return requests for this order
		let returnRequests = [];
		try {
			returnRequests = await returnService.getAllReturns({ orderId: order.id });
		} catch (err) {
			// If table doesn't exist yet, return empty array
			console.error('Error loading return requests:', err);
		}

		return {
			order,
			returnRequests,
			user: locals.user
		};
	} catch (err: any) {
		if (err.status === 403) throw err;
		const { message } = handleError(err);
		throw error(404, message || 'Order not found');
	}
};

