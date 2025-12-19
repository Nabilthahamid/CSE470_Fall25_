import { supabaseAdmin } from "$lib/server/db/supabase";
import type { Database } from "$lib/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

/**
 * Order Service - Business Logic Layer
 * Handles all order-related database operations
 */

/**
 * Create a new order with order items
 * @param userId - The user ID placing the order
 * @param items - Array of order items with product_id, quantity, and price_at_purchase
 * @param shippingCost - Shipping cost (default: 0)
 * @returns Created order with items
 */
export async function createOrder(
  userId: string,
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_purchase: number;
  }>,
  shippingCost: number = 0
): Promise<Order> {
  // Calculate total amount (subtotal + shipping)
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price_at_purchase,
    0
  );
  const totalAmount = subtotal + shippingCost;

  // Create order
  const insertResult = (await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      total_amount: totalAmount,
    } as any)
    .select()
    .single()) as { data: Order | null; error: any };

  const order = insertResult.data;
  const orderError = insertResult.error;

  if (orderError || !order) {
    throw new Error(
      orderError?.message || "Failed to create order: No data returned"
    );
  }

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
  }));

  const insertItemsResult = await supabaseAdmin
    .from("order_items")
    .insert(orderItems as any);
  const itemsError = insertItemsResult.error;

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return order;
}

/**
 * Get orders for a specific user
 * @param userId - The user ID
 * @returns Array of user's orders
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user orders: ${error.message}`);
  }

  const orders = data || [];
  console.log(`Fetched ${orders.length} orders for user ${userId}`);
  console.log(
    `Order statuses:`,
    orders.map((o) => ({ id: o.id.substring(0, 8), status: o.status }))
  );

  return orders;
}

/**
 * Get order items for a specific order
 * @param orderId - The order ID
 * @returns Array of order items
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (error) {
    throw new Error(`Failed to fetch order items: ${error.message}`);
  }

  return data || [];
}

/**
 * Order with full details including items and products
 */
export interface OrderWithDetails extends Order {
  items: Array<
    OrderItem & {
      product: {
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        description: string | null;
      };
    }
  >;
  customer: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

/**
 * Get user orders with full details (items, products, customer info)
 * @param userId - The user ID
 * @returns Array of orders with full details
 */
export async function getUserOrdersWithDetails(
  userId: string
): Promise<OrderWithDetails[]> {
  // Get orders
  const orders = await getUserOrders(userId);

  // Get user profile for customer info
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  const customer = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
  };

  // Get all order items for all orders
  const orderIds = orders.map((order) => order.id);
  if (orderIds.length === 0) {
    return [];
  }

  const { data: allOrderItems, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemsError) {
    throw new Error(`Failed to fetch order items: ${itemsError.message}`);
  }

  // Get all product IDs
  const productIds = [
    ...new Set(allOrderItems?.map((item) => item.product_id) || []),
  ];

  // Get all products
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id, name, slug, image_url, description")
    .in("id", productIds);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  // Create product map
  const productMap = new Map(products?.map((p) => [p.id, p]) || []);

  // Combine orders with items and products
  const ordersWithDetails: OrderWithDetails[] = orders.map((order) => {
    const orderItems =
      allOrderItems?.filter((item) => item.order_id === order.id) || [];

    const itemsWithProducts = orderItems.map((item) => {
      const product = productMap.get(item.product_id);
      return {
        ...item,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image_url: product.image_url,
              description: product.description,
            }
          : {
              id: item.product_id,
              name: "Product not found",
              slug: "",
              image_url: null,
              description: null,
            },
      };
    });

    return {
      ...order,
      items: itemsWithProducts,
      customer,
    };
  });

  return ordersWithDetails;
}

/**
 * Get all orders (for admin)
 * @returns Array of all orders
 */
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all orders with full details (for admin)
 * @returns Array of all orders with full details
 */
export async function getAllOrdersWithDetails(): Promise<OrderWithDetails[]> {
  // Get all orders
  const orders = await getAllOrders();

  if (orders.length === 0) {
    return [];
  }

  // Get all unique user IDs
  const userIds = [...new Set(orders.map((order) => order.user_id))];

  // Get all user profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
  }

  // Create customer map
  const customerMap = new Map(
    profiles?.map((p) => [
      p.id,
      { id: p.id, email: p.email, full_name: p.full_name },
    ]) || []
  );

  // Get all order items
  const orderIds = orders.map((order) => order.id);
  const { data: allOrderItems, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemsError) {
    throw new Error(`Failed to fetch order items: ${itemsError.message}`);
  }

  // Get all product IDs
  const productIds = [
    ...new Set(allOrderItems?.map((item) => item.product_id) || []),
  ];

  // Get all products
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("id, name, slug, image_url, description")
    .in("id", productIds);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  // Create product map
  const productMap = new Map(products?.map((p) => [p.id, p]) || []);

  // Combine orders with items, products, and customer info
  const ordersWithDetails: OrderWithDetails[] = orders.map((order) => {
    const customer = customerMap.get(order.user_id) || {
      id: order.user_id,
      email: "Unknown",
      full_name: null,
    };

    const orderItems =
      allOrderItems?.filter((item) => item.order_id === order.id) || [];

    const itemsWithProducts = orderItems.map((item) => {
      const product = productMap.get(item.product_id);
      return {
        ...item,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image_url: product.image_url,
              description: product.description,
            }
          : {
              id: item.product_id,
              name: "Product not found",
              slug: "",
              image_url: null,
              description: null,
            },
      };
    });

    return {
      ...order,
      items: itemsWithProducts,
      customer,
    };
  });

  return ordersWithDetails;
}

/**
 * Update order status
 * @param orderId - The order ID
 * @param status - New status (pending, processing, shipped, delivered, cancelled)
 * @returns Updated order
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
): Promise<Order> {
  console.log(`Updating order ${orderId} to status: ${status}`);

  const updateResult = (await supabaseAdmin
    .from("orders")
    .update({ status } as any)
    .eq("id", orderId)
    .select()
    .single()) as { data: Order | null; error: any };

  const { data, error } = updateResult;

  if (error) {
    console.error(`Error updating order status:`, error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  if (!data) {
    console.error(`No data returned from update`);
    throw new Error("Failed to update order status: No data returned");
  }

  console.log(`Order status updated successfully:`, data);
  return data;
}
