// HOOKS: Server-side hooks for custom authentication
import type { Handle } from '@sveltejs/kit';
import { verifySessionToken } from '$lib/utils/session';
import { UserModel } from '$lib/models/UserModel';

export const handle: Handle = async ({ event, resolve }) => {
	// Get session token from cookies
	const sessionToken = event.cookies.get('session_token');

	// Get user from token
	if (sessionToken) {
		try {
			// Verify the session token
			const tokenPayload = await verifySessionToken(sessionToken);
			
			if (tokenPayload && tokenPayload.userId) {
				// Get user from database
				const userModel = await UserModel.getById(tokenPayload.userId);
				
				if (userModel) {
					const user = userModel.toJSON();
					// Format user for locals (matching AuthUser format)
					event.locals.user = {
						id: user.id,
						email: user.email,
						role: user.role || 'user',
						user_metadata: {
							name: user.name
						}
					};
				} else {
					// User not found, clear token
					event.cookies.delete('session_token', { path: '/' });
					event.locals.user = null;
				}
			} else {
				// Invalid token, clear it
				event.cookies.delete('session_token', { path: '/' });
				event.locals.user = null;
			}
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

