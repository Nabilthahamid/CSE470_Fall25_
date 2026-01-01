// API: Community Builds - Get public builds with filters
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { communityBuildService } from '$lib/services/CommunityBuildService';
import type { CommunityBuildFilters } from '$lib/models/PCBuild';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const userId = locals.user?.id;

		// Parse filters from query params
		const filters: CommunityBuildFilters = {};

		const useCase = url.searchParams.get('use_case');
		if (useCase) filters.use_case = useCase;

		const minPrice = url.searchParams.get('min_price');
		if (minPrice) filters.min_price = parseFloat(minPrice);

		const maxPrice = url.searchParams.get('max_price');
		if (maxPrice) filters.max_price = parseFloat(maxPrice);

		const minRating = url.searchParams.get('min_rating');
		if (minRating) filters.min_rating = parseFloat(minRating);

		const sortBy = url.searchParams.get('sort_by') as any;
		if (sortBy) filters.sort_by = sortBy;

		const search = url.searchParams.get('search');
		if (search) filters.search = search;

		const featured = url.searchParams.get('featured');
		if (featured === 'true') filters.featured = true;

		const tags = url.searchParams.get('tags');
		if (tags) filters.tags = tags.split(',');

		const builds = await communityBuildService.getPublicBuilds(filters, userId);

		return json({ builds, count: builds.length });
	} catch (error: any) {
		console.error('Community builds error:', error);
		return json({ error: error.message || 'Failed to fetch builds' }, { status: 500 });
	}
};

