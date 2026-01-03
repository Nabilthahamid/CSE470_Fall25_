// VIEW: Admin orders page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { OrderController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new OrderController(event);
	return await controller.loadOrdersList();
};

export const actions: Actions = {
	updateStatus: async (event) => {
		const controller = new OrderController(event);
		return await controller.updateOrderStatus();
	}
};

