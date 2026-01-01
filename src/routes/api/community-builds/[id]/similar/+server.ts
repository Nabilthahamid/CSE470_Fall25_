// API: Get similar builds (AI-powered)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '5');
		const similarBuilds = await communityBuildService.findSimilarBuilds(params.id, limit);

		return json({ builds: similarBuilds, count: similarBuilds.length });
	} catch (error: any) {
		console.error('Similar builds error:', error);
		return json({ error: error.message || 'Failed to find similar builds' }, { status: 500 });
	}
};

