import { supabaseAdmin } from "$lib/server/db/supabase";

/**
 * Storage Service - Handles file uploads to Supabase Storage
 *
 * SETUP REQUIRED:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to Storage
 * 3. Create a new bucket named "product-images"
 * 4. Set the bucket to "Public" (so images can be accessed via public URLs)
 * 5. Configure policies if needed (or use service role key which bypasses RLS)
 */

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload (File object)
 * @param folder - The folder path in storage (default: 'products')
 * @returns Public URL of the uploaded file
 * @throws Error if upload fails
 */
export async function uploadImage(
  file: File,
  folder: string = "products"
): Promise<string> {
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG and PNG images are allowed.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit.");
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 * @returns void
 * @throws Error if deletion fails
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.findIndex(
      (part) => part === "product-images"
    );

    if (bucketIndex === -1) {
      // Not a storage URL, skip deletion (might be external URL)
      return;
    }

    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .remove([filePath]);

    if (error) {
      // Log error but don't throw (file might not exist)
      console.error(`Failed to delete image: ${error.message}`);
    }
  } catch (err) {
    // If URL parsing fails, it's likely an external URL, skip deletion
    console.error(`Failed to parse image URL for deletion: ${err}`);
  }
}
