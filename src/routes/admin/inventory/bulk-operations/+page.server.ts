// CONTROLLER: Bulk Operations Page
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		const productsModels = await ProductModel.getAll();
		const products = productsModels.map(p => p.toJSON());
		let categories = [];
		try {
			categories = await getAllCategories();
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

