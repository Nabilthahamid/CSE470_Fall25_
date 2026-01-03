// VIEW: Product detail page - thin wrapper that calls controller
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ProductDetailController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new ProductDetailController(event);
	const result = await controller.loadProductDetails(event.params.id);
	
	if (result.error || !result.product) {
		throw error(404, result.error || 'Product not found');
	}
	
	return result;
};

export const actions: Actions = {
	createReview: async (event) => {
		const controller = new ProductDetailController(event);
		return await controller.createReview(event.params.id);
	},
	updateReview: async (event) => {
		const controller = new ProductDetailController(event);
		return await controller.updateReview();
	},
	deleteReview: async (event) => {
		const controller = new ProductDetailController(event);
		return await controller.deleteReview();
	}
};
