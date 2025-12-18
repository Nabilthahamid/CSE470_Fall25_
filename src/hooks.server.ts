import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Note: Supabase client initialization moved to avoid server startup errors
	// Session management will be handled on-demand in routes that need it
	const response = await resolve(event);
	return response;
};

