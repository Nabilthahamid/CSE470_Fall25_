import { getAllProducts } from "$lib/server/models/products";
import { deleteProduct } from "$lib/server/models/adminProducts";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async () => {
  const products = await getAllProducts();

  return {
    products,
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;

    if (!productId) {
      return fail(400, { error: "Product ID is required" });
    }

    try {
      await deleteProduct(productId);
      return { success: true };
    } catch (error: any) {
      return fail(500, { error: error.message });
    }
  },
};

