// CONTROLLER: Customer orders page
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth';
import { orderService } from '$lib/services/OrderService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAuth(locals.user);

	try {
		const userId = locals.user.id;
		const orders = await orderService.getOrdersByUser(userId);

		return {
			orders,
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

