// SERVICE: User recommendation business logic
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { enhancedAIService } from './EnhancedAIService';
import type { Product } from '$lib/models/Product';

export interface UserRecommendation {
	product: Product;
	reason: string;
	score: number;
}

export interface RecommendationContext {
	userId?: string;
	browsingHistory?: string[]; // Product IDs
	purchaseHistory?: string[]; // Product IDs
	cartItems?: string[]; // Product IDs
	categoriesViewed?: string[]; // Category IDs
	priceRange?: { min: number; max: number };
}

export class UserRecommendationService {
	/**
	 * Get personalized recommendations for a user
	 */
	async getPersonalizedRecommendations(
		context: RecommendationContext,
		limit: number = 10
	): Promise<UserRecommendation[]> {
		try {
			// Get all products
			const allProducts = await productService.getAllProducts();

			if (allProducts.length === 0) {
				return [];
			}

			// Score products based on user context
			const scoredProducts = allProducts
				.map((product) => {
					let score = 0;
					let reasons: string[] = [];

					// Exclude products already in cart or purchased
					if (context.cartItems?.includes(product.id)) {
						return null;
					}
					if (context.purchaseHistory?.includes(product.id)) {
						return null;
					}

					// Browsing history similarity (40% weight)
					if (context.browsingHistory && context.browsingHistory.length > 0) {
						const similarProducts = enhancedAIService.findSimilarProducts(
							product,
							allProducts.filter((p) => context.browsingHistory!.includes(p.id))
						);
						if (similarProducts.length > 0) {
							const avgSimilarity =
								similarProducts.reduce((sum, sp) => sum + sp.similarityScore, 0) /
								similarProducts.length;
							score += avgSimilarity * 0.4;
							if (avgSimilarity > 0.6) {
								reasons.push('Similar to products you viewed');
							}
						}
					}

					// Purchase history similarity (30% weight)
					if (context.purchaseHistory && context.purchaseHistory.length > 0) {
						const similarProducts = enhancedAIService.findSimilarProducts(
							product,
							allProducts.filter((p) => context.purchaseHistory!.includes(p.id))
						);
						if (similarProducts.length > 0) {
							const avgSimilarity =
								similarProducts.reduce((sum, sp) => sum + sp.similarityScore, 0) /
								similarProducts.length;
							score += avgSimilarity * 0.3;
							if (avgSimilarity > 0.6) {
								reasons.push('Complements your purchases');
							}
						}
					}

					// Category preference (20% weight)
					if (
						context.categoriesViewed &&
						context.categoriesViewed.length > 0 &&
						product.component_category_id &&
						context.categoriesViewed.includes(product.component_category_id)
					) {
						score += 0.2;
						reasons.push('From categories you browse');
					}

					// Price range preference (10% weight)
					if (context.priceRange) {
						if (
							product.price >= context.priceRange.min &&
							product.price <= context.priceRange.max
						) {
							score += 0.1;
							reasons.push('In your price range');
						}
					}

					// Popular products boost (if no personal data)
					if (
						!context.browsingHistory?.length &&
						!context.purchaseHistory?.length &&
						!context.cartItems?.length
					) {
						// Boost products with good stock and reasonable prices
						if (product.stock > 0 && product.price > 0) {
							score += 0.3;
							reasons.push('Popular choice');
						}
					}

					return {
						product,
						score,
						reasons
					};
				})
				.filter((item): item is { product: Product; score: number; reasons: string[] } => {
					return item !== null && item.score > 0;
				})
				.sort((a, b) => b.score - a.score)
				.slice(0, limit)
				.map((item) => ({
					product: item.product,
					reason: item.reasons.join(', ') || 'Recommended for you',
					score: item.score
				}));

			return scoredProducts;
		} catch (error) {
			console.error('Error generating recommendations:', error);
			return [];
		}
	}

	/**
	 * Get recommendations based on a specific product (You May Also Like)
	 */
	async getSimilarProductRecommendations(
		productId: string,
		limit: number = 6
	): Promise<UserRecommendation[]> {
		try {
			const product = await productService.getProductById(productId);
			if (!product) {
				return [];
			}

			const allProducts = await productService.getAllProducts();
			const similarProducts = enhancedAIService.findSimilarProducts(product, allProducts);

			return similarProducts.slice(0, limit).map((sp) => ({
				product: sp.product,
				reason: `Similar to ${product.name}`,
				score: sp.similarityScore
			}));
		} catch (error) {
			console.error('Error getting similar products:', error);
			return [];
		}
	}

	/**
	 * Track user behavior (browsing, cart additions, purchases)
	 */
	async trackUserBehavior(
		userId: string,
		type: 'view' | 'cart' | 'purchase',
		productId: string
	): Promise<void> {
		try {
			// Store in user_behavior table if it exists, otherwise skip
			const { error } = await supabase.from('user_behavior').insert({
				user_id: userId,
				product_id: productId,
				behavior_type: type,
				created_at: new Date().toISOString()
			});

			// Ignore error if table doesn't exist
			if (error && !error.message.includes('does not exist')) {
				console.error('Error tracking behavior:', error);
			}
		} catch (error) {
			// Silently fail - behavior tracking is optional
			console.error('Error tracking behavior:', error);
		}
	}

	/**
	 * Get user browsing history
	 */
	async getUserBrowsingHistory(userId: string, limit: number = 20): Promise<string[]> {
		try {
			const { data, error } = await supabase
				.from('user_behavior')
				.select('product_id')
				.eq('user_id', userId)
				.eq('behavior_type', 'view')
				.order('created_at', { ascending: false })
				.limit(limit);

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			return [...new Set((data || []).map((item) => item.product_id))];
		} catch (error) {
			console.error('Error getting browsing history:', error);
			return [];
		}
	}

	/**
	 * Get user purchase history
	 */
	async getUserPurchaseHistory(userId: string): Promise<string[]> {
		try {
			const { data, error } = await supabase
				.from('sales')
				.select('product_id')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			return [...new Set((data || []).map((item) => item.product_id))];
		} catch (error) {
			console.error('Error getting purchase history:', error);
			return [];
		}
	}
}

export const userRecommendationService = new UserRecommendationService();

