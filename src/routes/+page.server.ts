import { redirect } from "@sveltejs/kit";
import { getAllProducts } from "$lib/server/services/productService";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

/**
 * Root route - Landing page with all products
 * Redirects admin users to admin dashboard
 */
export const load: PageServerLoad = async ({ locals }) => {
  // CRITICAL: Admin users must always be redirected to admin dashboard
  // This is a safety check in case they somehow access the home page
  if (locals.user && locals.role === "admin") {
    throw redirect(302, "/admin");
  }

  // Fetch all products from database (NOT hardcoded)
  // Products are loaded from Supabase products table via productService
  try {
    const products = await getAllProducts();

    return {
      products, // Products come from database, not hardcoded
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load products";
    throw error(500, message);
  }
};
