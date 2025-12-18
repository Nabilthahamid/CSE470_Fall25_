import { getAllProducts } from "$lib/server/models/products";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const products = await getAllProducts();

  return {
    products,
    databaseAvailable:
      products.length > 0 || process.env.DATABASE_URL !== undefined,
  };
};
