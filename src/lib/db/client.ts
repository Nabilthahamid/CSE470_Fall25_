import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/public";

// Get environment variables from SvelteKit env
const supabaseUrl = env.PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. Please configure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Supabase client for client-side usage (browser-safe)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://placeholder.supabase.co", "placeholder-key");
