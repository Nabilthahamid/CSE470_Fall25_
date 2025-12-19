import { db, supabaseAdmin } from "$lib/db/server";
import { orders, orderItems, products } from "$lib/db/schema";
import { eq, gte, lte, and, inArray } from "drizzle-orm";

export interface FinancialMetrics {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number; // Percentage
  orderCount: number;
}

export interface DailyFinancialData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
}

/**
 * Calculate financial metrics for a date range
 */
export async function calculateFinancialMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<FinancialMetrics> {
  let orderQuery = db?.select().from(orders);
  let orderItemsQuery: any;
  let ordersData: any[] = [];
  let orderItemsData: any[] = [];

  // Build date filter if provided
  if (startDate || endDate) {
    const conditions = [];
    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }
    if (endDate) {
      // Add one day to include the entire end date
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      conditions.push(lte(orders.createdAt, endDatePlusOne));
    }
    orderQuery = db
      ?.select()
      .from(orders)
      .where(and(...conditions));
  }

  // Try Drizzle first
  if (db && orderQuery) {
    try {
      ordersData = await orderQuery;

      // Get order items for these orders
      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        if (orderIds.length > 0) {
          orderItemsData = await db
            .select()
            .from(orderItems)
            .where(inArray(orderItems.orderId, orderIds));
        }
      }
    } catch (error: any) {
      const isConnectionError =
        error?.code === "ENOTFOUND" ||
        error?.cause?.code === "ENOTFOUND" ||
        error?.message?.includes("getaddrinfo") ||
        error?.message?.includes("ENOTFOUND");

      if (isConnectionError) {
        console.error(
          "Database connection error - cannot resolve hostname. Please check your DATABASE_URL and ensure your Supabase project is active."
        );
      } else {
        console.warn("Drizzle financial query failed, trying Supabase:", error);
      }
    }
  }

  // Fallback to Supabase Admin
  if ((!ordersData || ordersData.length === 0) && supabaseAdmin) {
    try {
      let query = supabaseAdmin
        .from("orders")
        .select("*")
        .eq("status", "delivered"); // Only count delivered orders

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        const endDatePlusOne = new Date(endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        query = query.lte("created_at", endDatePlusOne.toISOString());
      }

      const { data: ordersResult, error: ordersError } = await query;

      if (ordersError) throw ordersError;
      ordersData = ordersResult || [];

      // Get order items
      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        const { data: itemsResult, error: itemsError } = await supabaseAdmin
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        if (itemsError) throw itemsError;
        orderItemsData = itemsResult || [];
      }
    } catch (error: any) {
      const isConnectionError =
        error?.code === "ENOTFOUND" ||
        error?.message?.includes("getaddrinfo") ||
        error?.message?.includes("ENOTFOUND") ||
        error?.message?.includes("Failed to fetch");

      if (isConnectionError) {
        console.error(
          "Supabase connection error - cannot reach database. Please check your Supabase project status and network connection."
        );
      } else {
        console.error("Supabase financial query failed:", error);
      }
    }
  }

  // Calculate totals
  let totalRevenue = 0;
  let totalCost = 0;
  const orderIds = ordersData.map((o) => o.id);

  // Fetch all product costs once (optimized)
  const productCosts = new Map<string, number>();
  const productIds = [...new Set(orderItemsData.map((item) => item.product_id))];
  
  if (productIds.length > 0) {
    if (db) {
      try {
        const allProducts = await db
          .select({ id: products.id, cost: products.cost })
          .from(products)
          .where(inArray(products.id, productIds));
        allProducts.forEach((p) => {
          if (p.cost) productCosts.set(p.id, parseFloat(p.cost.toString()));
        });
      } catch (error) {
        // Fallback to Supabase
        if (supabaseAdmin) {
          const { data: allProducts } = await supabaseAdmin
            .from("products")
            .select("id, cost")
            .in("id", productIds);
          if (allProducts) {
            allProducts.forEach((p) => {
              if (p.cost) productCosts.set(p.id, parseFloat(p.cost.toString()));
            });
          }
        }
      }
    } else if (supabaseAdmin) {
      const { data: allProducts } = await supabaseAdmin
        .from("products")
        .select("id, cost")
        .in("id", productIds);
      if (allProducts) {
        allProducts.forEach((p) => {
          if (p.cost) productCosts.set(p.id, parseFloat(p.cost.toString()));
        });
      }
    }
  }

  // Calculate totals
  for (const item of orderItemsData) {
    const revenue = parseFloat(item.price || "0") * (item.quantity || 0);
    totalRevenue += revenue;

    const cost = productCosts.get(item.product_id) || 0;
    totalCost += cost * (item.quantity || 0);
  }

  const profit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    profit,
    profitMargin,
    orderCount: ordersData.length,
  };
}

/**
 * Get daily financial data for a date range
 * Optimized to fetch all data once and group by day in memory
 */
export async function getDailyFinancialData(
  startDate: Date,
  endDate: Date
): Promise<DailyFinancialData[]> {
  // Fetch all orders and order items once for the entire date range
  let ordersData: any[] = [];
  let orderItemsData: any[] = [];

  // Set up date range with proper boundaries
  const dayStart = new Date(startDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(endDate);
  dayEnd.setHours(23, 59, 59, 999);
  const dayEndPlusOne = new Date(dayEnd);
  dayEndPlusOne.setDate(dayEndPlusOne.getDate() + 1);

  // Try Drizzle first
  if (db) {
    try {
      ordersData = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.status, "delivered"),
            gte(orders.createdAt, dayStart),
            lte(orders.createdAt, dayEndPlusOne)
          )
        );

      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        if (orderIds.length > 0) {
          orderItemsData = await db
            .select()
            .from(orderItems)
            .where(inArray(orderItems.orderId, orderIds));
        }
      }
    } catch (error: any) {
      const isConnectionError =
        error?.code === "ENOTFOUND" ||
        error?.cause?.code === "ENOTFOUND" ||
        error?.message?.includes("getaddrinfo") ||
        error?.message?.includes("ENOTFOUND");

      if (isConnectionError) {
        console.error(
          "Database connection error - cannot resolve hostname. Please check your DATABASE_URL and ensure your Supabase project is active."
        );
      } else {
        console.warn(
          "Drizzle daily financial query failed, trying Supabase:",
          error
        );
      }
    }
  }

  // Fallback to Supabase Admin
  if ((!ordersData || ordersData.length === 0) && supabaseAdmin) {
    try {
      const { data: ordersResult, error: ordersError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("status", "delivered")
        .gte("created_at", dayStart.toISOString())
        .lte("created_at", dayEndPlusOne.toISOString());

      if (ordersError) throw ordersError;
      ordersData = ordersResult || [];

      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        const { data: itemsResult, error: itemsError } = await supabaseAdmin
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        if (itemsError) throw itemsError;
        orderItemsData = itemsResult || [];
      }
    } catch (error: any) {
      const isConnectionError =
        error?.code === "ENOTFOUND" ||
        error?.message?.includes("getaddrinfo") ||
        error?.message?.includes("ENOTFOUND") ||
        error?.message?.includes("Failed to fetch");

      if (isConnectionError) {
        console.error(
          "Supabase connection error - cannot reach database. Please check your Supabase project status and network connection."
        );
      } else {
        console.error("Supabase daily financial query failed:", error);
      }
    }
  }

  // Group orders by day
  const ordersByDay = new Map<string, any[]>();
  const orderItemsByOrderId = new Map<string, any[]>();

  // Index order items by order ID
  for (const item of orderItemsData) {
    const orderId = item.order_id || item.orderId;
    if (!orderItemsByOrderId.has(orderId)) {
      orderItemsByOrderId.set(orderId, []);
    }
    orderItemsByOrderId.get(orderId)!.push(item);
  }

  // Group orders by date
  for (const order of ordersData) {
    const orderDate = new Date(order.created_at || order.createdAt);
    const dateKey = orderDate.toISOString().split("T")[0];

    if (!ordersByDay.has(dateKey)) {
      ordersByDay.set(dateKey, []);
    }
    ordersByDay.get(dateKey)!.push(order);
  }

  // Get product costs map (cache to avoid repeated queries)
  const productCosts = new Map<string, number>();

  // Calculate metrics for each day
  const days: DailyFinancialData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const dayOrders = ordersByDay.get(dateKey) || [];

    let dayRevenue = 0;
    let dayCost = 0;
    let dayOrderCount = dayOrders.length;

    // Calculate revenue and cost for this day's orders
    for (const order of dayOrders) {
      const orderId = order.id;
      const items = orderItemsByOrderId.get(orderId) || [];

      for (const item of items) {
        const revenue = parseFloat(item.price || "0") * (item.quantity || 0);
        dayRevenue += revenue;

        // Get product cost (with caching)
        const productId = item.product_id || item.productId;
        if (!productCosts.has(productId)) {
          if (db) {
            try {
              const productResult = await db
                .select()
                .from(products)
                .where(eq(products.id, productId))
                .limit(1);
              if (productResult[0]?.cost) {
                productCosts.set(
                  productId,
                  parseFloat(productResult[0].cost.toString())
                );
              } else {
                productCosts.set(productId, 0);
              }
            } catch (error) {
              // Try Supabase fallback
              if (supabaseAdmin) {
                try {
                  const { data } = await supabaseAdmin
                    .from("products")
                    .select("cost")
                    .eq("id", productId)
                    .single();
                  if (data?.cost) {
                    productCosts.set(
                      productId,
                      parseFloat(data.cost.toString())
                    );
                  } else {
                    productCosts.set(productId, 0);
                  }
                } catch (err) {
                  productCosts.set(productId, 0);
                }
              } else {
                productCosts.set(productId, 0);
              }
            }
          } else if (supabaseAdmin) {
            try {
              const { data } = await supabaseAdmin
                .from("products")
                .select("cost")
                .eq("id", productId)
                .single();
              if (data?.cost) {
                productCosts.set(productId, parseFloat(data.cost.toString()));
              } else {
                productCosts.set(productId, 0);
              }
            } catch (err) {
              productCosts.set(productId, 0);
            }
          } else {
            productCosts.set(productId, 0);
          }
        }

        const cost = productCosts.get(productId) || 0;
        dayCost += cost * (item.quantity || 0);
      }
    }

    days.push({
      date: dateKey,
      revenue: dayRevenue,
      cost: dayCost,
      profit: dayRevenue - dayCost,
      orderCount: dayOrderCount,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

/**
 * Get top selling products by revenue
 */
export async function getTopSellingProducts(
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<ProductSalesData[]> {
  let ordersData: any[] = [];
  let orderItemsData: any[] = [];

  // Get orders in date range
  if (db) {
    try {
      let orderQuery = db
        .select()
        .from(orders)
        .where(eq(orders.status, "delivered"));

      if (startDate || endDate) {
        const conditions = [eq(orders.status, "delivered")];
        if (startDate) {
          conditions.push(gte(orders.createdAt, startDate));
        }
        if (endDate) {
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          conditions.push(lte(orders.createdAt, endDatePlusOne));
        }
        orderQuery = db
          .select()
          .from(orders)
          .where(and(...conditions));
      }

      ordersData = await orderQuery;

      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        if (orderIds.length > 0) {
          orderItemsData = await db
            .select()
            .from(orderItems)
            .where(inArray(orderItems.orderId, orderIds));
        }
      }
    } catch (error: any) {
      const isConnectionError =
        error?.code === "ENOTFOUND" ||
        error?.cause?.code === "ENOTFOUND" ||
        error?.message?.includes("getaddrinfo") ||
        error?.message?.includes("ENOTFOUND");

      if (isConnectionError) {
        console.error(
          "Database connection error - cannot resolve hostname. Please check your DATABASE_URL and ensure your Supabase project is active."
        );
      } else {
        console.warn(
          "Drizzle top products query failed, trying Supabase:",
          error
        );
      }
    }
  }

  // Fallback to Supabase
  if ((!ordersData || ordersData.length === 0) && supabaseAdmin) {
    try {
      let query = supabaseAdmin
        .from("orders")
        .select("*")
        .eq("status", "delivered");

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        const endDatePlusOne = new Date(endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        query = query.lte("created_at", endDatePlusOne.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      ordersData = data || [];

      if (ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);
        const { data: items, error: itemsError } = await supabaseAdmin
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        if (itemsError) throw itemsError;
        orderItemsData = items || [];
      }
    } catch (error: any) {
      const isConnectionError =
        error?.code === "ENOTFOUND" ||
        error?.message?.includes("getaddrinfo") ||
        error?.message?.includes("ENOTFOUND") ||
        error?.message?.includes("Failed to fetch");

      if (isConnectionError) {
        console.error(
          "Supabase connection error - cannot reach database. Please check your Supabase project status and network connection."
        );
      } else {
        console.error("Supabase top products query failed:", error);
      }
    }
  }

  // Aggregate by product
  const productMap = new Map<string, ProductSalesData>();

  for (const item of orderItemsData) {
    const productId = item.product_id;
    const quantity = item.quantity || 0;
    const price = parseFloat(item.price || "0");
    const revenue = price * quantity;

    if (!productMap.has(productId)) {
      // Get product name and cost
      let productName = "Unknown Product";
      let productCost = 0;

      if (db) {
        try {
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);
          if (product[0]) {
            productName = product[0].name;
            productCost = parseFloat(product[0].cost?.toString() || "0");
          }
        } catch (error) {
          // Try Supabase
          if (supabaseAdmin) {
            const { data } = await supabaseAdmin
              .from("products")
              .select("name, cost")
              .eq("id", productId)
              .single();
            if (data) {
              productName = data.name;
              productCost = parseFloat(data.cost?.toString() || "0");
            }
          }
        }
      } else if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from("products")
          .select("name, cost")
          .eq("id", productId)
          .single();
        if (data) {
          productName = data.name;
          productCost = parseFloat(data.cost?.toString() || "0");
        }
      }

      productMap.set(productId, {
        productId,
        productName,
        quantitySold: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      });
    }

    const productData = productMap.get(productId)!;
    productData.quantitySold += quantity;
    productData.revenue += revenue;

    // Get cost for this product if not already set
    if (productData.cost === 0 && db) {
      try {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, productId))
          .limit(1);
        if (product[0]?.cost) {
          productData.cost = parseFloat(product[0].cost.toString());
        }
      } catch (error) {
        // Already handled above
      }
    }

    productData.cost = productData.cost || 0;
    productData.profit =
      productData.revenue - productData.cost * productData.quantitySold;
  }

  // Convert to array and sort by revenue
  const products = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return products;
}
