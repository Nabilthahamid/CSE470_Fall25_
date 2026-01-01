// Configuration: Supabase client setup (for database operations only)
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('Missing Supabase environment variables');
}

// Supabase client for database operations (not for auth)
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Cache for admin client
let adminClient: SupabaseClient | null = null;

/**
 * Get admin Supabase client (bypasses RLS)
 * Uses service role key from environment variables
 * This function should only be called from server-side code
 */
export function getSupabaseAdmin(): SupabaseClient {
	if (adminClient) {
		return adminClient;
	}

	// Try to get service role key from environment
	// This will only work on server-side
	let serviceRoleKey: string | undefined;
	
	if (typeof process !== 'undefined' && process.env) {
		serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	}

	// If service role key is available, create admin client
	if (serviceRoleKey && serviceRoleKey.trim() !== '') {
		adminClient = createClient(PUBLIC_SUPABASE_URL, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
		return adminClient;
	}

	// Fallback to regular client if service role key not available
	// This means RLS policies will apply, which should be fine for most cases
	return supabase;
}

