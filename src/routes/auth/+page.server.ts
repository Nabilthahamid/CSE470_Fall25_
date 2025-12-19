import { AuthService } from "$lib/server/services/authService";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createBrowserClient } from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import type { Database } from "$lib/types";
import { loginSchema, registerSchema } from "$lib/server/models/auth";

/**
 * Controller (Entry Point) - Authentication Page
 * Handles login and registration form submissions
 */
export const load: PageServerLoad = async ({ locals, url }) => {
  // If user is already logged in, redirect based on role
  if (locals.user) {
    if (locals.role === "admin") {
      throw redirect(302, "/admin");
    }
    throw redirect(302, "/");
  }

  // Check for query parameters
  const tab = url.searchParams.get("tab");
  const loggedOut = url.searchParams.get("loggedOut") === "true";

  return {
    initialTab: tab === "login" || tab === "register" ? tab : "login",
    loggedOut,
  };
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    // Validate input using schema
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return fail(400, {
        error: validation.error.errors[0].message,
        type: "login",
      });
    }

    // Create a Supabase client for this request with cookie handling
    const supabase = createBrowserClient<Database>(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (key: string) => cookies.get(key),
          set: (key: string, value: string, options?: any) =>
            cookies.set(key, value, options || { path: "/" }),
          remove: (key: string, options?: any) =>
            cookies.delete(key, options || { path: "/" }),
        },
      }
    );

    const result = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (result.error || !result.data.session) {
      return fail(400, {
        error: result.error?.message || "Login failed",
        type: "login",
      });
    }

    // Set session cookies
    cookies.set("sb-access-token", result.data.session.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Also set refresh token if available
    if (result.data.session.refresh_token) {
      cookies.set("sb-refresh-token", result.data.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Get user role to determine redirect - MUST check role before redirecting
    const role = await AuthService.getUserRole(result.data.user.id);

    // Admin users always go to admin dashboard
    if (role === "admin") {
      throw redirect(302, "/admin");
    }

    // Regular users go to home page
    throw redirect(302, "/");
  },

  register: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    // Validate input using schema (includes password match validation)
    const validation = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });
    if (!validation.success) {
      return fail(400, {
        error: validation.error.errors[0].message,
        type: "register",
      });
    }

    // Create a Supabase client for this request with cookie handling
    const supabase = createBrowserClient<Database>(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (key: string) => cookies.get(key),
          set: (key: string, value: string, options?: any) =>
            cookies.set(key, value, options || { path: "/" }),
          remove: (key: string, options?: any) =>
            cookies.delete(key, options || { path: "/" }),
        },
      }
    );

    const result = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
    });

    // Check for errors first
    if (result.error) {
      return fail(400, {
        error: result.error.message || "Registration failed",
        type: "register",
      });
    }

    // Check if user was created
    if (!result.data.user) {
      return fail(400, {
        error: "Registration failed: No user data returned",
        type: "register",
      });
    }

    // If email confirmation is required, session might be null
    // In that case, show success message and redirect to login
    if (!result.data.session) {
      return fail(200, {
        error:
          "Please check your email to confirm your account before signing in.",
        type: "register",
        success: true,
      });
    }

    // Set session cookies if session exists
    cookies.set("sb-access-token", result.data.session.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Also set refresh token if available
    if (result.data.session.refresh_token) {
      cookies.set("sb-refresh-token", result.data.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Wait a moment for the trigger to create the profile, then get user role
    // The trigger should create the profile automatically
    let role: "user" | "admin" | null = null;
    try {
      // Give the database trigger a moment to create the profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      role = await AuthService.getUserRole(result.data.user.id);
    } catch (err) {
      // If profile doesn't exist yet, default to 'user'
      // This can happen if the trigger hasn't run yet
      console.error("Error getting user role:", err);
      role = "user";
    }

    // Default to 'user' if role is null
    if (!role) {
      role = "user";
    }

    // Admin users always go to admin dashboard
    if (role === "admin") {
      throw redirect(302, "/admin");
    }

    // Regular users go to home page
    throw redirect(302, "/");
  },

  logout: async ({ cookies }) => {
    // Fast synchronous cookie deletion (instant)
    cookies.delete("sb-access-token", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    cookies.delete("sb-refresh-token", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Redirect to login page after clearing cookies
    throw redirect(302, "/auth?tab=login");
  },
};
