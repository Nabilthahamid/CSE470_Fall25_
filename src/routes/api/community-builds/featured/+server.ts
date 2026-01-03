// API: Get featured builds
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CommunityBuildModel } from '$lib/models/CommunityBuildModel';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '6');
		const builds = await CommunityBuildModel.getFeaturedBuilds(limit);

		return json({ builds, count: builds.length });
	} catch (error: any) {
		console.error('Featured builds error:', error);
		return json({ error: error.message || 'Failed to fetch featured builds' }, { status: 500 });
	}
};

