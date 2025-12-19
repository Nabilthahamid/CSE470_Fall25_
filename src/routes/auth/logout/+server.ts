import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";

export const POST: RequestHandler = async ({ cookies, request }) => {
  // Create Supabase client with cookies for proper server-side logout
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => {
        cookies.set(key, value, { ...options, path: "/" });
      },
      remove: (key, options) => {
        cookies.delete(key, { ...options, path: "/" });
      },
    },
  });

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Clear all auth-related cookies
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  cookies.delete("sb-auth-token", { path: "/" });

  // Redirect to home page
  throw redirect(303, "/");
};
