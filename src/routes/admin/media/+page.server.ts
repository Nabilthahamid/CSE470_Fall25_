// CONTROLLER: Media Library Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { mediaService } from '$lib/services/MediaService';
import { uploadImage, deleteImage } from '$lib/utils/storage';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const folder = url.searchParams.get('folder') || undefined;
		const search = url.searchParams.get('search') || undefined;
		const type = url.searchParams.get('type') as 'image' | 'video' | 'document' | 'other' | undefined;

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
			folder: undefined,
			search: undefined,
			type: undefined,
			error: message
		};
	}
};

export const actions: Actions = {
	upload: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const folder = formData.get('folder')?.toString() || 'general';
		const altText = formData.get('alt_text')?.toString() || '';
		const description = formData.get('description')?.toString() || '';

		if (!file || file.size === 0) {
			return { error: 'No file provided' };
		}

		try {
			// Upload to storage
			const fileUrl = await uploadImage(file, 'product-images');

			// Determine file type
			const mimeType = file.type;
			let fileType: 'image' | 'video' | 'document' | 'other' = 'other';
			if (mimeType.startsWith('image/')) fileType = 'image';
			else if (mimeType.startsWith('video/')) fileType = 'video';
			else if (mimeType.includes('pdf') || mimeType.includes('document')) fileType = 'document';

			// Get image dimensions if it's an image
			let width: number | undefined;
			let height: number | undefined;
			if (fileType === 'image') {
				// Note: In a real implementation, you'd need to read the image to get dimensions
				// For now, we'll leave them undefined
			}

			// Create media record
			await mediaService.createMedia({
				filename: file.name,
				original_filename: file.name,
				file_url: fileUrl,
				file_type: fileType,
				file_size: file.size,
				mime_type: mimeType,
				width,
				height,
				alt_text: altText || undefined,
				description: description || undefined,
				folder: folder || undefined
			});

			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const updateData: any = {};

		if (formData.get('alt_text')) updateData.alt_text = formData.get('alt_text')?.toString();
		if (formData.get('description')) updateData.description = formData.get('description')?.toString();
		if (formData.get('folder')) updateData.folder = formData.get('folder')?.toString();

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
		const id = formData.get('id')?.toString() || '';
		const fileUrl = formData.get('file_url')?.toString() || '';

		try {
			// Delete from storage
			if (fileUrl) {
				await deleteImage(fileUrl, 'product-images');
			}

			// Delete from database
			await mediaService.deleteMedia(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

