import { r as requireAdmin } from "../../../../chunks/auth.js";
import { s as supabase } from "../../../../chunks/supabase.js";
import { deleteImage, uploadImage } from "../../../../chunks/storage.js";
import { h as handleError } from "../../../../chunks/errors.js";
class MediaService {
  /**
   * Get all media files
   */
  async getAllMedia(folder) {
    try {
      let query = supabase.from("media_files").select("*").order("created_at", { ascending: false });
      if (folder) {
        query = query.eq("folder", folder);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch media: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Get media file by ID
   */
  async getMediaById(id) {
    const { data, error } = await supabase.from("media_files").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch media: ${error.message}`);
    }
    return data;
  }
  /**
   * Create media file record
   */
  async createMedia(media) {
    const { data, error } = await supabase.from("media_files").insert({ ...media, usage_count: 0, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create media: ${error.message}`);
    return data;
  }
  /**
   * Update media file
   */
  async updateMedia(id, media) {
    const { data, error } = await supabase.from("media_files").update({ ...media, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update media: ${error.message}`);
    return data;
  }
  /**
   * Delete media file
   */
  async deleteMedia(id) {
    const { error } = await supabase.from("media_files").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete media: ${error.message}`);
  }
  /**
   * Get media usage (which products/pages use which images)
   */
  async getMediaUsage(mediaId) {
    try {
      const { data, error } = await supabase.from("media_usage").select("*").eq("media_id", mediaId);
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch media usage: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  /**
   * Track media usage
   */
  async trackMediaUsage(usage) {
    try {
      const { data: existing } = await supabase.from("media_usage").select("id").eq("media_id", usage.media_id).eq("entity_type", usage.entity_type).eq("entity_id", usage.entity_id).single();
      if (!existing) {
        await supabase.from("media_usage").insert(usage);
        const { data: media } = await this.getMediaById(usage.media_id);
        if (media) {
          await supabase.from("media_files").update({ usage_count: media.usage_count + 1 }).eq("id", usage.media_id);
        }
      }
    } catch (error) {
      console.error("Error tracking media usage:", error);
    }
  }
  /**
   * Get all unused media files
   */
  async getUnusedMedia() {
    const allMedia = await this.getAllMedia();
    return allMedia.filter((media) => media.usage_count === 0);
  }
  /**
   * Get media by type
   */
  async getMediaByType(fileType) {
    const { data, error } = await supabase.from("media_files").select("*").eq("file_type", fileType).order("created_at", { ascending: false });
    if (error) {
      if (error.code === "42P01") return [];
      throw new Error(`Failed to fetch media: ${error.message}`);
    }
    return data || [];
  }
  /**
   * Search media files
   */
  async searchMedia(query) {
    const { data, error } = await supabase.from("media_files").select("*").or(`filename.ilike.%${query}%,original_filename.ilike.%${query}%,description.ilike.%${query}%`).order("created_at", { ascending: false });
    if (error) {
      if (error.code === "42P01") return [];
      throw new Error(`Failed to search media: ${error.message}`);
    }
    return data || [];
  }
  /**
   * Get media statistics
   */
  async getMediaStats() {
    try {
      const allMedia = await this.getAllMedia();
      const totalSize = allMedia.reduce((sum, m) => sum + (m.file_size || 0), 0);
      const byType = {};
      allMedia.forEach((m) => {
        byType[m.file_type] = (byType[m.file_type] || 0) + 1;
      });
      const unusedCount = allMedia.filter((m) => m.usage_count === 0).length;
      return {
        totalFiles: allMedia.length,
        totalSize,
        byType,
        unusedCount
      };
    } catch (error) {
      return {
        totalFiles: 0,
        totalSize: 0,
        byType: {},
        unusedCount: 0
      };
    }
  }
}
const mediaService = new MediaService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const folder = url.searchParams.get("folder") || void 0;
    const search = url.searchParams.get("search") || void 0;
    const type = url.searchParams.get("type");
    let media;
    if (search) {
      media = await mediaService.searchMedia(search);
    } else if (type) {
      media = await mediaService.getMediaByType(type);
    } else {
      media = await mediaService.getAllMedia(folder);
    }
    const stats = await mediaService.getMediaStats();
    return {
      media,
      stats,
      folder,
      search,
      type,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      media: [],
      stats: { totalFiles: 0, totalSize: 0, byType: {}, unusedCount: 0 },
      folder: void 0,
      search: void 0,
      type: void 0,
      error: message
    };
  }
};
const actions = {
  upload: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder")?.toString() || "general";
    const altText = formData.get("alt_text")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    if (!file || file.size === 0) {
      return { error: "No file provided" };
    }
    try {
      const fileUrl = await uploadImage(file, "product-images");
      const mimeType = file.type;
      let fileType = "other";
      if (mimeType.startsWith("image/")) fileType = "image";
      else if (mimeType.startsWith("video/")) fileType = "video";
      else if (mimeType.includes("pdf") || mimeType.includes("document")) fileType = "document";
      let width;
      let height;
      if (fileType === "image") {
      }
      await mediaService.createMedia({
        filename: file.name,
        original_filename: file.name,
        file_url: fileUrl,
        file_type: fileType,
        file_size: file.size,
        mime_type: mimeType,
        width,
        height,
        alt_text: altText || void 0,
        description: description || void 0,
        folder: folder || void 0
      });
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const updateData = {};
    if (formData.get("alt_text")) updateData.alt_text = formData.get("alt_text")?.toString();
    if (formData.get("description")) updateData.description = formData.get("description")?.toString();
    if (formData.get("folder")) updateData.folder = formData.get("folder")?.toString();
    try {
      await mediaService.updateMedia(id, updateData);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const fileUrl = formData.get("file_url")?.toString() || "";
    try {
      if (fileUrl) {
        await deleteImage(fileUrl, "product-images");
      }
      await mediaService.deleteMedia(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  }
};
export {
  actions,
  load
};
