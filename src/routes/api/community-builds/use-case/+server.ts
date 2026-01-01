// API: Find builds for specific use case
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const useCase = url.searchParams.get('use_case');
		const budget = url.searchParams.get('budget');
		const limit = parseInt(url.searchParams.get('limit') || '10');

		if (!useCase) {
			return json({ error: 'use_case parameter is required' }, { status: 400 });
		}

		const builds = await communityBuildService.findBuildsForUseCase(
			useCase,
			budget ? parseFloat(budget) : undefined,
			limit
		);

		return json({ builds, count: builds.length });
	} catch (error: any) {
		console.error('Use case builds error:', error);
		return json({ error: error.message || 'Failed to find builds' }, { status: 500 });
	}
};

