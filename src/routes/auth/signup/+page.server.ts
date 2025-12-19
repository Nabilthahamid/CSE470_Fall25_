import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";
import { isUserAdmin } from "$lib/server/models/users";

export const actions = {
  signup: async ({ request, cookies }) => {
    const data = await request.formData();
    const fullName = data.get("fullName")?.toString();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();
    const confirmPassword = data.get("confirmPassword")?.toString();

    // Validation
    if (!email || !password) {
      return fail(400, {
        error: "Email and password are required",
        email,
        fullName,
      });
    }

    if (password.length < 6) {
      return fail(400, {
        error: "Password must be at least 6 characters",
        email,
        fullName,
      });
    }

    if (password !== confirmPassword) {
      return fail(400, {
        error: "Passwords do not match",
        email,
        fullName,
      });
    }

    // Create Supabase client for server-side
    const supabase = createClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY
    );

    // Sign up with Supabase
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return fail(400, {
        error: error.message,
        email,
        fullName,
      });
    }

    if (!authData.user) {
      return fail(400, {
        error: "Failed to create user",
        email,
        fullName,
      });
    }

    // Profile will be automatically created by the database trigger
    // The trigger (on_auth_user_created) will create the profile when the user is inserted into auth.users
    // No manual profile creation needed here - relying on the trigger ensures proper transaction handling

    // If session exists (no email confirmation required), set cookies and redirect
    if (authData.session) {
      cookies.set("sb-access-token", authData.session.access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      cookies.set("sb-refresh-token", authData.session.refresh_token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      // Check if user is an admin and redirect accordingly
      // Note: Profile should be created by trigger by now, but we'll wait a moment if needed
      const userId = authData.session.user.id;
      let userIsAdmin = false;

      try {
        // Give the trigger a moment to create the profile, then check
        // The trigger runs synchronously, but we'll add a small delay just in case
        await new Promise((resolve) => setTimeout(resolve, 200));
        userIsAdmin = await isUserAdmin(userId);
        console.log(
          `Signup admin check for user ${userId} (${email}): ${userIsAdmin}`
        );
      } catch (error) {
        // If admin check fails (e.g., profile not created yet, database error), treat as regular user
        console.error("Failed to check admin status during signup:", error);
        userIsAdmin = false;
      }

      if (userIsAdmin) {
        console.log(`Redirecting admin user ${email} to /admin after signup`);
        throw redirect(303, "/admin");
      } else {
        console.log(`Redirecting regular user ${email} to / after signup`);
        throw redirect(303, "/");
      }
    }

    // Email confirmation required
    return {
      success: true,
      message:
        "Account created! Please check your email to confirm your account.",
    };
  },
} satisfies Actions;
