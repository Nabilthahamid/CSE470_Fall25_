// CONTROLLER: Logout action - clears session cookie
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Clear session cookie
		cookies.delete('session_token', { path: '/' });
		throw redirect(302, '/auth/login');
	}
};

