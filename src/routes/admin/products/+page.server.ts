// VIEW: Admin products list page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { ProductController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new ProductController(event);
	return await controller.loadProductsList();
};

export const actions: Actions = {
	create: async (event) => {
		const controller = new ProductController(event);
		return await controller.createProduct();
	},
	delete: async (event) => {
		const controller = new ProductController(event);
		return await controller.deleteProduct();
	}
};
