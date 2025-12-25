// CONTROLLER: Register page server-side logic - stores user in database
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authService } from '$lib/services/AuthService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		const redirectPath = locals.user.role === 'admin' ? '/admin' : '/';
		throw redirect(302, redirectPath);
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';
		const name = formData.get('name')?.toString() || '';

		try {
			// Register user - password will be hashed and stored in database
			const session = await authService.register({ email, password, name });

			// Set session cookie
			cookies.set('session_token', session.access_token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Redirect admin to admin dashboard, others to home
			const redirectPath = session.user.role === 'admin' ? '/admin' : '/';
			throw redirect(302, redirectPath);
		} catch (error) {
			// If it's a redirect, re-throw it
			if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
				throw error;
			}

			const { message } = handleError(error);
			return {
				error: message,
				email,
				name
			};
		}
	}
};

