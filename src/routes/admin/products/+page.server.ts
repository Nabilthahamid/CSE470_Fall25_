import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "$lib/server/services/productService";
import { uploadImage } from "$lib/server/services/storageService";

/**
 * Controller (Entry Point) - Admin Products Management
 * Protected route - only accessible by admin users
 */
export const load: PageServerLoad = async ({ locals }) => {
  // Ensure user is admin
  if (!locals.user) {
    throw redirect(302, "/auth");
  }

  if (locals.role !== "admin") {
    throw redirect(302, "/");
  }

  // Load all products
  try {
    const products = await getAllProducts();
    return {
      products,
      user: locals.user,
      role: locals.role,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load products";
    throw fail(500, { error: message });
  }
};

export const actions: Actions = {
  /**
   * Create Product Action
   * Only admins can create products
   * Admins have full access to add any product
   */
  create: async ({ request, locals }) => {
    // Ensure user is admin - only admins can create products
    if (!locals.user || locals.role !== "admin") {
      return fail(403, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const slug = formData.get("slug")?.toString();
    const description = formData.get("description")?.toString() || null;
    const price = formData.get("price")?.toString();
    const costPrice = formData.get("cost_price")?.toString();
    const stock = formData.get("stock")?.toString();
    const imageFile = formData.get("image_file") as File | null;
    const imageUrl = formData.get("image_url")?.toString() || null;
    const imageType =
      formData.get("image_type")?.toString() ||
      (imageFile && imageFile.size > 0 ? "upload" : "url");

    // Validate required fields
    if (!name || !slug || !price || stock === null) {
      return fail(400, { error: "Name, slug, price, and stock are required" });
    }

    // Validate and parse numeric fields
    const priceNum = parseFloat(price || "0");
    const costPriceNum = costPrice ? parseFloat(costPrice) : 0;
    const stockNum = parseInt(stock || "0", 10);

    if (isNaN(priceNum) || priceNum < 0) {
      return fail(400, { error: "Price must be a valid positive number" });
    }

    if (isNaN(costPriceNum) || costPriceNum < 0) {
      return fail(400, { error: "Cost price must be a valid positive number" });
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return fail(400, { error: "Stock must be a valid positive integer" });
    }

    // Handle image upload or URL
    let finalImageUrl: string | null = null;

    try {
      if (imageType === "upload" && imageFile && imageFile.size > 0) {
        // Upload file to Supabase Storage
        try {
          finalImageUrl = await uploadImage(imageFile);
        } catch (uploadError) {
          const errorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload image";
          // Check if it's a storage bucket error
          if (
            errorMessage.includes("Bucket") ||
            errorMessage.includes("bucket")
          ) {
            return fail(400, {
              error:
                "Storage bucket 'product-images' not found. Please create it in Supabase Storage settings.",
            });
          }
          return fail(400, { error: `Image upload failed: ${errorMessage}` });
        }
      } else if (imageType === "url" && imageUrl) {
        // Use provided URL
        finalImageUrl = imageUrl.trim() || null;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process image";
      return fail(400, { error: message });
    }

    try {
      await createProduct({
        name,
        slug,
        description,
        price: priceNum,
        cost_price: costPriceNum,
        stock: stockNum,
        image_url: finalImageUrl,
      });

      return { success: true, message: "Product created successfully" };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create product";
      return fail(500, { error: message });
    }
  },

  /**
   * Update Product Action
   * Only admins can update products
   * Admins can edit ANY product (full access)
   */
  update: async ({ request, locals }) => {
    // Ensure user is admin - only admins can update products
    if (!locals.user || locals.role !== "admin") {
      return fail(403, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const productId = formData.get("productId")?.toString();
    const name = formData.get("name")?.toString();
    const slug = formData.get("slug")?.toString();
    const description = formData.get("description")?.toString();
    const price = formData.get("price")?.toString();
    const costPrice = formData.get("cost_price")?.toString();
    const stock = formData.get("stock")?.toString();
    const imageFile = formData.get("image_file") as File | null;
    const imageUrl = formData.get("image_url")?.toString();

    if (!productId) {
      return fail(400, { error: "Product ID is required" });
    }

    // Validate required fields
    if (!name || !slug || !price || stock === null || stock === undefined) {
      return fail(400, { error: "Name, slug, price, and stock are required" });
    }

    // Build update object with all fields
    const updateData: {
      name: string;
      slug: string;
      description: string | null;
      price: number;
      cost_price?: number;
      stock: number;
      image_url: string | null;
    } = {
      name,
      slug,
      description:
        description && description.trim() ? description.trim() : null,
      image_url: image_url && image_url.trim() ? image_url.trim() : null,
      price: 0,
      stock: 0,
    };

    // Validate and parse numeric fields
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return fail(400, { error: "Price must be a valid positive number" });
    }
    updateData.price = priceNum;

    const costPriceNum = costPrice ? parseFloat(costPrice) : 0;
    if (costPrice && (isNaN(costPriceNum) || costPriceNum < 0)) {
      return fail(400, { error: "Cost price must be a valid positive number" });
    }
    if (costPrice) {
      updateData.cost_price = costPriceNum;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      return fail(400, { error: "Stock must be a valid positive integer" });
    }
    updateData.stock = stockNum;

    // Handle image upload or URL
    // If a file is uploaded, use it; otherwise use the URL if provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Upload file to Supabase Storage
        const uploadedUrl = await uploadImage(imageFile);
        updateData.image_url = uploadedUrl;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload image";
        return fail(400, { error: message });
      }
    } else if (imageUrl !== undefined) {
      // Use provided URL (can be empty string to remove image)
      updateData.image_url =
        imageUrl && imageUrl.trim() ? imageUrl.trim() : null;
    }

    try {
      await updateProduct(productId, updateData);
      return { success: true, message: "Product updated successfully" };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update product";
      return fail(500, { error: message });
    }
  },

  /**
   * Delete Product Action
   * Only admins can delete products
   * Admins can delete ANY product (full access)
   */
  delete: async ({ request, locals }) => {
    // Ensure user is admin - only admins can delete products
    if (!locals.user || locals.role !== "admin") {
      return fail(403, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const productId = formData.get("productId")?.toString();

    if (!productId) {
      return fail(400, { error: "Product ID is required" });
    }

    try {
      await deleteProduct(productId);
      return { success: true, message: "Product deleted successfully" };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete product";
      return fail(500, { error: message });
    }
  },
};
