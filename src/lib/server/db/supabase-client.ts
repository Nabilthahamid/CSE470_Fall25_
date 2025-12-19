import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types';

/**
 * Supabase Client for client-side operations
 * This client uses the anon key and respects Row Level Security (RLS)
 * Use this for client-side authentication
 */
export const supabaseClient = createClient<Database>(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
);

