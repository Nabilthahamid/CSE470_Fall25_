// MODEL: Review Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type { Review, CreateReviewDTO, UpdateReviewDTO, ReviewFilters } from './Review';
import { SaleModel } from './SaleModel';

export class ReviewModel {
	// Data properties
	id: string;
	product_id: string;
	user_id: string;
	rating: number;
	comment?: string | null;
	created_at?: string;
	updated_at?: string;
	product_name?: string;
	user_name?: string;

	constructor(data: Review) {
		this.id = data.id;
		this.product_id = data.product_id;
		this.user_id = data.user_id;
		this.rating = data.rating;
		this.comment = data.comment ?? null;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
		this.product_name = data.product_name;
		this.user_name = data.user_name;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.product_id) throw new Error('Product ID is required');
		if (!this.user_id) throw new Error('User ID is required');
		if (!this.rating || this.rating < 1 || this.rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}
	}

	// DATA ACCESS: Get all reviews (static method)
	static async getAll(filters?: ReviewFilters): Promise<ReviewModel[]> {
		try {
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
				if (error.code === '42P01' || error.message.includes('does not exist')) {
					return [];
				}
				throw new Error(`Failed to fetch reviews: ${error.message}`);
			}

			return (data || []).map(
				(review: any) =>
					new ReviewModel({
						...review,
						product_name: review.products?.name,
						user_name: review.users?.name
					})
			);
		} catch (error) {
			return [];
		}
	}

	// DATA ACCESS: Get review by ID (static method)
	static async getById(id: string): Promise<ReviewModel | null> {
		if (!id) throw new Error('Review ID is required');

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

		return new ReviewModel({
			...data,
			product_name: (data as any).products?.name,
			user_name: (data as any).users?.name
		});
	}

	// DATA ACCESS: Get reviews by product (static method)
	static async getByProduct(productId: string): Promise<ReviewModel[]> {
		if (!productId) throw new Error('Product ID is required');
		return this.getAll({ productId });
	}

	// DATA ACCESS: Get reviews by user (static method)
	static async getByUser(userId: string): Promise<ReviewModel[]> {
		if (!userId) throw new Error('User ID is required');
		return this.getAll({ userId });
	}

	// DATA ACCESS: Create review (static method)
	static async create(input: CreateReviewDTO, userId: string): Promise<ReviewModel> {
		// BUSINESS LOGIC: Validate rating
		if (!input.rating || input.rating < 1 || input.rating > 5) {
			throw new Error('Rating must be between 1 and 5');
		}

		// BUSINESS LOGIC: Check if user has purchased this product
		const userSales = await SaleModel.getAll({ userId, productId: input.product_id }, true);
		if (userSales.length === 0) {
			throw new Error('You must purchase this product before you can review it');
		}

		// BUSINESS LOGIC: Check if user already reviewed this product
		const existing = await supabase
			.from('reviews')
			.select('id')
			.eq('product_id', input.product_id)
			.eq('user_id', userId)
			.maybeSingle();

		if (existing.error && existing.error.code !== 'PGRST116') {
			throw new Error(`Failed to check existing review: ${existing.error.message}`);
		}

		if (existing.data) {
			throw new Error('You have already reviewed this product');
		}

		// DATA ACCESS: Create review
		const { data, error } = await supabase
			.from('reviews')
			.insert({
				product_id: input.product_id,
				user_id: userId,
				rating: input.rating,
				comment: input.comment || null,
				created_at: new Date().toISOString()
			})
			.select(
				`
				*,
				products(name),
				users(name)
			`
			)
			.single();

		if (error) throw new Error(`Failed to create review: ${error.message}`);

		return new ReviewModel({
			...data,
			product_name: (data as any).products?.name,
			user_name: (data as any).users?.name
		});
	}

	// DATA ACCESS: Update review (instance method)
	async update(input: UpdateReviewDTO, userId: string): Promise<ReviewModel> {
		// BUSINESS LOGIC: Verify ownership
		if (this.user_id !== userId) {
			throw new Error('You can only update your own reviews');
		}

		// BUSINESS LOGIC: Validate rating if provided
		if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
			throw new Error('Rating must be between 1 and 5');
		}

		// DATA ACCESS: Update review
		const { data, error } = await supabase
			.from('reviews')
			.update({
				...input,
				updated_at: new Date().toISOString()
			})
			.eq('id', this.id)
			.eq('user_id', userId)
			.select(
				`
				*,
				products(name),
				users(name)
			`
			)
			.single();

		if (error) throw new Error(`Failed to update review: ${error.message}`);

		// Update instance properties
		if (input.rating !== undefined) this.rating = input.rating;
		if (input.comment !== undefined) this.comment = input.comment;

		return new ReviewModel({
			...data,
			product_name: (data as any).products?.name,
			user_name: (data as any).users?.name
		});
	}

	// DATA ACCESS: Delete review (instance method)
	async delete(userId: string): Promise<void> {
		// BUSINESS LOGIC: Verify ownership
		if (this.user_id !== userId) {
			throw new Error('You can only delete your own reviews');
		}

		const { error } = await supabase.from('reviews').delete().eq('id', this.id).eq('user_id', userId);

		if (error) throw new Error(`Failed to delete review: ${error.message}`);
	}

	// BUSINESS LOGIC: Get product average rating (static method)
	static async getProductAverageRating(productId: string): Promise<number> {
		if (!productId) throw new Error('Product ID is required');

		const { data, error } = await supabase
			.from('reviews')
			.select('rating')
			.eq('product_id', productId);

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return 0;
			}
			throw new Error(`Failed to fetch rating: ${error.message}`);
		}

		if (!data || data.length === 0) return 0;

		const sum = data.reduce((acc, review) => acc + review.rating, 0);
		return sum / data.length;
	}

	// Convert to plain object (for compatibility)
	toJSON(): Review {
		return {
			id: this.id,
			product_id: this.product_id,
			user_id: this.user_id,
			rating: this.rating,
			comment: this.comment,
			created_at: this.created_at,
			updated_at: this.updated_at,
			product_name: this.product_name,
			user_name: this.user_name
		};
	}
}

