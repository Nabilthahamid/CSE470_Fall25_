// CONTROLLER: Product detail controller (Pure MVC)
import { BaseController } from '../BaseController';
import { ProductModel } from '$lib/models/ProductModel';
import { ReviewModel } from '$lib/models/ReviewModel';
import { SaleModel } from '$lib/models/SaleModel';
import { moderateReview } from '$lib/utils/ai';

export class ProductDetailController extends BaseController {
	/**
	 * Load product details with reviews
	 */
	async loadProductDetails(productId: string) {
		try {
			const product = await ProductModel.getById(productId);
			if (!product) {
				return {
					product: null,
					reviews: [],
					averageRating: 0,
					canReview: false,
					userReview: null,
					relatedProducts: [],
					user: this.getUser() || null,
					error: 'Product not found'
				};
			}
			
			// Try to get reviews, but handle gracefully if table doesn't exist
			let reviews = [];
			let averageRating = 0;
			try {
				const reviewModels = await ReviewModel.getByProduct(productId);
				reviews = reviewModels.map((r) => r.toJSON());
				averageRating = await ReviewModel.getProductAverageRating(productId);
			} catch (reviewError) {
				console.error('Error loading reviews:', reviewError);
			}

			// Check if user has purchased this product (can give review)
			let canReview = false;
			const userId = this.getUser()?.id;
			if (userId) {
				try {
					const userSales = await SaleModel.getAll({
						userId,
						productId
					}, true);
					canReview = userSales.length > 0;
				} catch (saleError) {
					console.error('Error checking sales:', saleError);
				}
			}

			// Check if user already reviewed
			let userReview = null;
			if (userId) {
				try {
					const userReviewModels = await ReviewModel.getAll({
						userId,
						productId
					});
					userReview = userReviewModels.length > 0 ? userReviewModels[0].toJSON() : null;
				} catch (reviewError) {
					console.error('Error loading user review:', reviewError);
				}
			}

			// Get related products (other products excluding current one)
			let relatedProducts = [];
			try {
				const allProducts = await ProductModel.getAll();
				relatedProducts = allProducts
					.filter((p) => p.id !== productId && p.isInStock())
					.slice(0, 4)
					.map(p => p.toJSON());
			} catch (err) {
				console.error('Error loading related products:', err);
			}

			return {
				product: product.toJSON(),
				reviews,
				averageRating,
				canReview,
				userReview,
				relatedProducts,
				user: this.getUser() || null,
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				product: null,
				reviews: [],
				averageRating: 0,
				canReview: false,
				userReview: null,
				relatedProducts: [],
				user: this.getUser() || null,
				error: message
			};
		}
	}

	/**
	 * Create review
	 */
	async createReview(productId: string) {
		const userId = this.getUser()?.id;
		if (!userId) {
			return { error: 'You must be logged in to review' };
		}

		const formData = await this.getFormData();
		const rating = parseInt(formData.get('rating')?.toString() || '0');
		const comment = formData.get('comment')?.toString() || '';

		try {
			// Check if user has purchased this product
			const userSales = await SaleModel.getAll({
				userId,
				productId
			}, true);

			if (userSales.length === 0) {
				return { error: 'You must purchase this product before you can review it' };
			}

			// Check if user already reviewed
			const existingReviewModels = await ReviewModel.getAll({
				userId,
				productId
			});

			if (existingReviewModels.length > 0) {
				return { error: 'You have already reviewed this product' };
			}

			// AI Moderation (non-blocking)
			try {
				const moderation = await moderateReview({
					rating,
					comment: comment || null,
					user_id: userId
				});

				if (moderation.recommendation === 'reject') {
					return { error: 'Your review was flagged as inappropriate. Please revise and try again.' };
				} else if (moderation.recommendation === 'review' && moderation.flags.length > 0) {
					console.log('Review flagged for manual review:', moderation.flags);
				}
			} catch (modError) {
				console.error('Moderation check failed, proceeding with review:', modError);
			}

			await ReviewModel.create(
				{
					product_id: productId,
					rating,
					comment: comment || null
				},
				userId
			);

			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Update review
	 */
	async updateReview() {
		const userId = this.getUser()?.id;
		if (!userId) {
			return { error: 'You must be logged in' };
		}

		const formData = await this.getFormData();
		const reviewId = formData.get('review_id')?.toString();
		const rating = parseInt(formData.get('rating')?.toString() || '0');
		const comment = formData.get('comment')?.toString() || '';

		if (!reviewId) {
			return { error: 'Review ID is required' };
		}

		try {
			const review = await ReviewModel.getById(reviewId);
			if (!review) {
				return { error: 'Review not found' };
			}
			await review.update({
				rating,
				comment: comment || null
			}, userId);

			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Delete review
	 */
	async deleteReview() {
		const userId = this.getUser()?.id;
		if (!userId) {
			return { error: 'You must be logged in' };
		}

		const formData = await this.getFormData();
		const reviewId = formData.get('review_id')?.toString();

		if (!reviewId) {
			return { error: 'Review ID is required' };
		}

		try {
			const review = await ReviewModel.getById(reviewId);
			if (!review) {
				return { error: 'Review not found' };
			}
			await review.delete(userId);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}

