import { supabaseAdmin } from "$lib/server/db/supabase";
import type { Database } from "$lib/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

/**
 * Profit/Loss Service - Business Logic Layer
 * Handles profit/loss calculations for products and business records
 * Optimized for performance with efficient database queries
 */

export interface ProductProfitLoss {
  product_id: string;
  product_name: string;
  product_slug: string;
  cost_price: number;
  selling_price: number;
  total_quantity_sold: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  profit_margin: number; // Percentage
  profit_per_unit: number;
}

export interface BusinessSummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  total_profit_margin: number; // Percentage
  total_products_sold: number;
  products: ProductProfitLoss[];
}

/**
 * Calculate profit/loss for all products based on order history
 * Optimized version that uses efficient queries
 * @param statuses - Optional array of order statuses to include (default: all non-cancelled)
 * @returns Business summary with profit/loss for each product
 */
export async function calculateProductProfitLoss(
  statuses?: string[]
): Promise<BusinessSummary> {
  // Default to all non-cancelled orders if no statuses specified
  const defaultStatuses = ["delivered", "shipped", "processing", "pending"];
  const statusesToInclude =
    statuses && statuses.length > 0 ? statuses : defaultStatuses;

  // Optimized query: First get orders with the right status
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .in("status", statusesToInclude);

  if (ordersError) {
    throw new Error(`Failed to fetch orders: ${ordersError.message}`);
  }

  const orderIds = orders?.map((o) => o.id) || [];
  if (orderIds.length === 0) {
    // Return empty summary if no orders match
    return {
      total_revenue: 0,
      total_cost: 0,
      total_profit: 0,
      total_profit_margin: 0,
      total_products_sold: 0,
      products: [],
    };
  }

  // Get order items for these orders
  const { data: orderItems, error: orderItemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (orderItemsError) {
    throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
  }

  // Get all products in a single query
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("*");

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  // Create a map of product data for fast lookup
  const productMap = new Map(products?.map((p) => [p.id, p]) || []);

  // Aggregate order items by product
  const productStats = new Map<
    string,
    {
      totalQuantity: number;
      totalRevenue: number;
    }
  >();

  // Process all order items and aggregate by product
  for (const item of orderItems || []) {
    const productId = item.product_id;
    const existing = productStats.get(productId) || {
      totalQuantity: 0,
      totalRevenue: 0,
    };

    existing.totalQuantity += item.quantity;
    existing.totalRevenue += item.quantity * item.price_at_purchase;

    productStats.set(productId, existing);
  }

  // Calculate profit/loss for each product
  const productProfitLoss: ProductProfitLoss[] = [];

  for (const product of products || []) {
    const stats = productStats.get(product.id) || {
      totalQuantity: 0,
      totalRevenue: 0,
    };

    const costPrice = (product as any).cost_price || 0;
    const totalCost = stats.totalQuantity * costPrice;
    const profit = stats.totalRevenue - totalCost;
    const profitPerUnit =
      costPrice > 0 ? product.price - costPrice : product.price;
    const profitMargin =
      stats.totalRevenue > 0 ? (profit / stats.totalRevenue) * 100 : 0;

    productProfitLoss.push({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      cost_price: costPrice,
      selling_price: product.price,
      total_quantity_sold: stats.totalQuantity,
      total_revenue: stats.totalRevenue,
      total_cost: totalCost,
      profit: profit,
      profit_margin: profitMargin,
      profit_per_unit: profitPerUnit,
    });
  }

  // Calculate business summary
  const totalRevenue = productProfitLoss.reduce(
    (sum, p) => sum + p.total_revenue,
    0
  );
  const totalCost = productProfitLoss.reduce((sum, p) => sum + p.total_cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalProfitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalProductsSold = productProfitLoss.reduce(
    (sum, p) => sum + p.total_quantity_sold,
    0
  );

  return {
    total_revenue: totalRevenue,
    total_cost: totalCost,
    total_profit: totalProfit,
    total_profit_margin: totalProfitMargin,
    total_products_sold: totalProductsSold,
    products: productProfitLoss.sort((a, b) => b.profit - a.profit), // Sort by profit descending
  };
}

/**
 * Calculate profit/loss for a specific product
 * @param productId - The product ID
 * @returns Profit/loss data for the product
 */
export async function calculateProductProfitLossById(
  productId: string
): Promise<ProductProfitLoss | null> {
  const summary = await calculateProductProfitLoss();
  return summary.products.find((p) => p.product_id === productId) || null;
}

/**
 * Get profit/loss records filtered by date range
 * Optimized version with efficient date filtering
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @param statuses - Optional array of order statuses to include (default: all non-cancelled)
 * @returns Business summary filtered by date range
 */
export async function calculateProfitLossByDateRange(
  startDate?: Date,
  endDate?: Date,
  statuses?: string[]
): Promise<BusinessSummary> {
  // Default to all non-cancelled orders if no statuses specified
  const defaultStatuses = ["delivered", "shipped", "processing", "pending"];
  const statusesToInclude =
    statuses && statuses.length > 0 ? statuses : defaultStatuses;

  // Build optimized query: First get orders with date and status filtering
  let ordersQuery = supabaseAdmin
    .from("orders")
    .select("id, created_at")
    .in("status", statusesToInclude);

  // Apply date filters
  if (startDate) {
    ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
  }
  if (endDate) {
    ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());
  }

  const { data: orders, error: ordersError } = await ordersQuery;

  if (ordersError) {
    throw new Error(`Failed to fetch orders: ${ordersError.message}`);
  }

  const orderIds = orders?.map((o) => o.id) || [];
  if (orderIds.length === 0) {
    // Return empty summary if no orders match
    return {
      total_revenue: 0,
      total_cost: 0,
      total_profit: 0,
      total_profit_margin: 0,
      total_products_sold: 0,
      products: [],
    };
  }

  // Get order items for these orders
  const { data: orderItems, error: orderItemsError } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (orderItemsError) {
    throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
  }

  // Get all products
  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("*");

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  // Create a map of product data for fast lookup
  const productMap = new Map(products?.map((p) => [p.id, p]) || []);

  // Aggregate order items by product
  const productStats = new Map<
    string,
    {
      totalQuantity: number;
      totalRevenue: number;
    }
  >();

  // Process all order items and aggregate by product
  for (const item of orderItems || []) {
    const productId = item.product_id;
    const existing = productStats.get(productId) || {
      totalQuantity: 0,
      totalRevenue: 0,
    };

    existing.totalQuantity += item.quantity;
    existing.totalRevenue += item.quantity * item.price_at_purchase;

    productStats.set(productId, existing);
  }

  // Calculate profit/loss for each product
  const productProfitLoss: ProductProfitLoss[] = [];

  for (const product of products || []) {
    const stats = productStats.get(product.id) || {
      totalQuantity: 0,
      totalRevenue: 0,
    };

    const costPrice = (product as any).cost_price || 0;
    const totalCost = stats.totalQuantity * costPrice;
    const profit = stats.totalRevenue - totalCost;
    const profitPerUnit =
      costPrice > 0 ? product.price - costPrice : product.price;
    const profitMargin =
      stats.totalRevenue > 0 ? (profit / stats.totalRevenue) * 100 : 0;

    productProfitLoss.push({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      cost_price: costPrice,
      selling_price: product.price,
      total_quantity_sold: stats.totalQuantity,
      total_revenue: stats.totalRevenue,
      total_cost: totalCost,
      profit: profit,
      profit_margin: profitMargin,
      profit_per_unit: profitPerUnit,
    });
  }

  // Calculate business summary
  const totalRevenue = productProfitLoss.reduce(
    (sum, p) => sum + p.total_revenue,
    0
  );
  const totalCost = productProfitLoss.reduce((sum, p) => sum + p.total_cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalProfitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalProductsSold = productProfitLoss.reduce(
    (sum, p) => sum + p.total_quantity_sold,
    0
  );

  return {
    total_revenue: totalRevenue,
    total_cost: totalCost,
    total_profit: totalProfit,
    total_profit_margin: totalProfitMargin,
    total_products_sold: totalProductsSold,
    products: productProfitLoss.sort((a, b) => b.profit - a.profit),
  };
}
