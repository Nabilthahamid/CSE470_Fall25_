// SERVICE: Media Library Management
import { supabase } from '$lib/config/supabase';
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
		const { data, error } = await supabase
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
		const { data, error } = await supabase
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
		const { error } = await supabase.from('media_files').delete().eq('id', id);
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

