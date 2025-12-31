// CONTROLLER: Home page with products
import type { PageServerLoad } from './$types';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const products = await productService.getAllProducts();
		
		// Try to get categories, but handle gracefully if table doesn't exist
		let categories = [];
		try {
			categories = await pcBuildService.getAllCategories();
		} catch (error) {
			console.error('Error loading component categories:', error);
			// Continue without categories
		}

		// Group products by category
		const productsByCategory: Record<string, any[]> = {};
		const regularProducts: any[] = [];

		products.forEach((product) => {
			const productWithCategory = product as any;
			if (productWithCategory.component_category_id) {
				const catId = productWithCategory.component_category_id;
				if (!productsByCategory[catId]) {
					productsByCategory[catId] = [];
				}
				productsByCategory[catId].push(product);
			} else {
				regularProducts.push(product);
			}
		});

		// Map category IDs to category names
		const categoryMap: Record<string, string> = {};
		categories.forEach((cat) => {
			categoryMap[cat.id] = cat.display_name;
		});

		const error = url.searchParams.get('error');
		const success = url.searchParams.get('success');
		return {
			products,
			productsByCategory,
			regularProducts,
			categories,
			categoryMap,
			error: error ? decodeURIComponent(error) : null,
			success: success ? decodeURIComponent(success) : null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			products: [],
			productsByCategory: {},
			regularProducts: [],
			categories: [],
			categoryMap: {},
			error: message,
			success: null
		};
	}
};

