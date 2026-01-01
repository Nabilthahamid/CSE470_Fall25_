// API: Add comment to build
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	try {
		requireAuth(locals.user);

		const { comment } = await request.json();

		if (!comment || comment.trim().length === 0) {
			return json({ error: 'Comment is required' }, { status: 400 });
		}

		const newComment = await communityBuildService.addComment(
			params.id,
			locals.user.id,
			comment
		);

		return json({ comment: newComment, message: 'Comment added successfully!' });
	} catch (error: any) {
		console.error('Add comment error:', error);
		return json({ error: error.message || 'Failed to add comment' }, { status: 500 });
	}
};

