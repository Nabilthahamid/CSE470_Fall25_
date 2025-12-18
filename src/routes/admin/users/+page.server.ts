import { getAllProfiles, updateUserRole } from "$lib/server/models/users";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async () => {
  const users = await getAllProfiles();

  return {
    users,
  };
};

export const actions: Actions = {
  updateRole: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as "user" | "admin";

    if (!userId || !role) {
      return fail(400, { error: "User ID and role are required" });
    }

    if (role !== "user" && role !== "admin") {
      return fail(400, { error: "Invalid role" });
    }

    try {
      await updateUserRole(userId, role);
      return { success: true };
    } catch (error: any) {
      return fail(500, { error: error.message });
    }
  },
};

