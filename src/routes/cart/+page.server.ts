import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	// TODO: Get cart from cookies or session
	// For now, return empty cart
	return {
		cart: {
			items: [],
			total: 0,
			subtotal: 0,
			tax: 0,
			itemCount: 0
		}
	};
};

