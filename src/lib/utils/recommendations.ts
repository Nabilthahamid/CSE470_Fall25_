// UTILITY: Product recommendation helper functions
import { ProductModel } from '$lib/models/ProductModel';
import type { Product } from '$lib/models/Product';

export interface UserRecommendation {
	product: Product;
	reason: string;
	score: number;
}

/**
 * Get similar product recommendations
 */
export async function getSimilarProductRecommendations(
	productId: string,
	limit: number = 6
): Promise<Product[]> {
	try {
		const productModel = await ProductModel.getById(productId);
		if (!productModel) {
			return [];
		}

		const product = productModel.toJSON();
		const allProductsModels = await ProductModel.getAll();
		const allProducts = allProductsModels.map(p => p.toJSON());

		// Find similar products by category and price range
		const similarProducts = allProducts
			.filter((p) => {
				if (p.id === productId) return false;
				// Same category
				if (product.component_category_id && p.component_category_id === product.component_category_id) {
					return true;
				}
				// Similar price range (±20%)
				if (product.price && p.price) {
					const priceDiff = Math.abs(p.price - product.price) / product.price;
					if (priceDiff <= 0.2) {
						return true;
					}
				}
				return false;
			})
			.slice(0, limit);

		return similarProducts;
	} catch (error) {
		console.error('Error getting similar products:', error);
		return [];
	}
}

/**
 * Get personalized recommendations
 */
export async function getPersonalizedRecommendations(
	context: {
		userId?: string;
		browsingHistory?: string[];
		purchaseHistory?: string[];
		cartItems?: string[];
		categoriesViewed?: string[];
		priceRange?: { min: number; max: number };
	},
	limit: number = 10
): Promise<UserRecommendation[]> {
	try {
		const allProductsModels = await ProductModel.getAll();
		const allProducts = allProductsModels.map(p => p.toJSON());

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

				// Category preference
				if (
					context.categoriesViewed &&
					context.categoriesViewed.length > 0 &&
					product.component_category_id &&
					context.categoriesViewed.includes(product.component_category_id)
				) {
					score += 0.5;
					reasons.push('From categories you browse');
				}

				// Price range preference
				if (context.priceRange && product.price) {
					if (
						product.price >= context.priceRange.min &&
						product.price <= context.priceRange.max
					) {
						score += 0.3;
						reasons.push('In your price range');
					}
				}

				// Popular products boost
				if (product.stock && product.stock > 10) {
					score += 0.2;
				}

				return {
					product,
					reason: reasons.join(', ') || 'Recommended for you',
					score
				} as UserRecommendation;
			})
			.filter((item): item is UserRecommendation => item !== null && item.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, limit);

		return scoredProducts;
	} catch (error) {
		console.error('Error getting personalized recommendations:', error);
		return [];
	}
}

