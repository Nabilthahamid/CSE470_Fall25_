import { getAllProducts } from '$lib/server/services/productService';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

/**
 * Controller (Entry Point) - Shop Product Listing
 * This file handles the server-side data loading for the shop page
 * Business logic is delegated to the productService
 */
export const load: PageServerLoad = async () => {
	try {
		const products = await getAllProducts();

		return {
			products
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to load products';
		throw error(500, message);
	}
};

