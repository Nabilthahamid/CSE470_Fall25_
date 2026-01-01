// API: Get popular builds
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const builds = await communityBuildService.getPopularBuilds(limit);

		return json({ builds, count: builds.length });
	} catch (error: any) {
		console.error('Popular builds error:', error);
		return json({ error: error.message || 'Failed to fetch popular builds' }, { status: 500 });
	}
};

