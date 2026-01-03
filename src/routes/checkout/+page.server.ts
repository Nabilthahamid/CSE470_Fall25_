// VIEW: Checkout page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { CheckoutController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new CheckoutController(event);
	return await controller.loadCheckout();
};

export const actions: Actions = {
	default: async (event) => {
		const controller = new CheckoutController(event);
		return await controller.processCheckout();
	}
};
