// API: Media Library endpoint for fetching media files
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mediaService } from '$lib/services/MediaService';
import { requireAdmin } from '$lib/utils/auth';
import { handleError } from '$lib/utils/errors';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		requireAdmin(locals.user);

		const search = url.searchParams.get('search')?.trim() || undefined;
		const type = url.searchParams.get('type') as 'image' | 'video' | 'document' | 'other' | undefined;

		let media;
		if (search) {
			media = await mediaService.searchMedia(search);
		} else if (type) {
			media = await mediaService.getMediaByType(type);
		} else {
			// Default to images only for better performance
			media = await mediaService.getMediaByType('image');
		}

		return json({ media: media || [], success: true });
	} catch (error) {
		const { message } = handleError(error);
		// Return empty array instead of error to prevent UI issues
		return json({ error: message, media: [] }, { status: 200 });
	}
};

