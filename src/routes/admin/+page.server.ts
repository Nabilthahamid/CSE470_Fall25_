import { getAllProducts } from "$lib/server/models/products";
import { getAllProfiles } from "$lib/server/models/users";
import { db } from "$lib/db/server";
import { orders } from "$lib/db/schema";
import { count } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Get statistics
  const products = await getAllProducts();
  const users = await getAllProfiles();

  let totalOrders = 0;
  if (db) {
    const result = await db.select({ count: count() }).from(orders);
    totalOrders = Number(result[0]?.count || 0);
  }

  return {
    stats: {
      totalProducts: products.length,
      totalUsers: users.length,
      totalOrders,
    },
  };
};

