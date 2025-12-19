import { requireAdmin } from "$lib/server/guards/adminGuard";
import { getProfileById } from "$lib/server/models/users";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const userId = locals.user?.id;

  // TEMPORARILY DISABLED: Protect all admin routes
  // TODO: Re-enable authentication before production
  // await requireAdmin(userId);

  // Get admin user profile
  const profile = userId ? await getProfileById(userId) : null;

  return {
    profile,
  };
};
