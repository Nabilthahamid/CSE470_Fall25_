// CONTROLLER: Individual Community Build Detail page
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CommunityBuildModel } from '$lib/models/CommunityBuildModel';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const buildId = params.id;
		const userId = locals.user?.id;

		// Get the build
		const build = await CommunityBuildModel.getBuildById(buildId, userId);

		if (!build) {
			throw error(404, 'Build not found');
		}

		// Check if build is public (unless user is the owner)
		if (!build.is_public && build.user_id !== userId) {
			throw error(404, 'Build not found');
		}

		// Get comments for this build
		let comments = [];
		try {
			comments = await CommunityBuildModel.getComments(buildId);
		} catch (err) {
			console.error('Error loading comments:', err);
			// Continue without comments
		}

		// Get similar builds - TODO: Implement in CommunityBuildModel if needed
		let similarBuilds: any[] = [];
		// try {
		// 	similarBuilds = await CommunityBuildModel.findSimilarBuilds(buildId, 4);
		// } catch (err) {
		// 	console.error('Error loading similar builds:', err);
		// }

		// Note: View count is incremented in getBuildById

		return {
			build,
			comments,
			similarBuilds,
			currentUserId: userId
		};
	} catch (err) {
		const { message, statusCode } = handleError(err);
		if (statusCode === 404) {
			throw error(404, message);
		}
		throw error(statusCode || 500, message);
	}
};

