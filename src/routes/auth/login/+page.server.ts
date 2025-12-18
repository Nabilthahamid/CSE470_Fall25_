import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/db/client";

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!email || !password) {
      return fail(400, {
        error: "Email and password are required",
        email,
      });
    }

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

    // Set session cookies
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
  },
} satisfies Actions;
