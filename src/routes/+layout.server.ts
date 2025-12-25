// CONTROLLER: Root layout server-side data loading
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user || null
	};
};

