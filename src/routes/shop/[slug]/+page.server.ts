import { getProductBySlug } from '$lib/server/services/productService';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

/**
 * Controller (Entry Point) - Single Product Detail
 * This file handles the server-side data loading for a single product page
 * Business logic is delegated to the productService
 */
export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;

	if (!slug) {
		throw error(400, 'Product slug is required');
	}

	try {
		const product = await getProductBySlug(slug);

		if (!product) {
			throw error(404, `Product with slug "${slug}" not found`);
		}

		return {
			product
		};
	} catch (err) {
		// Re-throw SvelteKit errors
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to load product';
		throw error(500, message);
	}
};

