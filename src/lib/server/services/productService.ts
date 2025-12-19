import { supabaseAdmin } from "$lib/server/db/supabase";
import type { Product } from "$lib/types";

/**
 * Product Service - Business Logic Layer
 * Handles all product-related database operations
 */

/**
 * Get all products from the database
 * Fetches products from Supabase products table - NO hardcoded data
 * @returns Array of all products from database
 * @throws Error if database query fails
 */
export async function getAllProducts(): Promise<Product[]> {
  // Query products from database (Supabase)
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  // Return products from database (empty array if no products exist)
  return data || [];
}

/**
 * Get a single product by its slug
 * @param slug - The unique slug identifier for the product
 * @returns Product if found, null otherwise
 * @throws Error if database query fails
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    // If no rows are returned, Supabase returns a PGRST116 error
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data;
}

/**
 * Get products by their IDs (useful for order items)
 * @param productIds - Array of product IDs
 * @returns Array of products matching the IDs
 */
export async function getProductsByIds(
  productIds: string[]
): Promise<Product[]> {
  if (productIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .in("id", productIds);

  if (error) {
    throw new Error(`Failed to fetch products by IDs: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new product
 * @param productData - Product data to insert (name, slug, description, price, stock, image_url)
 * @returns Created product
 * @throws Error if database query fails
 */
export async function createProduct(productData: {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  cost_price?: number;
  stock: number;
  image_url?: string | null;
}): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(productData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create product: No data returned");
  }

  return data;
}

/**
 * Update an existing product
 * @param productId - The ID of the product to update
 * @param productData - Product data to update
 * @returns Updated product
 * @throws Error if database query fails
 */
export async function updateProduct(
  productId: string,
  productData: {
    name?: string;
    slug?: string;
    description?: string | null;
    price?: number;
    cost_price?: number;
    stock?: number;
    image_url?: string | null;
  }
): Promise<Product> {
  // Type assertion needed due to strict Supabase types
  const updateResult = (await supabaseAdmin
    .from("products")
    .update(productData as any)
    .eq("id", productId)
    .select()
    .single()) as any as { data: Product | null; error: any };

  const { data, error } = updateResult;

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to update product: No data returned");
  }

  return data;
}

/**
 * Delete a product by ID
 * @param productId - The ID of the product to delete
 * @throws Error if database query fails
 */
export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

/**
 * Get a product by ID
 * @param productId - The ID of the product
 * @returns Product if found, null otherwise
 * @throws Error if database query fails
 */
export async function getProductById(
  productId: string
): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    // If no rows are returned, Supabase returns a PGRST116 error
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data;
}
