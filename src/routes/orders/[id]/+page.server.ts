// CONTROLLER: Single order tracking page
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { orderService } from '$lib/services/OrderService';
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

		return {
			order,
			user: locals.user
		};
	} catch (err: any) {
		if (err.status === 403) throw err;
		const { message } = handleError(err);
		throw error(404, message || 'Order not found');
	}
};

