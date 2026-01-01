// CONTROLLER: Products page (public view)
import type { PageServerLoad } from './$types';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const searchQuery = url.searchParams.get('search') || '';
		const categoryId = url.searchParams.get('category') || '';
		const error = url.searchParams.get('error');
		const success = url.searchParams.get('success');

		let products;
		let category = null;
		
		if (categoryId) {
			// Filter by category
			products = await productService.getProductsByCategory(categoryId);
			// Get category info
			try {
				category = await pcBuildService.getCategoryById(categoryId);
			} catch (err) {
				console.error('Error loading category:', err);
			}
		} else if (searchQuery.trim()) {
			// Search products
			products = await productService.searchProducts(searchQuery);
		} else {
			// Get all products
			products = await productService.getAllProducts();
		}

		return {
			products,
			searchQuery: searchQuery,
			categoryId: categoryId,
			category: category,
			error: error ? decodeURIComponent(error) : null,
			success: success ? decodeURIComponent(success) : null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			searchQuery: '',
			categoryId: '',
			category: null,
			error: message,
			success: null
		};
	}
};

