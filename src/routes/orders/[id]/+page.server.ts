// VIEW: Single order tracking page - thin wrapper that calls controller
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PublicOrderController } from '$lib/controllers';
import { ReturnModel } from '$lib/models/ReturnModel';

export const load: PageServerLoad = async (event) => {
	const controller = new PublicOrderController(event);
	const result = await controller.loadOrderDetails(event.params.id);

	if (result.error || !result.order) {
		throw error(404, result.error || 'Order not found');
	}

	// Load return requests for this order
	let returnRequests = [];
	try {
		const returnModels = await ReturnModel.getAll({ orderId: result.order.id });
		returnRequests = returnModels.map((r) => r.toJSON());
	} catch (err) {
		console.error('Error loading return requests:', err);
	}

	return {
		order: result.order,
		returnRequests,
		user: controller.getUser()
	};
};

