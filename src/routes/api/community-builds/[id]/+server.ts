// API: Get specific community build
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CommunityBuildModel } from '$lib/models/CommunityBuildModel';

export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const userId = locals.user?.id;
		const build = await CommunityBuildModel.getBuildById(params.id, userId);

		if (!build) {
			return json({ error: 'Build not found' }, { status: 404 });
		}

		return json({ build });
	} catch (error: any) {
		console.error('Get build error:', error);
		return json({ error: error.message || 'Failed to fetch build' }, { status: 500 });
	}
};

