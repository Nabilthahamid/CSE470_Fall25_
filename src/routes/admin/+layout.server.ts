// CONTROLLER: Admin layout (protected - admin only)
import type { LayoutServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';

export const load: LayoutServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);
	
	return {
		user: locals.user
	};
};

