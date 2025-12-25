// CONTROLLER: Products page (public view)
import type { PageServerLoad } from './$types';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const searchQuery = url.searchParams.get('search') || '';
		const error = url.searchParams.get('error');
		const success = url.searchParams.get('success');

		const products = searchQuery.trim()
			? await productService.searchProducts(searchQuery)
			: await productService.getAllProducts();

		return {
			products,
			searchQuery: searchQuery,
			error: error ? decodeURIComponent(error) : null,
			success: success ? decodeURIComponent(success) : null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			searchQuery: '',
			error: message,
			success: null
		};
	}
};

