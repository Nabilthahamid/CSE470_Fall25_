import { db } from "$lib/db/server";
import { products } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type Product = InferSelectModel<typeof products>;

/**
 * Get all products from the database
 * @returns Array of all products (empty array if database not available)
 */
export async function getAllProducts(): Promise<Product[]> {
  if (!db) {
    console.warn(
      "Database connection not available - returning empty products array"
    );
    return [];
  }
  return await db.select().from(products);
}

/**
 * Get a single product by ID
 * @param id - Product UUID
 * @returns Product or null if not found or database unavailable
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (!db) {
    console.warn("Database connection not available");
    return null;
  }
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Get a single product by slug
 * @param slug - Product slug
 * @returns Product or null if not found or database unavailable
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!db) {
    console.warn("Database connection not available");
    return null;
  }
  const result = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return result[0] || null;
}
