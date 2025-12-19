import { supabaseAdmin } from '$lib/server/db/supabase';
import type { PageServerLoad } from './$types';

/**
 * Health Check / Connection Tester
 * This endpoint tests the Supabase database connection
 */
export const load: PageServerLoad = async () => {
	const startTime = Date.now();
	let connectionStatus = 'unknown';
	let errorMessage: string | null = null;
	let queryTime: number | null = null;
	let productCount: number | null = null;

	try {
		// Test connection by attempting a simple query
		const { data, error, count } = await supabaseAdmin
			.from('products')
			.select('*', { count: 'exact', head: true });

		queryTime = Date.now() - startTime;

		if (error) {
			connectionStatus = 'error';
			errorMessage = error.message;
		} else {
			connectionStatus = 'success';
			productCount = count || 0;
		}
	} catch (err) {
		connectionStatus = 'error';
		errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
		queryTime = Date.now() - startTime;
	}

	return {
		connectionStatus,
		errorMessage,
		queryTime,
		productCount,
		timestamp: new Date().toISOString()
	};
};

