import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/db/client";
import { supabaseAdmin } from "$lib/db/server";
import { createProfile } from "$lib/server/models/users";

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

    // Create profile in database (if database is available)
    // The profile will be created automatically on first login via hooks if database is unavailable
    try {
      if (supabaseAdmin) {
        await createProfile({
          id: authData.user.id,
          email: authData.user.email!,
          fullName: fullName || null,
          avatarUrl: null,
        });
      } else {
        console.warn(
          "Database not available - profile will be created on first login"
        );
      }
    } catch (err) {
      console.error("Failed to create profile:", err);
      // Continue anyway - profile will be created on first login if it fails here
    }

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

      throw redirect(303, "/");
    }

    // Email confirmation required
    return {
      success: true,
      message:
        "Account created! Please check your email to confirm your account.",
    };
  },
} satisfies Actions;
