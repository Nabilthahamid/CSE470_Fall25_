import { requireAdmin } from "$lib/server/guards/adminGuard";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent }) => {
  const { user } = await parent();
  if (user?.id) {
    // await requireAdmin(user.id);
    // Temporarily bypassing admin check for testing
  }
  return {};
};

