// API: Rate a build
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CommunityBuildModel } from '$lib/models/CommunityBuildModel';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	try {
		requireAuth(locals.user);

		const { rating } = await request.json();

		if (!rating || rating < 1 || rating > 5) {
			return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
		}

		const buildRating = await CommunityBuildModel.rateBuild(
			params.id,
			locals.user.id,
			rating
		);

		return json({ rating: buildRating, message: 'Rating submitted successfully!' });
	} catch (error: any) {
		console.error('Rate build error:', error);
		return json({ error: error.message || 'Failed to rate build' }, { status: 500 });
	}
};

