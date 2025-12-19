import type { Handle } from "@sveltejs/kit";
import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import { supabaseAdmin } from "$lib/db/server";

export const handle: Handle = async ({ event, resolve }) => {
  // Initialize Supabase client for server-side session management
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: "/" });
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: "/" });
      },
    },
  });

  // Get session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Set session and user in event.locals for use in load functions
  event.locals.session = session;
  event.locals.user = session?.user ?? null;

  // If user is logged in, ensure they have a profile
  if (session?.user && supabaseAdmin) {
    try {
      const userId = session.user.id;
      const email = session.user.email;

      if (userId && email) {
        // Check if profile exists
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        // If no profile exists, create one
        if (!existingProfile) {
          await supabaseAdmin.from("profiles").insert({
            id: userId,
            email: email,
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            role: "user",
          });
        }
      }
    } catch (error) {
      // Silently fail - profile creation is not critical for every request
      // It will be retried on next request or created via trigger
    }
  }

  const response = await resolve(event);
  return response;
};
