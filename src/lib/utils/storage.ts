// UTILS: File storage utilities for Supabase Storage
import { supabase } from '$lib/config/supabase';
import { mediaService } from '$lib/services/MediaService';

/**
 * Upload image file to Supabase Storage and optionally create media library record
 * @param file - File object to upload
 * @param bucket - Storage bucket name (default: 'product-images')
 * @param addToLibrary - Whether to add to media library (default: true)
 * @param folder - Folder name in media library (default: 'products')
 * @returns Public URL of uploaded file
 */
export async function uploadImage(
	file: File,
	bucket: string = 'product-images',
	addToLibrary: boolean = true,
	folder: string = 'products'
): Promise<string> {
	// Validate file type
	const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
	if (!allowedTypes.includes(file.type)) {
		throw new Error('Only PNG and JPG images are allowed');
	}

	// Validate file extension
	const fileName = file.name.toLowerCase();
	if (!fileName.endsWith('.png') && !fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
		throw new Error('File must be .png or .jpg format');
	}

	// Validate file size (5MB max)
	const maxSize = 5 * 1024 * 1024; // 5MB in bytes
	if (file.size > maxSize) {
		throw new Error('File size must be less than 5MB');
	}

	// Generate unique filename
	const fileExt = fileName.split('.').pop();
	const fileNameUnique = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
	const filePath = `${folder}/${fileNameUnique}`;

	// Upload file to Supabase Storage
	const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
		cacheControl: '3600',
		upsert: false
	});

	if (error) {
		throw new Error(`Failed to upload image: ${error.message}`);
	}

	// Get public URL
	const {
		data: { publicUrl }
	} = supabase.storage.from(bucket).getPublicUrl(filePath);

	// Add to media library if requested
	if (addToLibrary) {
		try {
			// Get image dimensions if possible
			let width: number | undefined;
			let height: number | undefined;
			
			try {
				const img = new Image();
				img.src = publicUrl;
				await new Promise((resolve, reject) => {
					img.onload = () => {
						width = img.naturalWidth;
						height = img.naturalHeight;
						resolve(null);
					};
					img.onerror = reject;
					setTimeout(reject, 5000); // Timeout after 5 seconds
				});
			} catch (e) {
				// Ignore dimension errors
			}

			await mediaService.createMedia({
				filename: fileNameUnique,
				original_filename: file.name,
				file_url: publicUrl,
				file_type: 'image',
				file_size: file.size,
				mime_type: file.type,
				width,
				height,
				folder
			});
		} catch (mediaError) {
			// Don't fail the upload if media library creation fails
			console.warn('Failed to add image to media library:', mediaError);
		}
	}

	return publicUrl;
}

/**
 * Delete image from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 * @param bucket - Storage bucket name (default: 'product-images')
 */
export async function deleteImage(
	imageUrl: string,
	bucket: string = 'product-images'
): Promise<void> {
	try {
		// Extract file path from URL
		const urlParts = imageUrl.split('/');
		const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

		// Delete file
		const { error } = await supabase.storage.from(bucket).remove([filePath]);

		if (error) {
			console.error('Failed to delete image:', error);
			// Don't throw - deletion failure shouldn't break the flow
		}
	} catch (error) {
		console.error('Error deleting image:', error);
		// Don't throw - deletion failure shouldn't break the flow
	}
}

