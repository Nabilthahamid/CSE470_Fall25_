import type { LayoutServerLoad } from "./$types";

/**
 * Global Server Load Function
 * This runs on every server-side request
 * Use this for loading user session data, global settings, etc.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    role: locals.role,
  };
};
