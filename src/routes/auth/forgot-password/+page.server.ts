import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { supabase } from "$lib/db/client";

export const actions = {
  default: async ({ request, url }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString();

    if (!email) {
      return fail(400, {
        error: "Email is required",
        email,
      });
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/auth/reset-password`,
    });

    if (error) {
      return fail(400, {
        error: error.message,
        email,
      });
    }

    return {
      success: true,
      message: "Password reset link sent! Check your email.",
    };
  },
} satisfies Actions;
