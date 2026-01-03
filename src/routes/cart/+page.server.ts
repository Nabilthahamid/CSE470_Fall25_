// VIEW: Cart page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { CartController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new CartController(event);
	return await controller.loadCart();
};

export const actions: Actions = {
	add: async (event) => {
		const controller = new CartController(event);
		return await controller.addToCart();
	},
	update: async (event) => {
		const controller = new CartController(event);
		return await controller.updateCartItem();
	},
	remove: async (event) => {
		const controller = new CartController(event);
		return await controller.removeFromCart();
	}
};

