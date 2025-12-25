// CONTROLLER: Home page with products
import type { PageServerLoad } from './$types';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const products = await productService.getAllProducts();
		const error = url.searchParams.get('error');
		const success = url.searchParams.get('success');
		return {
			products,
			error: error ? decodeURIComponent(error) : null,
			success: success ? decodeURIComponent(success) : null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			error: message,
			success: null
		};
	}
};

