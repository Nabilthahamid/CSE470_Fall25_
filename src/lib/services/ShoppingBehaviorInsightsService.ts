// SERVICE: Shopping behavior insights
import { supabase } from '$lib/config/supabase';
import { saleService } from './SaleService';
import { userRecommendationService } from './UserRecommendationService';
import { enhancedAIService } from './EnhancedAIService';

export interface ShoppingProfile {
	userId: string;
	spendingInsights: {
		totalSpent: number;
		averageOrderValue: number;
		totalOrders: number;
		monthlyAverage: number;
		trend: 'increasing' | 'decreasing' | 'stable';
	};
	categoryPreferences: Array<{
		categoryName: string;
		spent: number;
		orders: number;
		percentage: number;
	}>;
	budgetRecommendations: string[];
	shoppingHabits: {
		preferredPriceRange: { min: number; max: number };
		favoriteBrands: string[];
		purchaseFrequency: string;
		seasonalPatterns?: string[];
	};
	insights: string[];
	recommendations: string[];
}

export class ShoppingBehaviorInsightsService {
	/**
	 * Generate shopping behavior insights for a user
	 */
	async generateInsights(userId: string): Promise<ShoppingProfile> {
		try {
			// Get user's purchase history
			const sales = await saleService.getAll({ userId });

			// Calculate spending insights
			const spendingInsights = this.calculateSpendingInsights(sales);

			// Analyze category preferences
			const categoryPreferences = await this.analyzeCategoryPreferences(userId, sales);

			// Get budget recommendations
			const budgetRecommendations = this.generateBudgetRecommendations(spendingInsights);

			// Analyze shopping habits
			const shoppingHabits = await this.analyzeShoppingHabits(userId, sales);

			// Generate insights
			const insights = this.generateInsightsText(spendingInsights, categoryPreferences, shoppingHabits);

			// Generate recommendations
			const recommendations = await this.generateRecommendations(userId, categoryPreferences, shoppingHabits);

			return {
				userId,
				spendingInsights,
				categoryPreferences,
				budgetRecommendations,
				shoppingHabits,
				insights,
				recommendations
			};
		} catch (error: any) {
			console.error('Error generating insights:', error);
			throw new Error(`Failed to generate insights: ${error.message}`);
		}
	}

	/**
	 * Calculate spending insights
	 */
	private calculateSpendingInsights(sales: any[]): ShoppingProfile['spendingInsights'] {
		if (sales.length === 0) {
			return {
				totalSpent: 0,
				averageOrderValue: 0,
				totalOrders: 0,
				monthlyAverage: 0,
				trend: 'stable'
			};
		}

		const totalSpent = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
		const totalOrders = sales.length;
		const averageOrderValue = totalSpent / totalOrders;

		// Calculate monthly average
		const firstSale = sales[sales.length - 1];
		const lastSale = sales[0];
		const months = Math.max(
			1,
			Math.floor(
				(new Date(lastSale.created_at).getTime() - new Date(firstSale.created_at).getTime()) /
					(1000 * 60 * 60 * 24 * 30)
			)
		);
		const monthlyAverage = totalSpent / months;

		// Determine trend
		const recentSales = sales.slice(0, Math.floor(sales.length / 2));
		const olderSales = sales.slice(Math.floor(sales.length / 2));
		const recentAvg = recentSales.reduce((sum, s) => sum + (s.total_amount || 0), 0) / recentSales.length;
		const olderAvg = olderSales.reduce((sum, s) => sum + (s.total_amount || 0), 0) / olderSales.length;

		let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
		if (recentAvg > olderAvg * 1.1) trend = 'increasing';
		else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

		return {
			totalSpent,
			averageOrderValue,
			totalOrders,
			monthlyAverage,
			trend
		};
	}

	/**
	 * Analyze category preferences
	 */
	private async analyzeCategoryPreferences(userId: string, sales: any[]): Promise<ShoppingProfile['categoryPreferences']> {
		// Group sales by category
		const categorySpending: Record<string, { spent: number; orders: number }> = {};

		for (const sale of sales) {
			const productId = sale.product_id;
			// Get product category (would need to fetch products)
			// For now, use a simplified approach
			const categoryName = 'General'; // Would be fetched from product
			
			if (!categorySpending[categoryName]) {
				categorySpending[categoryName] = { spent: 0, orders: 0 };
			}
			categorySpending[categoryName].spent += sale.total_amount || 0;
			categorySpending[categoryName].orders += 1;
		}

		const totalSpent = Object.values(categorySpending).reduce((sum, cat) => sum + cat.spent, 0);

		return Object.entries(categorySpending)
			.map(([categoryName, data]) => ({
				categoryName,
				spent: data.spent,
				orders: data.orders,
				percentage: totalSpent > 0 ? (data.spent / totalSpent) * 100 : 0
			}))
			.sort((a, b) => b.spent - a.spent);
	}

	/**
	 * Generate budget recommendations
	 */
	private generateBudgetRecommendations(
		spendingInsights: ShoppingProfile['spendingInsights']
	): string[] {
		const recommendations: string[] = [];

		if (spendingInsights.trend === 'increasing') {
			recommendations.push('Your spending has been increasing. Consider setting a monthly budget.');
		}

		if (spendingInsights.monthlyAverage > 50000) {
			recommendations.push('You spend a significant amount monthly. Consider bulk purchases for better value.');
		}

		if (spendingInsights.averageOrderValue < 5000) {
			recommendations.push('You make frequent small purchases. Consider bundling items to save on shipping.');
		}

		return recommendations;
	}

	/**
	 * Analyze shopping habits
	 */
	private async analyzeShoppingHabits(userId: string, sales: any[]): Promise<ShoppingProfile['shoppingHabits']> {
		if (sales.length === 0) {
			return {
				preferredPriceRange: { min: 0, max: 0 },
				favoriteBrands: [],
				purchaseFrequency: 'No purchases yet'
			};
		}

		// Calculate price range
		const prices = sales.map(s => s.sale_price || 0).filter(p => p > 0);
		const minPrice = Math.min(...prices);
		const maxPrice = Math.max(...prices);

		// Calculate purchase frequency
		const daysBetween = sales.length > 1
			? (new Date(sales[0].created_at).getTime() - new Date(sales[sales.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24) / sales.length
			: 0;

		let frequency = 'No pattern';
		if (daysBetween < 7) frequency = 'Very frequent (weekly)';
		else if (daysBetween < 30) frequency = 'Regular (monthly)';
		else if (daysBetween < 90) frequency = 'Occasional (quarterly)';
		else frequency = 'Infrequent';

		return {
			preferredPriceRange: { min: minPrice, max: maxPrice },
			favoriteBrands: [], // Would be extracted from products
			purchaseFrequency: frequency
		};
	}

	/**
	 * Generate insights text
	 */
	private generateInsightsText(
		spendingInsights: ShoppingProfile['spendingInsights'],
		categoryPreferences: ShoppingProfile['categoryPreferences'],
		shoppingHabits: ShoppingProfile['shoppingHabits']
	): string[] {
		const insights: string[] = [];

		insights.push(`You've made ${spendingInsights.totalOrders} purchase(s) totaling Tk ${spendingInsights.totalSpent.toFixed(2)}.`);
		insights.push(`Your average order value is Tk ${spendingInsights.averageOrderValue.toFixed(2)}.`);
		insights.push(`Your spending trend is ${spendingInsights.trend}.`);

		if (categoryPreferences.length > 0) {
			const topCategory = categoryPreferences[0];
			insights.push(`You spend most on ${topCategory.categoryName} (${topCategory.percentage.toFixed(1)}% of total).`);
		}

		insights.push(`Your purchase frequency: ${shoppingHabits.purchaseFrequency}.`);

		return insights;
	}

	/**
	 * Generate personalized recommendations
	 */
	private async generateRecommendations(
		userId: string,
		categoryPreferences: ShoppingProfile['categoryPreferences'],
		shoppingHabits: ShoppingProfile['shoppingHabits']
	): Promise<string[]> {
		const recommendations: string[] = [];

		// Get personalized product recommendations
		const browsingHistory = await userRecommendationService.getUserBrowsingHistory(userId);
		if (browsingHistory.length > 0) {
			recommendations.push('Based on your browsing history, we have personalized recommendations for you.');
		}

		if (categoryPreferences.length > 0) {
			const topCategory = categoryPreferences[0];
			recommendations.push(`Explore more products in ${topCategory.categoryName} - your favorite category.`);
		}

		return recommendations;
	}
}

export const shoppingBehaviorInsightsService = new ShoppingBehaviorInsightsService();

