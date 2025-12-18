import { db } from "$lib/db/server";
import { orders, orderItems, products, profiles } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  if (!db) {
    return { orders: [] };
  }

  // Get all orders with user information
  const allOrders = await db
    .select({
      order: orders,
      profile: profiles,
    })
    .from(orders)
    .leftJoin(profiles, eq(orders.userId, profiles.id))
    .orderBy(orders.createdAt);

  return {
    orders: allOrders,
  };
};

