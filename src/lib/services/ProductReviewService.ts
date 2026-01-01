// SERVICE: Product Reviews Management
import { supabase } from '$lib/config/supabase';
import type {
	ProductReview,
	CreateProductReviewDTO,
	UpdateProductReviewDTO
} from '$lib/models/ProductReview';

export class ProductReviewService {
	/**
	 * Get all reviews for a product
	 */
	async getReviewsByProduct(productId: string, filters?: {
		is_approved?: boolean;
		is_featured?: boolean;
	}): Promise<ProductReview[]> {
		try {
			let query = supabase
				.from('product_reviews')
				.select('*')
				.eq('product_id', productId)
				.order('created_at', { ascending: false });

			if (filters?.is_approved !== undefined) {
				query = query.eq('is_approved', filters.is_approved);
			}
			if (filters?.is_featured !== undefined) {
				query = query.eq('is_featured', filters.is_featured);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch reviews: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get all reviews (admin)
	 */
	async getAllReviews(filters?: {
		productId?: string;
		is_approved?: boolean;
	}): Promise<ProductReview[]> {
		try {
			let query = supabase
				.from('product_reviews')
				.select('*')
				.order('created_at', { ascending: false });

			if (filters?.productId) {
				query = query.eq('product_id', filters.productId);
			}
			if (filters?.is_approved !== undefined) {
				query = query.eq('is_approved', filters.is_approved);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch reviews: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get review by ID
	 */
	async getReviewById(id: string): Promise<ProductReview | null> {
		const { data, error } = await supabase
			.from('product_reviews')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch review: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create review
	 */
	async createReview(review: CreateProductReviewDTO): Promise<ProductReview> {
		const { data, error } = await supabase
			.from('product_reviews')
			.insert({
				...review,
				is_approved: false,
				is_featured: false,
				helpful_count: 0,
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create review: ${error.message}`);
		return data;
	}

	/**
	 * Update review
	 */
	async updateReview(id: string, review: UpdateProductReviewDTO): Promise<ProductReview> {
		const { data, error } = await supabase
			.from('product_reviews')
			.update({ ...review, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update review: ${error.message}`);
		return data;
	}

	/**
	 * Approve review
	 */
	async approveReview(id: string): Promise<ProductReview> {
		return this.updateReview(id, { is_approved: true });
	}

	/**
	 * Reject review
	 */
	async rejectReview(id: string): Promise<ProductReview> {
		return this.updateReview(id, { is_approved: false });
	}

	/**
	 * Feature review
	 */
	async featureReview(id: string): Promise<ProductReview> {
		return this.updateReview(id, { is_featured: true });
	}

	/**
	 * Unfeature review
	 */
	async unfeatureReview(id: string): Promise<ProductReview> {
		return this.updateReview(id, { is_featured: false });
	}

	/**
	 * Delete review
	 */
	async deleteReview(id: string): Promise<void> {
		const { error } = await supabase.from('product_reviews').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete review: ${error.message}`);
	}

	/**
	 * Get review statistics for a product
	 */
	async getReviewStats(productId: string): Promise<{
		averageRating: number;
		totalReviews: number;
		ratingDistribution: Record<number, number>;
	}> {
		const reviews = await this.getReviewsByProduct(productId, { is_approved: true });

		const totalReviews = reviews.length;
		const averageRating =
			totalReviews > 0
				? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
				: 0;

		const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		reviews.forEach((r) => {
			ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
		});

		return {
			averageRating,
			totalReviews,
			ratingDistribution
		};
	}
}

export const productReviewService = new ProductReviewService();

