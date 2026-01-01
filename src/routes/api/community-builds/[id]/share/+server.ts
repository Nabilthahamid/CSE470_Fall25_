// API: Share build to community
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	try {
		requireAuth(locals.user);

		const { use_case, tags, image_url } = await request.json();

		const build = await communityBuildService.shareBuild(params.id, locals.user.id, {
			use_case,
			tags,
			image_url
		});

		return json({ build, message: 'Build shared to community successfully!' });
	} catch (error: any) {
		console.error('Share build error:', error);
		return json({ error: error.message || 'Failed to share build' }, { status: 500 });
	}
};

