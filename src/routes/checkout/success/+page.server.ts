// CONTROLLER: Checkout success page
import type { PageServerLoad } from './$types';
import { orderService } from '$lib/services/OrderService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ url }) => {
	const orderId = url.searchParams.get('order_id');

	if (!orderId) {
		return {
			order: null,
			error: 'Order ID not provided'
		};
	}

	try {
		const order = await orderService.getOrderById(orderId);
		return {
			order,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			order: null,
			error: message
		};
	}
};

