import { db, supabaseAdmin } from "$lib/db/server";
import { orders, orderItems, products } from "$lib/db/schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type Product = InferSelectModel<typeof products>;

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product;
  })[];
};

export interface DailyFinancialData {
  date: string; // YYYY-MM-DD
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
  itemsSold: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  profitMargin: number; // percentage
  dailyData: DailyFinancialData[];
}

/**
 * Get all completed orders (delivered status) with items and products
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Array of orders with items and products
 */
export async function getCompletedOrders(
  startDate?: Date,
  endDate?: Date
): Promise<OrderWithItems[]> {
  // Try Drizzle first
  if (db) {
    try {
      let query = db
        .select()
        .from(orders)
        .where(eq(orders.status, "delivered"));

      if (startDate) {
        query = query.where(
          and(
            eq(orders.status, "delivered"),
            gte(orders.createdAt, startDate)
          ) as any
        ) as any;
      }

      if (endDate) {
        const conditions: any[] = [eq(orders.status, "delivered")];
        if (startDate) conditions.push(gte(orders.createdAt, startDate));
        conditions.push(lte(orders.createdAt, endDate));
        query = query.where(and(...conditions) as any) as any;
      }

      const ordersList = await query;

      // Get order items with products
      const ordersWithItems = await Promise.all(
        ordersList.map(async (order) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

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
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.warn("Drizzle query failed, trying Supabase fallback:", error);
    }
  }

  // Fallback to Supabase Admin
  if (supabaseAdmin) {
    try {
      let ordersQuery = supabaseAdmin
        .from("orders")
        .select("*")
        .eq("status", "delivered");

      if (startDate) {
        ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());
      }

      const { data: ordersList, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;
      if (!ordersList) return [];

      const ordersWithItems = await Promise.all(
        ordersList.map(async (order) => {
          const { data: items, error: itemsError } = await supabaseAdmin
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          if (itemsError || !items) {
            return { ...order, orderItems: [] };
          }

          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const { data: productData, error: productError } =
                await supabaseAdmin
                  .from("products")
                  .select("*")
                  .eq("id", item.product_id)
                  .single();

              if (productError || !productData) {
                return null;
              }

              return {
                ...item,
                product: productData,
              };
            })
          );

          return {
            ...order,
            orderItems: itemsWithProducts.filter((item) => item !== null),
          };
        })
      );

      return ordersWithItems as OrderWithItems[];
    } catch (error) {
      console.error("Supabase query failed:", error);
    }
  }

  return [];
}

/**
 * Get all orders (including pending/processing) for financial analysis
 */
export async function getAllOrdersForAnalysis(
  startDate?: Date,
  endDate?: Date
): Promise<OrderWithItems[]> {
  // Similar to getCompletedOrders but includes all statuses except cancelled
  if (db) {
    try {
      let query = db.select().from(orders);

      const conditions: any[] = [];
      if (startDate) {
        conditions.push(gte(orders.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(orders.createdAt, endDate));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions) as any) as any;
      }

      const ordersList = await query;

      const ordersWithItems = await Promise.all(
        ordersList.map(async (order) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

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
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.warn("Drizzle query failed, trying Supabase fallback:", error);
    }
  }

  // Fallback to Supabase Admin
  if (supabaseAdmin) {
    try {
      let ordersQuery = supabaseAdmin
        .from("orders")
        .select("*")
        .neq("status", "cancelled");

      if (startDate) {
        ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());
      }

      const { data: ordersList, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;
      if (!ordersList) return [];

      const ordersWithItems = await Promise.all(
        ordersList.map(async (order) => {
          const { data: items, error: itemsError } = await supabaseAdmin
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          if (itemsError || !items) {
            return { ...order, orderItems: [] };
          }

          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const { data: productData, error: productError } =
                await supabaseAdmin
                  .from("products")
                  .select("*")
                  .eq("id", item.product_id)
                  .single();

              if (productError || !productData) {
                return null;
              }

              return {
                ...item,
                product: productData,
              };
            })
          );

          return {
            ...order,
            orderItems: itemsWithProducts.filter((item) => item !== null),
          };
        })
      );

      return ordersWithItems as OrderWithItems[];
    } catch (error) {
      console.error("Supabase query failed:", error);
    }
  }

  return [];
}
