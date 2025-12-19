import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { isUserAdmin } from "$lib/server/models/users";

export const GET: RequestHandler = async ({ url, locals }) => {
  const userId = url.searchParams.get("userId") || locals.user?.id;

  if (!userId) {
    throw error(401, "Unauthorized");
  }

  try {
    const isAdmin = await isUserAdmin(userId);
    return json({ isAdmin });
  } catch (err) {
    console.error("Error checking admin role:", err);
    return json({ isAdmin: false });
  }
};
