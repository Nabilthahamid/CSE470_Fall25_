import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import { isUserAdmin } from "$lib/server/models/users";

export const actions = {
  login: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();
    const redirectTo = url.searchParams.get("redirectTo") || "/";

    if (!email || !password) {
      return fail(400, {
        error: "Email and password are required",
        email,
      });
    }

    // Create Supabase client for server-side (same as hooks.server.ts)
    const supabase = createClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (key: string) => cookies.get(key),
          set: (key: string, value: string, options: any) => {
            cookies.set(key, value, { ...options, path: "/" });
          },
          remove: (key: string, options: any) => {
            cookies.delete(key, { ...options, path: "/" });
          },
        },
      } as any
    );

    // Sign in with Supabase
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return fail(400, {
        error: error.message,
        email,
      });
    }

    if (!authData.session) {
      return fail(400, {
        error: "Failed to create session",
        email,
      });
    }

    // Session cookies are automatically handled by Supabase client with cookie configuration

    // Check if user is an admin and redirect accordingly
    const userId = authData.session.user.id;
    let isAdmin = false;

    try {
      isAdmin = await isUserAdmin(userId);
      console.log(`Admin check for user ${userId} (${email}): ${isAdmin}`);
    } catch (error) {
      // If admin check fails (e.g., database error), treat as regular user
      console.error("Failed to check admin status:", error);
      isAdmin = false;
    }

    if (isAdmin) {
      // Always redirect admins to admin dashboard
      console.log(`Redirecting admin user ${email} to /admin`);
      throw redirect(303, "/admin");
    } else {
      // For regular users, use redirectTo parameter if provided, otherwise go to homepage
      const finalRedirect = redirectTo.startsWith("/") ? redirectTo : "/";
      console.log(`Redirecting regular user ${email} to ${finalRedirect}`);
      throw redirect(303, finalRedirect);
    }
  },
} satisfies Actions;
