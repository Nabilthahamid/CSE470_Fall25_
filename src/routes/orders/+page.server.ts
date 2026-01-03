// VIEW: Customer orders page - thin wrapper that calls controller
import type { PageServerLoad } from './$types';
import { PublicOrderController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new PublicOrderController(event);
	return await controller.loadUserOrders();
};

