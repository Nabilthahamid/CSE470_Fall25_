import { db } from "$lib/db/server";
import { orders, orderItems, products } from "$lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: InferSelectModel<typeof products>;
  })[];
};

/**
 * Get all orders for a user
 * @param userId - User UUID
 * @returns Array of orders
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

/**
 * Get a single order by ID
 * @param id - Order UUID
 * @returns Order or null if not found
 */
export async function getOrderById(id: string): Promise<Order | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Get order with items and products
 * @param id - Order UUID
 * @returns Order with items and products or null if not found
 */
export async function getOrderWithItems(
  id: string
): Promise<OrderWithItems | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const order = await getOrderById(id);
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const itemsWithProducts = await Promise.all(
    items.map(async (item) => {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);
      return {
        ...item,
        product: product[0],
      };
    })
  );

  return {
    ...order,
    orderItems: itemsWithProducts,
  };
}

/**
 * Create a new order
 * @param data - Order data
 * @returns Created order
 */
export async function createOrder(data: NewOrder): Promise<Order> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db.insert(orders).values(data).returning();
  return result[0];
}

/**
 * Add items to an order
 * @param orderId - Order UUID
 * @param items - Array of order items
 * @returns Array of created order items
 */
export async function createOrderItems(
  orderId: string,
  items: NewOrderItem[]
): Promise<OrderItem[]> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const itemsWithOrderId = items.map((item) => ({ ...item, orderId }));
  const result = await db
    .insert(orderItems)
    .values(itemsWithOrderId)
    .returning();
  return result;
}

/**
 * Update order status
 * @param id - Order UUID
 * @param status - New status
 * @returns Updated order or null if not found
 */
export async function updateOrderStatus(
  id: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
): Promise<Order | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return result[0] || null;
}
