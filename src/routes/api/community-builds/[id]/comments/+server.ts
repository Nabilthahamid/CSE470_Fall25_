// API: Get comments for a build
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const comments = await communityBuildService.getComments(params.id);

		return json({ comments, count: comments.length });
	} catch (error: any) {
		console.error('Get comments error:', error);
		return json({ error: error.message || 'Failed to fetch comments' }, { status: 500 });
	}
};

