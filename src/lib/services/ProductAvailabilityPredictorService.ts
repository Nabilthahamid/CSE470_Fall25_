// SERVICE: Product availability predictor
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { saleService } from './SaleService';
import type { Product } from '$lib/models/Product';

export interface AvailabilityPrediction {
	productId: string;
	productName: string;
	currentStock: number;
	predictedRestockDate?: string;
	confidence: number;
	reason: string;
	similarAlternatives?: Product[];
}

export class ProductAvailabilityPredictorService {
	/**
	 * Predict when a product will be back in stock
	 */
	async predictAvailability(productId: string): Promise<AvailabilityPrediction> {
		try {
			const product = await productService.getProductById(productId);
			if (!product) {
				throw new Error('Product not found');
			}

			// If in stock, no prediction needed
			if (product.stock > 0) {
				return {
					productId: product.id,
					productName: product.name,
					currentStock: product.stock,
					confidence: 1,
					reason: 'Product is currently in stock'
				};
			}

			// Get sales history to predict restock
			const sales = await saleService.getAll({ productId });
			
			// Calculate average time between restocks (if we have historical data)
			const restockHistory = await this.getRestockHistory(productId);
			
			// Predict based on sales velocity
			const salesVelocity = this.calculateSalesVelocity(sales);
			const predictedDays = this.predictRestockDays(salesVelocity, restockHistory);

			const predictedDate = new Date();
			predictedDate.setDate(predictedDate.getDate() + predictedDays);

			// Get similar alternatives
			const allProducts = await productService.getAllProducts();
			const similarAlternatives = allProducts
				.filter(p => p.id !== productId && p.stock > 0)
				.filter(p => {
					// Simple similarity check
					const productText = `${product.name} ${product.description}`.toLowerCase();
					const altText = `${p.name} ${p.description}`.toLowerCase();
					return productText.split(' ').some(word => 
						word.length > 3 && altText.includes(word)
					);
				})
				.slice(0, 5);

			return {
				productId: product.id,
				productName: product.name,
				currentStock: 0,
				predictedRestockDate: predictedDate.toISOString(),
				confidence: this.calculateConfidence(sales.length, restockHistory.length),
				reason: this.generateReason(salesVelocity, predictedDays),
				similarAlternatives
			};
		} catch (error: any) {
			console.error('Error predicting availability:', error);
			throw new Error(`Failed to predict availability: ${error.message}`);
		}
	}

	/**
	 * Get restock history from inventory tracking
	 */
	private async getRestockHistory(productId: string): Promise<Array<{ date: string; stock: number }>> {
		try {
			const { data, error } = await supabase
				.from('inventory_history')
				.select('*')
				.eq('product_id', productId)
				.order('created_at', { ascending: false })
				.limit(20);

			if (error || !data) {
				return [];
			}

			// Find restock events (stock increased)
			const restocks: Array<{ date: string; stock: number }> = [];
			for (let i = 1; i < data.length; i++) {
				if (data[i].stock > data[i - 1].stock) {
					restocks.push({
						date: data[i].created_at,
						stock: data[i].stock
					});
				}
			}

			return restocks;
		} catch (error) {
			return [];
		}
	}

	/**
	 * Calculate sales velocity (units per day)
	 */
	private calculateSalesVelocity(sales: any[]): number {
		if (sales.length === 0) return 0;

		// Group by date
		const salesByDate = sales.reduce((acc, sale) => {
			if (!sale.created_at) return acc;
			const date = new Date(sale.created_at).toDateString();
			if (!acc[date]) acc[date] = 0;
			acc[date] += sale.quantity || 1;
			return acc;
		}, {} as Record<string, number>);

		const dates = Object.keys(salesByDate);
		if (dates.length === 0) return 0;

		const totalSales = Object.values(salesByDate).reduce((a, b) => a + b, 0);
		const days = Math.max(1, dates.length);

		return totalSales / days;
	}

	/**
	 * Predict restock days based on sales velocity
	 */
	private predictRestockDays(salesVelocity: number, restockHistory: Array<{ date: string; stock: number }>): number {
		// If we have restock history, use average interval
		if (restockHistory.length >= 2) {
			const intervals: number[] = [];
			for (let i = 1; i < restockHistory.length; i++) {
				const days = Math.floor(
					(new Date(restockHistory[i - 1].date).getTime() - 
					 new Date(restockHistory[i].date).getTime()) / 
					(1000 * 60 * 60 * 24)
				);
				if (days > 0) intervals.push(days);
			}

			if (intervals.length > 0) {
				const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
				return Math.round(avgInterval);
			}
		}

		// Default prediction based on sales velocity
		if (salesVelocity > 10) {
			return 7; // High demand - restock weekly
		} else if (salesVelocity > 5) {
			return 14; // Medium demand - restock bi-weekly
		} else if (salesVelocity > 0) {
			return 30; // Low demand - restock monthly
		}

		return 30; // Default: 30 days
	}

	/**
	 * Calculate prediction confidence
	 */
	private calculateConfidence(salesCount: number, restockHistoryCount: number): number {
		let confidence = 0.5; // Base confidence

		// More sales data = higher confidence
		if (salesCount > 50) confidence += 0.2;
		else if (salesCount > 20) confidence += 0.1;

		// Restock history = higher confidence
		if (restockHistoryCount > 5) confidence += 0.2;
		else if (restockHistoryCount > 2) confidence += 0.1;

		return Math.min(confidence, 0.9); // Cap at 90%
	}

	/**
	 * Generate reason for prediction
	 */
	private generateReason(salesVelocity: number, predictedDays: number): string {
		if (salesVelocity > 10) {
			return `High demand product. Based on sales patterns, expected restock in approximately ${predictedDays} days.`;
		} else if (salesVelocity > 5) {
			return `Moderate demand. Estimated restock in approximately ${predictedDays} days based on historical data.`;
		} else if (salesVelocity > 0) {
			return `Low to moderate demand. Predicted restock in approximately ${predictedDays} days.`;
		}

		return `Estimated restock in approximately ${predictedDays} days. Prediction based on general inventory patterns.`;
	}

	/**
	 * Subscribe to restock notifications
	 */
	async subscribeToRestock(userId: string, productId: string): Promise<void> {
		try {
			await supabase.from('restock_notifications').insert({
				user_id: userId,
				product_id: productId,
				created_at: new Date().toISOString()
			});
		} catch (error) {
			// Ignore if table doesn't exist
			console.warn('Could not subscribe to restock:', error);
		}
	}

	/**
	 * Get user's restock subscriptions
	 */
	async getUserSubscriptions(userId: string): Promise<Array<{ productId: string; productName: string }>> {
		try {
			const { data, error } = await supabase
				.from('restock_notifications')
				.select('product_id, products(name)')
				.eq('user_id', userId);

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			return (data || []).map((item: any) => ({
				productId: item.product_id,
				productName: item.products?.name || 'Unknown'
			}));
		} catch (error) {
			console.error('Error getting subscriptions:', error);
			return [];
		}
	}
}

export const productAvailabilityPredictorService = new ProductAvailabilityPredictorService();

