import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { supabase } from "$lib/db/client";

export const POST: RequestHandler = async ({ cookies }) => {
  // Sign out from Supabase
  await supabase.auth.signOut();

  // Clear cookies
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  throw redirect(303, "/");
};
