import { db, supabaseAdmin } from "$lib/db/server";
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
  // Try Drizzle first
  if (db) {
    try {
      const result = await db.insert(products).values(data).returning();
      return result[0];
    } catch (error) {
      console.warn(
        "Drizzle createProduct failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client
  if (supabaseAdmin) {
    try {
      const { data: insertedData, error } = await supabaseAdmin
        .from("products")
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          price: data.price.toString(),
          cost: data.cost ? data.cost.toString() : null,
          image_url: data.imageUrl || null,
          category: data.category || null,
          stock: data.stock || 0,
        })
        .select()
        .single();

      if (error) throw error;
      if (!insertedData) throw new Error("Failed to create product");

      // Map Supabase response to Product type
      return {
        id: insertedData.id,
        name: insertedData.name,
        slug: insertedData.slug,
        description: insertedData.description,
        price: insertedData.price,
        imageUrl: insertedData.image_url,
        category: insertedData.category,
        stock: insertedData.stock,
        createdAt: new Date(insertedData.created_at),
        updatedAt: new Date(insertedData.updated_at),
      } as Product;
    } catch (error) {
      console.error("Supabase createProduct failed:", error);
      throw error;
    }
  }

  throw new Error("Database connection not available");
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
  // Try Drizzle first
  if (db) {
    try {
      const result = await db
        .update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.warn(
        "Drizzle updateProduct failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client
  if (supabaseAdmin) {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price.toString();
      if (data.cost !== undefined) updateData.cost = data.cost ? data.cost.toString() : null;
      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.stock !== undefined) updateData.stock = data.stock;
      updateData.updated_at = new Date().toISOString();

      const { data: updatedData, error } = await supabaseAdmin
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows returned
        throw error;
      }
      if (!updatedData) return null;

      // Map Supabase response to Product type
      return {
        id: updatedData.id,
        name: updatedData.name,
        slug: updatedData.slug,
        description: updatedData.description,
        price: updatedData.price,
        cost: updatedData.cost || null,
        imageUrl: updatedData.image_url,
        category: updatedData.category,
        stock: updatedData.stock,
        createdAt: new Date(updatedData.created_at),
        updatedAt: new Date(updatedData.updated_at),
      } as Product;
    } catch (error) {
      console.error("Supabase updateProduct failed:", error);
      return null;
    }
  }

  throw new Error("Database connection not available");
}

/**
 * Delete a product (Admin only)
 * @param id - Product UUID
 * @returns Deleted product or null if not found
 */
export async function deleteProduct(id: string): Promise<Product | null> {
  // Try Drizzle first
  if (db) {
    try {
      const result = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.warn(
        "Drizzle deleteProduct failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client
  if (supabaseAdmin) {
    try {
      // First get the product to return it
      const { data: productData, error: fetchError } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !productData) return null;

      // Delete the product
      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Map Supabase response to Product type
      return {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.image_url,
        stock: productData.stock,
        createdAt: new Date(productData.created_at),
        updatedAt: new Date(productData.updated_at),
      } as Product;
    } catch (error) {
      console.error("Supabase deleteProduct failed:", error);
      return null;
    }
  }

  throw new Error("Database connection not available");
}
