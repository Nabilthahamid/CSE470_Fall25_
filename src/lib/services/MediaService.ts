// SERVICE: Media Library Management
import { supabase, getSupabaseAdmin } from '$lib/config/supabase';
import { productService } from './ProductService';
import type { MediaFile, MediaUsage, CreateMediaDTO, UpdateMediaDTO } from '$lib/models/Media';

export class MediaService {
	/**
	 * Get all media files
	 */
	async getAllMedia(folder?: string): Promise<MediaFile[]> {
		try {
			let query = supabase.from('media_files').select('*').order('created_at', { ascending: false });

			if (folder) {
				query = query.eq('folder', folder);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01') return []; // Table doesn't exist
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
	async getMediaById(id: string): Promise<MediaFile | null> {
		const { data, error } = await supabase.from('media_files').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch media: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create media file record
	 */
	async createMedia(media: CreateMediaDTO): Promise<MediaFile> {
		// Use admin client to bypass RLS for admin operations
		const { data, error } = await getSupabaseAdmin()
			.from('media_files')
			.insert({ ...media, usage_count: 0, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create media: ${error.message}`);
		return data;
	}

	/**
	 * Update media file
	 */
	async updateMedia(id: string, media: UpdateMediaDTO): Promise<MediaFile> {
		// Use admin client to bypass RLS for admin operations
		const { data, error } = await getSupabaseAdmin()
			.from('media_files')
			.update({ ...media, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update media: ${error.message}`);
		return data;
	}

	/**
	 * Delete media file
	 */
	async deleteMedia(id: string): Promise<void> {
		// Use admin client to bypass RLS for admin operations
		const { error } = await getSupabaseAdmin().from('media_files').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete media: ${error.message}`);
	}

	/**
	 * Get media usage (which products/pages use which images)
	 */
	async getMediaUsage(mediaId: string): Promise<MediaUsage[]> {
		try {
			const { data, error } = await supabase
				.from('media_usage')
				.select('*')
				.eq('media_id', mediaId);

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch media usage: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Track media usage for a product
	 */
	async trackProductMediaUsage(productId: string, imageUrl: string, productName?: string): Promise<void> {
		try {
			const adminClient = getSupabaseAdmin();
			// Find media file by URL
			const { data: mediaFiles, error: findError } = await adminClient
				.from('media_files')
				.select('id')
				.eq('file_url', imageUrl)
				.limit(1);

			// If table doesn't exist or other error, silently fail
			if (findError) {
				if (findError.code === '42P01') {
					// Table doesn't exist, that's okay
					return;
				}
				throw findError;
			}

			if (mediaFiles && mediaFiles.length > 0) {
				const mediaId = mediaFiles[0].id;
				await this.trackMediaUsage({
					media_id: mediaId,
					entity_type: 'product',
					entity_id: productId,
					entity_name: productName
				});
			}
		} catch (error: any) {
			// Don't fail if tracking fails - this is non-critical
			if (error?.code !== '42P01') {
				// Only log if it's not a "table doesn't exist" error
				console.warn('Failed to track product media usage:', error?.message || error);
			}
		}
	}

	/**
	 * Remove media usage for a product
	 */
	async removeProductMediaUsage(productId: string, imageUrl: string): Promise<void> {
		try {
			const adminClient = getSupabaseAdmin();
			// Find media file by URL
			const { data: mediaFiles } = await adminClient
				.from('media_files')
				.select('id')
				.eq('file_url', imageUrl)
				.limit(1);

			if (mediaFiles && mediaFiles.length > 0) {
				const mediaId = mediaFiles[0].id;
				await adminClient
					.from('media_usage')
					.delete()
					.eq('media_id', mediaId)
					.eq('entity_type', 'product')
					.eq('entity_id', productId);

				// Update usage count
				const { data: media } = await this.getMediaById(mediaId);
				if (media) {
					const usageCount = await this.getUsageCount(mediaId);
					await adminClient
						.from('media_files')
						.update({ usage_count: usageCount })
						.eq('id', mediaId);
				}
			}
		} catch (error) {
			console.warn('Failed to remove product media usage:', error);
		}
	}

	/**
	 * Get usage count for a media file
	 */
	async getUsageCount(mediaId: string): Promise<number> {
		try {
			const { count, error } = await supabase
				.from('media_usage')
				.select('*', { count: 'exact', head: true })
				.eq('media_id', mediaId);

			if (error) {
				if (error.code === '42P01') return 0;
				throw error;
			}
			return count || 0;
		} catch (error) {
			return 0;
		}
	}

	/**
	 * Track media usage
	 */
	async trackMediaUsage(usage: MediaUsage): Promise<void> {
		try {
			// Check if usage already exists
			const { data: existing } = await supabase
				.from('media_usage')
				.select('id')
				.eq('media_id', usage.media_id)
				.eq('entity_type', usage.entity_type)
				.eq('entity_id', usage.entity_id)
				.single();

			if (!existing) {
				await supabase.from('media_usage').insert(usage);

				// Update usage count
				const { data: media } = await this.getMediaById(usage.media_id);
				if (media) {
					await supabase
						.from('media_files')
						.update({ usage_count: media.usage_count + 1 })
						.eq('id', usage.media_id);
				}
			}
		} catch (error) {
			console.error('Error tracking media usage:', error);
		}
	}

	/**
	 * Get all unused media files
	 */
	async getUnusedMedia(): Promise<MediaFile[]> {
		const allMedia = await this.getAllMedia();
		return allMedia.filter((media) => media.usage_count === 0);
	}

	/**
	 * Get media by type
	 */
	async getMediaByType(fileType: 'image' | 'video' | 'document' | 'other'): Promise<MediaFile[]> {
		const { data, error } = await supabase
			.from('media_files')
			.select('*')
			.eq('file_type', fileType)
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to fetch media: ${error.message}`);
		}
		return data || [];
	}

	/**
	 * Search media files
	 */
	async searchMedia(query: string): Promise<MediaFile[]> {
		const { data, error } = await supabase
			.from('media_files')
			.select('*')
			.or(`filename.ilike.%${query}%,original_filename.ilike.%${query}%,description.ilike.%${query}%`)
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to search media: ${error.message}`);
		}
		return data || [];
	}

	/**
	 * Get media statistics
	 */
	async getMediaStats(): Promise<{
		totalFiles: number;
		totalSize: number;
		byType: Record<string, number>;
		unusedCount: number;
	}> {
		try {
			const allMedia = await this.getAllMedia();
			const totalSize = allMedia.reduce((sum, m) => sum + (m.file_size || 0), 0);

			const byType: Record<string, number> = {};
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

export const mediaService = new MediaService();

