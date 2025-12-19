import { supabaseAdmin } from "$lib/server/db/supabase";
import { AuthService } from "$lib/server/services/authService";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

/**
 * Handle Supabase session from cookies
 */
const handleAuth: Handle = async ({ event, resolve }) => {
  // Initialize locals (fast, no async)
  event.locals.user = null;
  event.locals.session = null;
  event.locals.role = null;

  // Fast path: No token = no user (skip all async operations)
  const accessToken = event.cookies.get("sb-access-token");
  if (!accessToken) {
    return resolve(event);
  }

  // Only do async operations if we have a token
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (user && !error) {
      event.locals.user = user;
      // Fetch role in parallel if needed, but default to 'user' for speed
      const profile = await AuthService.getUserProfile(user.id);
      event.locals.role = (profile?.role as "user" | "admin") || "user";
    }
  } catch (err) {
    // Invalid token - cookies will be cleared on next request
    event.cookies.delete("sb-access-token", { path: "/" });
    event.cookies.delete("sb-refresh-token", { path: "/" });
  }

  return resolve(event);
};

/**
 * Handle admin route protection
 */
const handleAdminRoute: Handle = async ({ event, resolve }) => {
  // Check if the route starts with /admin
  if (event.url.pathname.startsWith("/admin")) {
    // Check if user is authenticated
    if (!event.locals.user) {
      throw redirect(302, "/auth");
    }

    // Check if user is admin
    if (event.locals.role !== "admin") {
      throw redirect(302, "/");
    }
  }

  return resolve(event);
};

/**
 * Handle redirects based on user role after login
 */
const handleAuthRedirect: Handle = async ({ event, resolve }) => {
  // If user is on auth page and already logged in, redirect based on role
  if (event.url.pathname.startsWith("/auth") && event.locals.user) {
    if (event.locals.role === "admin") {
      throw redirect(302, "/admin");
    } else {
      throw redirect(302, "/");
    }
  }

  // If user is on root and logged in, redirect based on role
  if (event.url.pathname === "/" && event.locals.user) {
    // Admin users must always go to admin dashboard
    if (event.locals.role === "admin") {
      throw redirect(302, "/admin");
    }
    // Regular users can stay on home page
  }

  return resolve(event);
};

export const handle = sequence(
  handleAuth,
  handleAdminRoute,
  handleAuthRedirect
);
