import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

/**
 * Controller (Entry Point) - Admin Dashboard
 * Protected route - only accessible by admin users
 */
export const load: PageServerLoad = async ({ locals }) => {
  // This should already be handled by hooks.server.ts, but double-check
  if (!locals.user) {
    throw redirect(302, "/auth");
  }

  if (locals.role !== "admin") {
    throw redirect(302, "/");
  }

  return {
    user: locals.user,
    role: locals.role,
  };
};
