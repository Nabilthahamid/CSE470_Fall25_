// CONTROLLER: Customer orders page
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { orderService } from '$lib/services/OrderService';
import { returnService } from '$lib/services/ReturnService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAuth(locals.user);

	try {
		const userId = locals.user.id;
		const orders = await orderService.getOrdersByUser(userId);

		// Load return requests for all orders
		let allReturnRequests: any[] = [];
		try {
			allReturnRequests = await returnService.getAllReturns({ userId });
		} catch (err) {
			// If table doesn't exist yet, return empty array
			console.error('Error loading return requests:', err);
		}

		// Map return requests to orders
		const ordersWithReturns = orders.map((order) => {
			const orderReturns = allReturnRequests.filter((r) => r.order_id === order.id);
			return {
				...order,
				returnRequests: orderReturns
			};
		});

		return {
			orders: ordersWithReturns,
			user: locals.user
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			orders: [],
			user: locals.user,
			error: message
		};
	}
};

