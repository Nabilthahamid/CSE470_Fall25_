// UTILITY: Media library helper functions
import { supabase } from '$lib/config/supabase';
import type { MediaFile, CreateMediaDTO, UpdateMediaDTO } from '$lib/models/Media';

/**
 * Get all media files, optionally filtered by folder
 */
export async function getAllMedia(folder?: string): Promise<MediaFile[]> {
	try {
		let query = supabase.from('media_files').select('*').order('created_at', { ascending: false });

		if (folder) {
			query = query.eq('folder', folder);
		}

		const { data, error } = await query;

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				return [];
			}
			throw new Error(`Failed to fetch media: ${error.message}`);
		}

		return (data || []) as MediaFile[];
	} catch (error) {
		console.error('Error fetching media:', error);
		return [];
	}
}

/**
 * Get media files by type
 */
export async function getMediaByType(type: 'image' | 'video' | 'document' | 'other'): Promise<MediaFile[]> {
	try {
		const { data, error } = await supabase
			.from('media_files')
			.select('*')
			.eq('file_type', type)
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				return [];
			}
			throw new Error(`Failed to fetch media by type: ${error.message}`);
		}

		return (data || []) as MediaFile[];
	} catch (error) {
		console.error('Error fetching media by type:', error);
		return [];
	}
}

/**
 * Search media files by filename or description
 */
export async function searchMedia(search: string): Promise<MediaFile[]> {
	try {
		const searchPattern = `%${search}%`;
		// Supabase doesn't support complex OR with ILIKE easily, so we'll search in the most common fields
		// Using a simpler approach: search in filename first, then combine with description
		const { data, error } = await supabase
			.from('media_files')
			.select('*')
			.or(`filename.ilike.${searchPattern},original_filename.ilike.${searchPattern},description.ilike.${searchPattern},alt_text.ilike.${searchPattern}`)
			.order('created_at', { ascending: false });

		if (error) {
			// If OR query fails, try a simpler approach
			const { data: data1, error: error1 } = await supabase
				.from('media_files')
				.select('*')
				.ilike('filename', searchPattern)
				.order('created_at', { ascending: false });

			if (error1) {
				if (error1.code === '42P01' || error1.message.includes('does not exist') || error1.message.includes('schema cache')) {
					return [];
				}
				throw new Error(`Failed to search media: ${error1.message}`);
			}

			// Also search in description and combine results
			const { data: data2 } = await supabase
				.from('media_files')
				.select('*')
				.ilike('description', searchPattern)
				.order('created_at', { ascending: false });

			// Combine and deduplicate
			const combined = [...(data1 || []), ...(data2 || [])];
			const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());

			return unique as MediaFile[];
		}

		return (data || []) as MediaFile[];
	} catch (error) {
		console.error('Error searching media:', error);
		return [];
	}
}

/**
 * Create a new media file record
 */
export async function createMedia(dto: CreateMediaDTO): Promise<MediaFile> {
	try {
		const { data, error } = await supabase
			.from('media_files')
			.insert({
				...dto,
				usage_count: 0,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				throw new Error('Media files table does not exist. Please create the table in your database first.');
			}
			throw new Error(`Failed to create media: ${error.message}`);
		}

		return data as MediaFile;
	} catch (error) {
		console.error('Error creating media:', error);
		throw error;
	}
}

/**
 * Update a media file record
 */
export async function updateMedia(id: string, dto: UpdateMediaDTO): Promise<MediaFile> {
	try {
		const { data, error } = await supabase
			.from('media_files')
			.update({
				...dto,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				throw new Error('Media files table does not exist.');
			}
			throw new Error(`Failed to update media: ${error.message}`);
		}

		return data as MediaFile;
	} catch (error) {
		console.error('Error updating media:', error);
		throw error;
	}
}

/**
 * Delete a media file record
 */
export async function deleteMedia(id: string): Promise<void> {
	try {
		const { error } = await supabase.from('media_files').delete().eq('id', id);

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				throw new Error('Media files table does not exist.');
			}
			throw new Error(`Failed to delete media: ${error.message}`);
		}
	} catch (error) {
		console.error('Error deleting media:', error);
		throw error;
	}
}

/**
 * Get media statistics
 */
export async function getMediaStats(): Promise<{
	totalFiles: number;
	totalSize: number;
	byType: Record<string, number>;
	unusedCount: number;
}> {
	try {
		const { data, error } = await supabase.from('media_files').select('file_type, file_size, usage_count');

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
				return {
					totalFiles: 0,
					totalSize: 0,
					byType: {},
					unusedCount: 0
				};
			}
			throw new Error(`Failed to fetch media stats: ${error.message}`);
		}

		const files = (data || []) as MediaFile[];
		const totalFiles = files.length;
		const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
		const byType: Record<string, number> = {};
		let unusedCount = 0;

		files.forEach((file) => {
			byType[file.file_type] = (byType[file.file_type] || 0) + 1;
			if (file.usage_count === 0) {
				unusedCount++;
			}
		});

		return {
			totalFiles,
			totalSize,
			byType,
			unusedCount
		};
	} catch (error) {
		console.error('Error fetching media stats:', error);
		return {
			totalFiles: 0,
			totalSize: 0,
			byType: {},
			unusedCount: 0
		};
	}
}

/**
 * Track product media usage
 */
export async function trackProductMediaUsage(
	productId: string,
	mediaUrl: string,
	productName: string
): Promise<void> {
	try {
		// Find media file by URL
		const { data: mediaFiles } = await supabase
			.from('media_files')
			.select('id')
			.eq('file_url', mediaUrl)
			.limit(1);

		if (mediaFiles && mediaFiles.length > 0) {
			const mediaId = mediaFiles[0].id;

			// Track usage in media_usage table
			await supabase.from('media_usage').upsert({
				media_id: mediaId,
				entity_type: 'product',
				entity_id: productId,
				entity_name: productName
			});

			// Increment usage count
			await supabase.rpc('increment_media_usage', { media_id: mediaId }).catch(async () => {
				// If RPC doesn't exist, manually update
				const { data: currentMedia } = await supabase
					.from('media_files')
					.select('usage_count')
					.eq('id', mediaId)
					.single();

				if (currentMedia) {
					await supabase
						.from('media_files')
						.update({ usage_count: (currentMedia.usage_count || 0) + 1 })
						.eq('id', mediaId);
				}
			});
		}
	} catch (error) {
		console.error('Failed to track media usage:', error);
		// Non-critical, don't throw
	}
}

/**
 * Remove product media usage tracking
 */
export async function removeProductMediaUsage(mediaId: string, productId: string): Promise<void> {
	try {
		await supabase.from('media_usage').delete().eq('media_id', mediaId).eq('entity_id', productId).eq('entity_type', 'product');
	} catch (error) {
		console.error('Failed to remove media usage:', error);
		// Non-critical, don't throw
	}
}

