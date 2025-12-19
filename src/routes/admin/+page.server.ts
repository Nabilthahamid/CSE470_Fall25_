import { getAllProducts } from "$lib/server/models/products";
import { getAllProfiles } from "$lib/server/models/users";
import { db, supabaseAdmin } from "$lib/db/server";
import { orders } from "$lib/db/schema";
import { count } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "$lib/server/models/adminProducts";
import { sanitizeSlug } from "$lib/utils/validators";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  // Get statistics
  const products = await getAllProducts();
  const users = await getAllProfiles();

  // Get orders count with fallback
  let totalOrders = 0;
  if (db) {
    try {
      const result = await db.select({ count: count() }).from(orders);
      totalOrders = Number(result[0]?.count || 0);
    } catch (error) {
      console.warn(
        "Drizzle orders count failed, trying Supabase fallback:",
        error
      );
    }
  }

  // Fallback to Supabase Admin client for orders count
  if (totalOrders === 0 && supabaseAdmin) {
    try {
      const { count, error } = await supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true });

      if (!error && count !== null && count !== undefined) {
        totalOrders = count;
      } else if (error) {
        console.warn("Supabase orders count query error:", error);
        // Try to get all orders and count them
        const { data, error: fetchError } = await supabaseAdmin
          .from("orders")
          .select("id");
        if (!fetchError && data) {
          totalOrders = data.length;
        }
      }
    } catch (error) {
      console.error("Supabase orders count failed:", error);
      totalOrders = 0; // Default to 0 if count fails
    }
  }

  return {
    stats: {
      totalProducts: products.length,
      totalUsers: users.length,
      totalOrders,
    },
    products, // Include products for display on dashboard
  };
};

export const actions: Actions = {
  addProduct: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString();
    const slug =
      data.get("slug")?.toString() || (name ? sanitizeSlug(name) : "");
    const description = data.get("description")?.toString() || null;
    const price = data.get("price")?.toString();
    const imageUrl = data.get("imageUrl")?.toString() || null;
    const imageFile = data.get("imageFile") as File | null;
    const stock = data.get("stock")?.toString();

    // Handle file upload
    let finalImageUrl = imageUrl;
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      if (!validTypes.includes(imageFile.type)) {
        return fail(400, {
          error: "Invalid file type. Please upload JPG, PNG, GIF, WEBP, or PDF",
          formData: { name, slug, description, price, imageUrl, stock },
        });
      }

      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return fail(400, {
          error: "File size must be less than 5MB",
          formData: { name, slug, description, price, imageUrl, stock },
        });
      }

      // Convert file to base64 data URL
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = imageFile.type;
        finalImageUrl = `data:${mimeType};base64,${base64}`;
      } catch (error: any) {
        console.error("Error processing file upload:", error);
        return fail(500, {
          error: "Failed to process uploaded file",
          formData: { name, slug, description, price, cost: cost || "", imageUrl, stock },
        });
      }
    }

    // Validation
    if (!name || !price || !slug) {
        return fail(400, {
          error: "Name, slug, and price are required",
          formData: {
            name,
            slug,
            description,
            price,
            cost: cost || "",
            imageUrl: finalImageUrl,
            stock,
          },
        });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
        return fail(400, {
          error: "Price must be a positive number",
          formData: {
            name,
            slug,
            description,
            price,
            cost: cost || "",
            imageUrl: finalImageUrl,
            stock,
          },
        });
    }

    const stockNum = stock ? parseInt(stock, 10) : 0;
    if (isNaN(stockNum) || stockNum < 0) {
        return fail(400, {
          error: "Stock must be a non-negative number",
          formData: {
            name,
            slug,
            description,
            price,
            cost: cost || "",
            imageUrl: finalImageUrl,
            stock,
          },
        });
    }

    const category = data.get("category")?.toString() || null;

    const costNum = cost ? parseFloat(cost) : null;
    if (cost && (isNaN(costNum!) || costNum! < 0)) {
      return fail(400, {
        error: "Cost must be a non-negative number",
        formData: {
          name,
          slug,
          description,
          price,
          cost,
          imageUrl: finalImageUrl,
          stock,
        },
      });
    }

    try {
      await createProduct({
        name,
        slug,
        description,
        price: priceNum.toString(),
        cost: costNum?.toString() || null,
        imageUrl: finalImageUrl,
        category,
        stock: stockNum,
      });

      return { success: true, message: "Product added successfully" };
    } catch (error: any) {
      console.error("Error adding product:", error);
      return fail(500, {
        error: error.message || "Failed to add product",
        formData: {
          name,
          slug,
          description,
          price,
          imageUrl: finalImageUrl,
          stock,
        },
      });
    }
  },

  updateProduct: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();
    const name = data.get("name")?.toString();
    const slug = data.get("slug")?.toString();
    const description = data.get("description")?.toString() || null;
    const price = data.get("price")?.toString();
    const imageUrl = data.get("imageUrl")?.toString() || null;
    const imageFile = data.get("imageFile") as File | null;
    const stock = data.get("stock")?.toString();

    // Handle file upload
    let finalImageUrl = imageUrl;
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      if (!validTypes.includes(imageFile.type)) {
        return fail(400, {
          error: "Invalid file type. Please upload JPG, PNG, GIF, WEBP, or PDF",
          formData: { id, name, slug, description, price, imageUrl, stock },
        });
      }

      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return fail(400, {
          error: "File size must be less than 5MB",
          formData: { id, name, slug, description, price, imageUrl, stock },
        });
      }

      // Convert file to base64 data URL
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = imageFile.type;
        finalImageUrl = `data:${mimeType};base64,${base64}`;
      } catch (error: any) {
        console.error("Error processing file upload:", error);
        return fail(500, {
          error: "Failed to process uploaded file",
          formData: { id, name, slug, description, price, imageUrl, stock },
        });
      }
    }

    // Validation
    if (!id || !name || !slug || !price) {
      return fail(400, {
        error: "ID, name, slug, and price are required",
        formData: { id, name, slug, description, price, imageUrl, stock },
      });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return fail(400, {
        error: "Price must be a positive number",
        formData: { id, name, slug, description, price, imageUrl, stock },
      });
    }

    const stockNum = stock ? parseInt(stock, 10) : 0;
    if (isNaN(stockNum) || stockNum < 0) {
      return fail(400, {
        error: "Stock must be a non-negative number",
        formData: { id, name, slug, description, price, imageUrl, stock },
      });
    }

    const category = data.get("category")?.toString() || null;

    const costNum = cost ? parseFloat(cost) : null;
    if (cost && (isNaN(costNum!) || costNum! < 0)) {
      return fail(400, {
        error: "Cost must be a non-negative number",
        formData: { id, name, slug, description, price, cost, imageUrl: finalImageUrl, stock },
      });
    }

    try {
      const updated = await updateProduct(id, {
        name,
        slug,
        description,
        price: priceNum.toString(),
        cost: costNum?.toString() || null,
        imageUrl: finalImageUrl,
        category,
        stock: stockNum,
      });

      if (!updated) {
        return fail(404, {
          error: "Product not found",
          formData: { id, name, slug, description, price, imageUrl, stock },
        });
      }

      return { success: true, message: "Product updated successfully" };
    } catch (error: any) {
      console.error("Error updating product:", error);
      return fail(500, {
        error: error.message || "Failed to update product",
        formData: { id, name, slug, description, price, imageUrl, stock },
      });
    }
  },

  deleteProduct: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();

    if (!id) {
      return fail(400, { error: "Product ID is required" });
    }

    try {
      const deleted = await deleteProduct(id);

      if (!deleted) {
        return fail(404, { error: "Product not found" });
      }

      return { success: true, message: "Product deleted successfully" };
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return fail(500, { error: error.message || "Failed to delete product" });
    }
  },
};
