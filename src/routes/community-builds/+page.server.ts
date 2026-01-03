// CONTROLLER: Community Builds Gallery page
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CommunityBuildModel } from '$lib/models/CommunityBuildModel';
import type { CommunityBuildFilters } from '$lib/models/PCBuild';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
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
		if (sortBy) filters.sort_by = sortBy || 'recent';

		const search = url.searchParams.get('search');
		if (search) filters.search = search;

		const featured = url.searchParams.get('featured');
		if (featured === 'true') filters.featured = true;

		// Get builds
		const builds = await CommunityBuildModel.getPublicBuilds(filters, userId);
		
		console.log(`Community builds page: Loaded ${builds.length} public builds`);
		if (builds.length > 0) {
			console.log('Sample build IDs:', builds.slice(0, 5).map(b => b.id));
		}

		// Get featured builds for hero section
		const featuredBuilds = await CommunityBuildModel.getFeaturedBuilds(6);

		// Get popular builds
		const popularBuilds = await CommunityBuildModel.getPopularBuilds(10);

		return {
			builds,
			featuredBuilds,
			popularBuilds,
			filters,
			searchQuery: search || '',
			error: null
		};
	} catch (err) {
		const { message, statusCode } = handleError(err);
		throw error(statusCode, message);
	}
};

