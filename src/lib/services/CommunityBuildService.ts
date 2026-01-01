// SERVICE: Community Build business logic with AI matching
import { supabase } from '$lib/config/supabase';
import type {
	PCBuild,
	BuildLike,
	BuildComment,
	BuildRating,
	CommunityBuildFilters
} from '$lib/models/PCBuild';
import { pcBuildService } from './PCBuildService';
import { EnhancedAIService } from './EnhancedAIService';
import { productService } from './ProductService';

export class CommunityBuildService {
	private aiService: EnhancedAIService;

	constructor() {
		this.aiService = new EnhancedAIService();
	}

	// Get all public builds with filters
	async getPublicBuilds(
		filters: CommunityBuildFilters = {},
		userId?: string
	): Promise<PCBuild[]> {
		// Query for all public builds (is_public = true or NULL, since all builds are public by default)
		let query = supabase
			.from('pc_builds')
			.select(`
				*,
				users!pc_builds_user_id_fkey(id, name, email)
			`)
			.or('is_public.eq.true,is_public.is.null'); // Include true or null (null means public by default)

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

		console.log(`Found ${data?.length || 0} public builds`);

		// Load components and user interaction data
		const builds = await Promise.all(
			(data || []).map(async (build) => {
				const fullBuild = await pcBuildService.getBuildById(build.id);
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
				};
			})
		);

		return builds;
	}

	// Get build by ID (public or user's own)
	async getBuildById(buildId: string, userId?: string): Promise<PCBuild | null> {
		const build = await pcBuildService.getBuildById(buildId, userId);

		if (!build) return null;

		// Check if build is public or belongs to user
		if (!build.is_public && build.user_id !== userId) {
			return null;
		}

		// Increment views if public
		if (build.is_public) {
			await supabase.rpc('increment_build_views', { build_uuid: buildId });
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

	// Share build to community (make it public)
	async shareBuild(
		buildId: string,
		userId: string,
		options: {
			use_case?: string;
			tags?: string[];
			image_url?: string;
		} = {}
	): Promise<PCBuild> {
		const build = await pcBuildService.getBuildById(buildId, userId);

		if (!build) {
			throw new Error('Build not found or access denied');
		}

		// Update build to be public
		const updateData: any = {
			is_public: true
		};

		if (options.use_case) updateData.use_case = options.use_case;
		if (options.tags) updateData.tags = options.tags;
		if (options.image_url) updateData.image_url = options.image_url;

		return await pcBuildService.updateBuild(buildId, userId, updateData);
	}

	// Like/Unlike a build
	async toggleLike(buildId: string, userId: string): Promise<{ liked: boolean }> {
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

	// Add comment to build
	async addComment(
		buildId: string,
		userId: string,
		comment: string
	): Promise<BuildComment> {
		if (!comment || comment.trim().length === 0) {
			throw new Error('Comment cannot be empty');
		}

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

	// Get comments for a build
	async getComments(buildId: string): Promise<BuildComment[]> {
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

	// Rate a build
	async rateBuild(
		buildId: string,
		userId: string,
		rating: number
	): Promise<BuildRating> {
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

		const { data, error } = existingRating
			? await supabase
					.from('build_ratings')
					.update({ rating })
					.eq('build_id', buildId)
					.eq('user_id', userId)
					.select(`
						*,
						users!build_ratings_user_id_fkey(id, name)
					`)
					.single()
			: await supabase
					.from('build_ratings')
					.insert({
						build_id: buildId,
						user_id: userId,
						rating
					})
					.select(`
						*,
						users!build_ratings_user_id_fkey(id, name)
					`)
					.single();

		if (error) throw new Error(`Failed to rate build: ${error.message}`);
		return data;
	}

	// AI: Find similar builds
	async findSimilarBuilds(
		buildId: string,
		limit: number = 5
	): Promise<PCBuild[]> {
		const build = await pcBuildService.getBuildById(buildId);

		if (!build || !build.components) {
			return [];
		}

		// Get all public builds
		const allBuilds = await this.getPublicBuilds({}, undefined);

		// Extract product IDs from current build
		const currentProductIds = build.components.map((c) => c.product_id);

		// Calculate similarity scores
		const buildsWithScores = await Promise.all(
			allBuilds
				.filter((b) => b.id !== buildId && b.components && b.components.length > 0)
				.map(async (otherBuild) => {
					const otherProductIds = otherBuild.components!.map((c) => c.product_id);

					// Calculate Jaccard similarity (intersection over union)
					const intersection = currentProductIds.filter((id) =>
						otherProductIds.includes(id)
					).length;
					const union = new Set([...currentProductIds, ...otherProductIds]).size;
					const jaccardSimilarity = intersection / union;

					// Calculate price similarity (closer prices = higher score)
					const priceDiff = Math.abs(build.total_price - otherBuild.total_price);
					const maxPrice = Math.max(build.total_price, otherBuild.total_price);
					const priceSimilarity = maxPrice > 0 ? 1 - priceDiff / maxPrice : 0;

					// Use case similarity
					const useCaseSimilarity =
						build.use_case && otherBuild.use_case && build.use_case === otherBuild.use_case
							? 1
							: 0;

					// Combined similarity score
					const totalScore =
						jaccardSimilarity * 0.5 + priceSimilarity * 0.3 + useCaseSimilarity * 0.2;

					return {
						build: otherBuild,
						score: totalScore
					};
				})
		);

		// Sort by score and return top N
		return buildsWithScores
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map((item) => item.build);
	}

	// AI: Find builds for use case
	async findBuildsForUseCase(
		useCase: string,
		budget?: number,
		limit: number = 10
	): Promise<PCBuild[]> {
		const filters: CommunityBuildFilters = {
			use_case: useCase,
			sort_by: 'rating'
		};

		if (budget) {
			filters.max_price = budget;
		}

		const builds = await this.getPublicBuilds(filters);

		// If budget specified, prioritize builds closer to budget
		if (budget) {
			return builds
				.map((build) => ({
					build,
					score: 1 - Math.abs(build.total_price - budget) / budget
				}))
				.sort((a, b) => b.score - a.score)
				.slice(0, limit)
				.map((item) => item.build);
		}

		return builds.slice(0, limit);
	}

	// AI: Create variation of a build (remix)
	async createBuildVariation(
		buildId: string,
		options: {
			budget?: number;
			use_case?: string;
			preferences?: string[];
		}
	): Promise<PCBuild | null> {
		const originalBuild = await pcBuildService.getBuildById(buildId);

		if (!originalBuild || !originalBuild.components) {
			return null;
		}

		// This would use AI to suggest alternative components
		// For now, return similar builds that match the criteria
		const similarBuilds = await this.findSimilarBuilds(buildId, 5);

		if (options.budget) {
			return similarBuilds.find((b) => b.total_price <= options.budget!) || similarBuilds[0];
		}

		return similarBuilds[0] || null;
	}

	// Get featured builds
	async getFeaturedBuilds(limit: number = 6): Promise<PCBuild[]> {
		return await this.getPublicBuilds(
			{
				featured: true,
				sort_by: 'rating'
			},
			undefined
		);
	}

	// Get popular builds
	async getPopularBuilds(limit: number = 10): Promise<PCBuild[]> {
		return await this.getPublicBuilds(
			{
				sort_by: 'popular'
			},
			undefined
		);
	}
}

export const communityBuildService = new CommunityBuildService();

