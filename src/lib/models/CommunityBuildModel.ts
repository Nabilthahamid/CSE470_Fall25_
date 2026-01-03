// MODEL: Community Build Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type {
	PCBuild,
	BuildLike,
	BuildComment,
	BuildRating,
	CommunityBuildFilters
} from './PCBuild';
import { PCBuildModel } from './PCBuildModel';

export class CommunityBuildModel {
	// BUSINESS LOGIC & DATA ACCESS: Get all public builds with filters (static method)
	static async getPublicBuilds(
		filters: CommunityBuildFilters = {},
		userId?: string
	): Promise<PCBuild[]> {
		// Query for all public builds
		let query = supabase
			.from('pc_builds')
			.select(`
				*,
				users!pc_builds_user_id_fkey(id, name, email)
			`)
			.or('is_public.eq.true,is_public.is.null');

		// Apply filters
		if (filters.use_case) {
			query = query.eq('use_case', filters.use_case);
		}

		if (filters.min_price !== undefined) {
			query = query.gte('total_price', filters.min_price);
		}

		if (filters.max_price !== undefined) {
			query = query.lte('total_price', filters.max_price);
		}

		if (filters.min_rating !== undefined) {
			query = query.gte('average_rating', filters.min_rating);
		}

		if (filters.search) {
			query = query.or(
				`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
			);
		}

		if (filters.featured) {
			query = query.eq('featured', true);
		}

		// Sort
		switch (filters.sort_by) {
			case 'popular':
				query = query.order('likes_count', { ascending: false });
				break;
			case 'rating':
				query = query.order('average_rating', { ascending: false });
				break;
			case 'price_low':
				query = query.order('total_price', { ascending: true });
				break;
			case 'price_high':
				query = query.order('total_price', { ascending: false });
				break;
			case 'recent':
			default:
				query = query.order('created_at', { ascending: false });
				break;
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching public builds:', error);
			throw new Error(`Failed to fetch public builds: ${error.message}`);
		}

		// Load components and user interaction data
		const builds = await Promise.all(
			(data || []).map(async (build) => {
				const fullBuildModel = await PCBuildModel.getById(build.id);
				if (!fullBuildModel) {
					return build as PCBuild;
				}
				const fullBuild = fullBuildModel.toJSON();
				
				let isLiked = false;
				let userRating: number | undefined;

				if (userId) {
					// Check if user liked this build
					const { data: likeData } = await supabase
						.from('build_likes')
						.select('id')
						.eq('build_id', build.id)
						.eq('user_id', userId)
						.single();

					isLiked = !!likeData;

					// Get user's rating
					const { data: ratingData } = await supabase
						.from('build_ratings')
						.select('rating')
						.eq('build_id', build.id)
						.eq('user_id', userId)
						.single();

					userRating = ratingData?.rating;
				}

				return {
					...fullBuild,
					...build,
					is_liked: isLiked,
					user_rating: userRating
				} as PCBuild;
			})
		);

		return builds;
	}

	// BUSINESS LOGIC & DATA ACCESS: Get build by ID (public or user's own) (static method)
	static async getBuildById(buildId: string, userId?: string): Promise<PCBuild | null> {
		const buildModel = await PCBuildModel.getById(buildId, userId);
		if (!buildModel) return null;

		const build = buildModel.toJSON();

		// Check if build is public or belongs to user
		if (!build.is_public && build.user_id !== userId) {
			return null;
		}

		// Increment views if public
		if (build.is_public) {
			try {
				await supabase.rpc('increment_build_views', { build_uuid: buildId });
			} catch (error) {
				console.warn('Failed to increment views (non-critical):', error);
			}
		}

		// Load user interaction data
		if (userId) {
			const [likeData, ratingData] = await Promise.all([
				supabase
					.from('build_likes')
					.select('id')
					.eq('build_id', buildId)
					.eq('user_id', userId)
					.single(),
				supabase
					.from('build_ratings')
					.select('rating')
					.eq('build_id', buildId)
					.eq('user_id', userId)
					.single()
			]);

			return {
				...build,
				is_liked: !!likeData.data,
				user_rating: ratingData.data?.rating
			};
		}

		return build;
	}

	// BUSINESS LOGIC & DATA ACCESS: Share build to community (static method)
	static async shareBuild(
		buildId: string,
		userId: string,
		options: {
			use_case?: string;
			tags?: string[];
			image_url?: string;
		} = {}
	): Promise<PCBuild> {
		const buildModel = await PCBuildModel.getById(buildId, userId);
		if (!buildModel) {
			throw new Error('Build not found or access denied');
		}

		// Update build to be public
		const updateData: any = {
			is_public: true
		};

		if (options.use_case) updateData.use_case = options.use_case;
		if (options.tags) updateData.tags = options.tags;
		if (options.image_url) updateData.image_url = options.image_url;

		const updated = await buildModel.update(userId, updateData);
		return updated.toJSON();
	}

	// BUSINESS LOGIC & DATA ACCESS: Toggle like (static method)
	static async toggleLike(buildId: string, userId: string): Promise<{ liked: boolean }> {
		// Check if already liked
		const { data: existingLike } = await supabase
			.from('build_likes')
			.select('id')
			.eq('build_id', buildId)
			.eq('user_id', userId)
			.single();

		if (existingLike) {
			// Unlike
			const { error } = await supabase
				.from('build_likes')
				.delete()
				.eq('build_id', buildId)
				.eq('user_id', userId);

			if (error) throw new Error(`Failed to unlike build: ${error.message}`);
			return { liked: false };
		} else {
			// Like
			const { error } = await supabase.from('build_likes').insert({
				build_id: buildId,
				user_id: userId
			});

			if (error) throw new Error(`Failed to like build: ${error.message}`);
			return { liked: true };
		}
	}

	// DATA ACCESS: Add comment (static method)
	static async addComment(
		buildId: string,
		userId: string,
		comment: string
	): Promise<BuildComment> {
		// BUSINESS LOGIC: Validate
		if (!comment || comment.trim().length === 0) {
			throw new Error('Comment cannot be empty');
		}

		// DATA ACCESS: Create comment
		const { data, error } = await supabase
			.from('build_comments')
			.insert({
				build_id: buildId,
				user_id: userId,
				comment: comment.trim()
			})
			.select(`
				*,
				users!build_comments_user_id_fkey(id, name, email)
			`)
			.single();

		if (error) throw new Error(`Failed to add comment: ${error.message}`);
		return data;
	}

	// DATA ACCESS: Get comments (static method)
	static async getComments(buildId: string): Promise<BuildComment[]> {
		const { data, error } = await supabase
			.from('build_comments')
			.select(`
				*,
				users!build_comments_user_id_fkey(id, name, email)
			`)
			.eq('build_id', buildId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
		return data || [];
	}

	// BUSINESS LOGIC & DATA ACCESS: Rate build (static method)
	static async rateBuild(
		buildId: string,
		userId: string,
		rating: number
	): Promise<BuildRating> {
		// BUSINESS LOGIC: Validate
		if (rating < 1 || rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}

		// Check if rating exists
		const { data: existingRating } = await supabase
			.from('build_ratings')
			.select('id')
			.eq('build_id', buildId)
			.eq('user_id', userId)
			.single();

		// DATA ACCESS: Create or update rating
		const { data, error } = existingRating
			? await supabase
					.from('build_ratings')
					.update({ rating })
					.eq('build_id', buildId)
					.eq('user_id', userId)
					.select()
					.single()
			: await supabase
					.from('build_ratings')
					.insert({
						build_id: buildId,
						user_id: userId,
						rating
					})
					.select()
					.single();

		if (error) throw new Error(`Failed to rate build: ${error.message}`);
		return data;
	}

	// BUSINESS LOGIC: Get featured builds (static method)
	static async getFeaturedBuilds(limit: number = 6): Promise<PCBuild[]> {
		const { data, error } = await supabase
			.from('pc_builds')
			.select(`
				*,
				users!pc_builds_user_id_fkey(id, name, email)
			`)
			.eq('featured', true)
			.eq('is_public', true)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw new Error(`Failed to fetch featured builds: ${error.message}`);

		const builds = await Promise.all(
			(data || []).map(async (build) => {
				const fullBuildModel = await PCBuildModel.getById(build.id);
				return fullBuildModel ? fullBuildModel.toJSON() : (build as PCBuild);
			})
		);

		return builds;
	}

	// BUSINESS LOGIC: Get popular builds (static method)
	static async getPopularBuilds(limit: number = 10): Promise<PCBuild[]> {
		const { data, error } = await supabase
			.from('pc_builds')
			.select(`
				*,
				users!pc_builds_user_id_fkey(id, name, email)
			`)
			.or('is_public.eq.true,is_public.is.null')
			.order('likes_count', { ascending: false })
			.limit(limit);

		if (error) throw new Error(`Failed to fetch popular builds: ${error.message}`);

		const builds = await Promise.all(
			(data || []).map(async (build) => {
				const fullBuildModel = await PCBuildModel.getById(build.id);
				return fullBuildModel ? fullBuildModel.toJSON() : (build as PCBuild);
			})
		);

		return builds;
	}
}

