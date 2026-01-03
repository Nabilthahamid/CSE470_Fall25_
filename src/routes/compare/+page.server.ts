// CONTROLLER: Product comparison page
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// ProductService removed - not used in this file
import { handleError } from '$lib/utils/errors';
import { getComparisonProducts } from '$lib/utils/comparison';

export const load: PageServerLoad = async () => {
	try {
		// Get comparison product IDs from query params (passed from client)
		// We'll handle the actual fetching on the client side since localStorage is client-only
		return {
			error: null
		};
	} catch (err) {
		const { message, statusCode } = handleError(err);
		throw error(statusCode, message);
	}
};

