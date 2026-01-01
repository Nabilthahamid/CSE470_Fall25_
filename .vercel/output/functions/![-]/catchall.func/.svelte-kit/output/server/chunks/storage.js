import { s as supabase } from "./supabase.js";
async function uploadImage(file, bucket = "product-images") {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PNG and JPG images are allowed");
  }
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".png") && !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
    throw new Error("File must be .png or .jpg format");
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }
  const fileExt = fileName.split(".").pop();
  const fileNameUnique = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileNameUnique}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
}
async function deleteImage(imageUrl, bucket = "product-images") {
  try {
    const urlParts = imageUrl.split("/");
    const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join("/");
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error("Failed to delete image:", error);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}
export {
  deleteImage,
  uploadImage
};
