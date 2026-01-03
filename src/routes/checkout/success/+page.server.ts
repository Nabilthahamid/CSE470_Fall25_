// CONTROLLER: Checkout success page
import type { PageServerLoad } from './$types';
import { OrderModel } from '$lib/models/OrderModel';
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
		const orderModel = await OrderModel.getById(orderId);
		if (!orderModel) {
			return {
				order: null,
				error: 'Order not found'
			};
		}
		return {
			order: orderModel.toJSON(),
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

