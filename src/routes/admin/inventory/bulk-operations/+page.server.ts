// CONTROLLER: Bulk Operations Page
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		const products = await productService.getAllProducts();
		let categories = [];
		try {
			categories = await pcBuildService.getAllCategories();
		} catch (error) {
			console.error('Error loading categories:', error);
		}

		return {
			products,
			categories,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			categories: [],
			error: message
		};
	}
};

