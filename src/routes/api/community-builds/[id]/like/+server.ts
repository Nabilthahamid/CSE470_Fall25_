// API: Like/Unlike a build
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ locals, params }) => {
	try {
		requireAuth(locals.user);

		const result = await communityBuildService.toggleLike(params.id, locals.user.id);

		return json(result);
	} catch (error: any) {
		console.error('Like build error:', error);
		return json({ error: error.message || 'Failed to like build' }, { status: 500 });
	}
};

