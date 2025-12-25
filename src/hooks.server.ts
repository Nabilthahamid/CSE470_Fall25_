// HOOKS: Server-side hooks for custom authentication
import type { Handle } from '@sveltejs/kit';
import { authService } from '$lib/services/AuthService';

export const handle: Handle = async ({ event, resolve }) => {
	// Get session token from cookies
	const sessionToken = event.cookies.get('session_token');

	// Get user from token
	if (sessionToken) {
		try {
			const user = await authService.getCurrentUser(sessionToken);
			event.locals.user = user;
		} catch (error) {
			// Invalid token, clear it
			event.cookies.delete('session_token', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};

