// SERVICE: Review business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type {
	Review,
	CreateReviewDTO,
	UpdateReviewDTO,
	ReviewRepository,
	ReviewFilters
} from '$lib/models/Review';

class ReviewRepositoryImpl implements ReviewRepository {
	async getAll(filters?: ReviewFilters): Promise<Review[]> {
		let query = supabase
			.from('reviews')
			.select(
				`
				*,
				products(name),
				users(name)
			`
			)
			.order('created_at', { ascending: false });

		if (filters?.productId) {
			query = query.eq('product_id', filters.productId);
		}

		if (filters?.userId) {
			query = query.eq('user_id', filters.userId);
		}

		if (filters?.minRating) {
			query = query.gte('rating', filters.minRating);
		}

		const { data, error } = await query;

		if (error) {
			// If table doesn't exist, return empty array
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return [];
			}
			throw new Error(`Failed to fetch reviews: ${error.message}`);
		}

		return (data || []).map((review: any) => ({
			...review,
			product_name: review.products?.name,
			user_name: review.users?.name
		}));
	}

	async getById(id: string): Promise<Review | null> {
		const { data, error } = await supabase
			.from('reviews')
			.select(
				`
				*,
				products!inner(name),
				users!inner(name)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch review: ${error.message}`);
		}

		return {
			...data,
			product_name: data.products?.name,
			user_name: data.users?.name
		};
	}

	async getByProduct(productId: string): Promise<Review[]> {
		return this.getAll({ productId });
	}

	async getByUser(userId: string): Promise<Review[]> {
		return this.getAll({ userId });
	}

	async create(input: CreateReviewDTO, userId: string): Promise<Review> {
		// Check if user has purchased this product
		const { data: purchases, error: purchaseError } = await supabase
			.from('sales')
			.select('id')
			.eq('product_id', input.product_id)
			.eq('user_id', userId)
			.limit(1);

		if (purchaseError) {
			throw new Error(`Failed to check purchase status: ${purchaseError.message}`);
		}

		if (!purchases || purchases.length === 0) {
			throw new Error('You must purchase this product before you can review it');
		}

		// Check if user already reviewed this product
		const existing = await supabase
			.from('reviews')
			.select('id')
			.eq('product_id', input.product_id)
			.eq('user_id', userId)
			.maybeSingle();

		if (existing.data) {
			throw new Error('You have already reviewed this product');
		}

		const { data, error } = await supabase
			.from('reviews')
			.insert({
				product_id: input.product_id,
				user_id: userId,
				rating: input.rating,
				comment: input.comment || null
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create review: ${error.message}`);
		return data;
	}

	async update(id: string, userId: string, input: UpdateReviewDTO): Promise<Review> {
		const { data, error } = await supabase
			.from('reviews')
			.update({
				...input,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				throw new Error('Review not found or you do not have permission to update it');
			}
			throw new Error(`Failed to update review: ${error.message}`);
		}

		return data;
	}

	async delete(id: string, userId: string): Promise<void> {
		const { error } = await supabase
			.from('reviews')
			.delete()
			.eq('id', id)
			.eq('user_id', userId);

		if (error) throw new Error(`Failed to delete review: ${error.message}`);
	}

	async getProductAverageRating(productId: string): Promise<number> {
		const { data, error } = await supabase
			.from('reviews')
			.select('rating')
			.eq('product_id', productId);

		if (error) {
			// If table doesn't exist, return 0
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return 0;
			}
			throw new Error(`Failed to fetch rating: ${error.message}`);
		}
		if (!data || data.length === 0) return 0;

		const sum = data.reduce((acc, review) => acc + review.rating, 0);
		return sum / data.length;
	}
}

// SERVICE: Business logic layer
export class ReviewService {
	private repository: ReviewRepository;

	constructor(repository?: ReviewRepository) {
		this.repository = repository || new ReviewRepositoryImpl();
	}

	async getAllReviews(filters?: ReviewFilters): Promise<Review[]> {
		return await this.repository.getAll(filters);
	}

	async getReviewById(id: string): Promise<Review> {
		if (!id) throw new Error('Review ID is required');
		const review = await this.repository.getById(id);
		if (!review) throw new Error('Review not found');
		return review;
	}

	async getReviewsByProduct(productId: string): Promise<Review[]> {
		return await this.repository.getByProduct(productId);
	}

	async getReviewsByUser(userId: string): Promise<Review[]> {
		return await this.repository.getByUser(userId);
	}

	async createReview(input: CreateReviewDTO, userId: string): Promise<Review> {
		if (!input.product_id) throw new Error('Product ID is required');
		if (!input.rating || input.rating < 1 || input.rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}

		return await this.repository.create(input, userId);
	}

	async updateReview(id: string, userId: string, input: UpdateReviewDTO): Promise<Review> {
		if (!id) throw new Error('Review ID is required');

		if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
			throw new Error('Rating must be between 1 and 5');
		}

		return await this.repository.update(id, userId, input);
	}

	async deleteReview(id: string, userId: string): Promise<void> {
		if (!id) throw new Error('Review ID is required');
		await this.repository.delete(id, userId);
	}

	async getProductAverageRating(productId: string): Promise<number> {
		return await this.repository.getProductAverageRating(productId);
	}
}

// Export singleton instance
export const reviewService = new ReviewService();

