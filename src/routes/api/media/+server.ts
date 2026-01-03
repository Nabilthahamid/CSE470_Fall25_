// API: Media Library endpoint for fetching media files
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as media from '$lib/utils/media';
import { requireAdmin } from '$lib/utils/auth';
import { handleError } from '$lib/utils/errors';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		requireAdmin(locals.user);

		const search = url.searchParams.get('search')?.trim() || undefined;
		const type = url.searchParams.get('type') as 'image' | 'video' | 'document' | 'other' | undefined;

		let mediaFiles;
		if (search) {
			mediaFiles = await media.searchMedia(search);
		} else if (type) {
			mediaFiles = await media.getMediaByType(type);
		} else {
			// Default to images only for better performance
			mediaFiles = await media.getMediaByType('image');
		}

		return json({ media: mediaFiles || [], success: true });
	} catch (error) {
		const { message } = handleError(error);
		// Return empty array instead of error to prevent UI issues
		return json({ error: message, media: [] }, { status: 200 });
	}
};

