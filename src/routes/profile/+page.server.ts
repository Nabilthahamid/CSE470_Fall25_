// CONTROLLER: Profile page (protected route)
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth';

export const load: PageServerLoad = async ({ locals }) => {
	requireAuth(locals.user);
	return {
		user: locals.user
	};
};

