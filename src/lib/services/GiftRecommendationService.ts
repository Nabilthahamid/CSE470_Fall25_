// SERVICE: Gift finder and recommender business logic
import { productService } from './ProductService';
import { enhancedAIService } from './EnhancedAIService';
import type { Product } from '$lib/models/Product';

export interface GiftCriteria {
	recipientAge?: number;
	recipientInterests?: string[];
	occasion?: 'birthday' | 'anniversary' | 'graduation' | 'holiday' | 'wedding' | 'other';
	budget?: { min: number; max: number };
	gender?: 'male' | 'female' | 'other' | 'any';
	relationship?: string;
}

export interface GiftRecommendation {
	product: Product;
	reason: string;
	confidence: number;
	price: number;
}

export class GiftRecommendationService {
	/**
	 * Find gifts based on criteria
	 */
	async findGifts(criteria: GiftCriteria, limit: number = 10): Promise<GiftRecommendation[]> {
		try {
			const allProducts = await productService.getAllProducts();
			const recommendations: GiftRecommendation[] = [];

			// Age-based filtering
			let ageFiltered = allProducts;
			if (criteria.recipientAge) {
				ageFiltered = this.filterByAge(allProducts, criteria.recipientAge);
			}

			// Interest-based filtering
			let interestFiltered = ageFiltered;
			if (criteria.recipientInterests && criteria.recipientInterests.length > 0) {
				interestFiltered = this.filterByInterests(ageFiltered, criteria.recipientInterests);
			}

			// Occasion-based filtering
			let occasionFiltered = interestFiltered;
			if (criteria.occasion) {
				occasionFiltered = this.filterByOccasion(interestFiltered, criteria.occasion);
			}

			// Budget filtering
			let budgetFiltered = occasionFiltered;
			if (criteria.budget) {
				budgetFiltered = occasionFiltered.filter(
					(p) => p.price >= criteria.budget!.min && p.price <= criteria.budget!.max
				);
			}

			// Score and rank products
			for (const product of budgetFiltered) {
				let score = 0.5; // Base score
				let reasons: string[] = [];

				// Age match
				if (criteria.recipientAge) {
					const ageScore = this.getAgeScore(product, criteria.recipientAge);
					score += ageScore * 0.2;
					if (ageScore > 0.7) reasons.push('Age-appropriate');
				}

				// Interest match
				if (criteria.recipientInterests && criteria.recipientInterests.length > 0) {
					const interestScore = this.getInterestScore(product, criteria.recipientInterests);
					score += interestScore * 0.3;
					if (interestScore > 0.7) reasons.push('Matches interests');
				}

				// Occasion match
				if (criteria.occasion) {
					const occasionScore = this.getOccasionScore(product, criteria.occasion);
					score += occasionScore * 0.2;
					if (occasionScore > 0.7) reasons.push(`Perfect for ${criteria.occasion}`);
				}

				// Price appropriateness
				if (criteria.budget) {
					const budgetMid = (criteria.budget.min + criteria.budget.max) / 2;
					const priceDiff = Math.abs(product.price - budgetMid) / budgetMid;
					if (priceDiff < 0.2) {
						score += 0.1;
						reasons.push('Within budget range');
					}
				}

				// Stock availability
				if (product.stock > 0) {
					score += 0.1;
				}

				if (score > 0.5) {
					recommendations.push({
						product,
						reason: reasons.length > 0 ? reasons.join(', ') : 'Great gift option',
						confidence: Math.min(score, 1),
						price: product.price
					});
				}
			}

			return recommendations
				.sort((a, b) => b.confidence - a.confidence)
				.slice(0, limit);
		} catch (error: any) {
			console.error('Error finding gifts:', error);
			return [];
		}
	}

	/**
	 * Filter products by age appropriateness
	 */
	private filterByAge(products: Product[], age: number): Product[] {
		// Age-appropriate categories
		if (age < 13) {
			// Children - simpler products, educational
			return products.filter((p) => {
				const text = `${p.name} ${p.description}`.toLowerCase();
				return !text.includes('gaming') && !text.includes('professional');
			});
		} else if (age < 18) {
			// Teens - gaming, entertainment
			return products.filter((p) => {
				const text = `${p.name} ${p.description}`.toLowerCase();
				return text.includes('gaming') || text.includes('entertainment') || text.includes('laptop');
			});
		}
		// Adults - all products
		return products;
	}

	/**
	 * Filter products by interests
	 */
	private filterByInterests(products: Product[], interests: string[]): Product[] {
		const interestKeywords: Record<string, string[]> = {
			gaming: ['gaming', 'game', 'gpu', 'graphics', 'rgb', 'fps'],
			photography: ['camera', 'dslr', 'lens', 'photo', 'imaging'],
			music: ['audio', 'speaker', 'headphone', 'sound', 'music'],
			programming: ['laptop', 'keyboard', 'mouse', 'monitor', 'coding'],
			design: ['monitor', 'graphics', 'color', 'display', 'creative'],
			sports: ['fitness', 'tracker', 'watch'],
			reading: ['tablet', 'e-reader', 'display']
		};

		return products.filter((product) => {
			const text = `${product.name} ${product.description} ${product.specifications || ''}`.toLowerCase();
			return interests.some((interest) => {
				const keywords = interestKeywords[interest.toLowerCase()] || [interest];
				return keywords.some((keyword) => text.includes(keyword));
			});
		});
	}

	/**
	 * Filter products by occasion
	 */
	private filterByOccasion(products: Product[], occasion: string): Product[] {
		// All products are generally suitable, but we can prioritize certain types
		return products;
	}

	/**
	 * Get age appropriateness score
	 */
	private getAgeScore(product: Product, age: number): number {
		// Simple scoring - can be enhanced
		return 0.7;
	}

	/**
	 * Get interest match score
	 */
	private getInterestScore(product: Product, interests: string[]): number {
		const text = `${product.name} ${product.description}`.toLowerCase();
		const matches = interests.filter((interest) => text.includes(interest.toLowerCase())).length;
		return matches / interests.length;
	}

	/**
	 * Get occasion match score
	 */
	private getOccasionScore(product: Product, occasion: string): number {
		// All products are suitable for most occasions
		return 0.8;
	}

	/**
	 * Suggest gift bundles
	 */
	async suggestGiftBundles(criteria: GiftCriteria, limit: number = 5): Promise<Array<{
		products: Product[];
		totalPrice: number;
		reason: string;
	}>> {
		const gifts = await this.findGifts(criteria, 20);
		const bundles: Array<{ products: Product[]; totalPrice: number; reason: string }> = [];

		// Create bundles of 2-3 complementary products
		for (let i = 0; i < Math.min(gifts.length, 10); i++) {
			for (let j = i + 1; j < Math.min(gifts.length, 10); j++) {
				const bundle = [gifts[i].product, gifts[j].product];
				const totalPrice = bundle.reduce((sum, p) => sum + p.price, 0);

				if (!criteria.budget || (totalPrice >= criteria.budget.min && totalPrice <= criteria.budget.max)) {
					bundles.push({
						products: bundle,
						totalPrice,
						reason: 'Perfect gift bundle'
					});
				}
			}
		}

		return bundles.slice(0, limit);
	}
}

export const giftRecommendationService = new GiftRecommendationService();

