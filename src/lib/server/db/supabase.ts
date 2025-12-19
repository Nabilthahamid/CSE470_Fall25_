import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types';

/**
 * Supabase Admin Client for server-side operations
 * This client uses the service role key and bypasses Row Level Security (RLS)
 * Use this for server-side operations that require elevated permissions
 */
export const supabaseAdmin = createClient<Database>(
	PUBLIC_SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	}
);

