import { db } from "$lib/db/server";
import { products } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import type { Product } from "./products";

export type NewProduct = InferInsertModel<typeof products>;

/**
 * Create a new product (Admin only)
 * @param data - Product data
 * @returns Created product
 */
export async function createProduct(data: NewProduct): Promise<Product> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db.insert(products).values(data).returning();
  return result[0];
}

/**
 * Update a product (Admin only)
 * @param id - Product UUID
 * @param data - Partial product data to update
 * @returns Updated product or null if not found
 */
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Delete a product (Admin only)
 * @param id - Product UUID
 * @returns Deleted product or null if not found
 */
export async function deleteProduct(id: string): Promise<Product | null> {
  if (!db) {
    throw new Error("Database connection not available");
  }
  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  return result[0] || null;
}

