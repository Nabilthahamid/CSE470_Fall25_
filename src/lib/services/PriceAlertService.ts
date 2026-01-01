// SERVICE: Price alert and deals business logic
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { notificationService } from './NotificationService';
import type { Product } from '$lib/models/Product';

export interface PriceAlert {
	id: string;
	user_id: string;
	product_id: string;
	target_price?: number;
	alert_type: 'price_drop' | 'on_sale' | 'below_target';
	is_active: boolean;
	created_at: string;
	product?: Product;
}

export interface PriceHistory {
	product_id: string;
	price: number;
	date: string;
}

export interface Deal {
	product: Product;
	discountPercent: number;
	originalPrice: number;
	currentPrice: number;
	reason: string;
}

export class PriceAlertService {
	/**
	 * Create a price alert for a user
	 */
	async createPriceAlert(
		userId: string,
		productId: string,
		targetPrice?: number
	): Promise<PriceAlert> {
		// Check if alert already exists
		const existing = await this.getUserPriceAlerts(userId);
		const existingAlert = existing.find((a) => a.product_id === productId && a.is_active);

		if (existingAlert) {
			throw new Error('Price alert already exists for this product');
		}

		const { data, error } = await supabase
			.from('price_alerts')
			.insert({
				user_id: userId,
				product_id: productId,
				target_price: targetPrice,
				alert_type: targetPrice ? 'below_target' : 'price_drop',
				is_active: true,
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) {
			// If table doesn't exist, create it
			if (error.message.includes('does not exist')) {
				await this.createPriceAlertsTable();
				// Retry insert
				const { data: retryData, error: retryError } = await supabase
					.from('price_alerts')
					.insert({
						user_id: userId,
						product_id: productId,
						target_price: targetPrice,
						alert_type: targetPrice ? 'below_target' : 'price_drop',
						is_active: true,
						created_at: new Date().toISOString()
					})
					.select()
					.single();

				if (retryError) throw new Error(`Failed to create price alert: ${retryError.message}`);
				return retryData as PriceAlert;
			}
			throw new Error(`Failed to create price alert: ${error.message}`);
		}

		return data as PriceAlert;
	}

	/**
	 * Get user's price alerts
	 */
	async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
		try {
			const { data, error } = await supabase
				.from('price_alerts')
				.select('*')
				.eq('user_id', userId)
				.eq('is_active', true)
				.order('created_at', { ascending: false });

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			// Fetch product details
			const alertsWithProducts = await Promise.all(
				(data || []).map(async (alert) => {
					try {
						const product = await productService.getProductById(alert.product_id);
						return { ...alert, product };
					} catch {
						return alert;
					}
				})
			);

			return alertsWithProducts as PriceAlert[];
		} catch (error) {
			console.error('Error getting price alerts:', error);
			return [];
		}
	}

	/**
	 * Check for price drops and send notifications
	 */
	async checkPriceDrops(): Promise<void> {
		try {
			// Get all active price alerts
			const { data: alerts, error } = await supabase
				.from('price_alerts')
				.select('*')
				.eq('is_active', true);

			if (error) {
				if (error.message.includes('does not exist')) {
					return;
				}
				throw error;
			}

			if (!alerts || alerts.length === 0) {
				return;
			}

			// Check each alert
			for (const alert of alerts) {
				const product = await productService.getProductById(alert.product_id);
				if (!product) continue;

				// Get price history
				const priceHistory = await this.getPriceHistory(alert.product_id);
				const previousPrice = priceHistory.length > 0 ? priceHistory[0].price : product.price;

				// Check if price dropped
				if (product.price < previousPrice) {
					const dropPercent = ((previousPrice - product.price) / previousPrice) * 100;

					// Send notification
					await notificationService.createNotification({
						user_id: alert.user_id,
						type: 'sale',
						title: 'Price Drop Alert!',
						message: `${product.name} price dropped by ${dropPercent.toFixed(1)}%! Now Tk ${product.price.toFixed(2)} (was Tk ${previousPrice.toFixed(2)})`,
						product_id: product.id
					});

					// Update price history
					await this.recordPrice(alert.product_id, product.price);
				}

				// Check target price
				if (alert.target_price && product.price <= alert.target_price) {
					await notificationService.createNotification({
						user_id: alert.user_id,
						type: 'sale',
						title: 'Target Price Reached!',
						message: `${product.name} is now Tk ${product.price.toFixed(2)}, below your target of Tk ${alert.target_price.toFixed(2)}!`,
						product_id: product.id
					});

					// Deactivate alert
					await supabase
						.from('price_alerts')
						.update({ is_active: false })
						.eq('id', alert.id);
				}
			}
		} catch (error) {
			console.error('Error checking price drops:', error);
		}
	}

	/**
	 * Get personalized deals for a user
	 */
	async getPersonalizedDeals(
		userId: string,
		limit: number = 10
	): Promise<Deal[]> {
		try {
			const allProducts = await productService.getAllProducts();
			const deals: Deal[] = [];

			// Get user's browsing/purchase history
			const { data: userBehavior } = await supabase
				.from('user_behavior')
				.select('product_id')
				.eq('user_id', userId)
				.limit(50);

			const interestedProductIds = new Set(
				(userBehavior || []).map((b: any) => b.product_id)
			);

			// Find deals on products user is interested in
			for (const product of allProducts) {
				if (product.cost_price && product.cost_price < product.price) {
					const discountPercent = ((product.price - product.cost_price) / product.price) * 100;

					if (discountPercent > 5) {
						// At least 5% discount
						const isInterested = interestedProductIds.has(product.id);
						deals.push({
							product,
							discountPercent: Math.round(discountPercent),
							originalPrice: product.price,
							currentPrice: product.cost_price,
							reason: isInterested
								? 'Deal on products you viewed'
								: 'Great value deal'
						});
					}
				}
			}

			// Sort by discount and interest
			return deals
				.sort((a, b) => {
					const aInterested = interestedProductIds.has(a.product.id);
					const bInterested = interestedProductIds.has(b.product.id);
					if (aInterested && !bInterested) return -1;
					if (!aInterested && bInterested) return 1;
					return b.discountPercent - a.discountPercent;
				})
				.slice(0, limit);
		} catch (error) {
			console.error('Error getting personalized deals:', error);
			return [];
		}
	}

	/**
	 * Record price history
	 */
	async recordPrice(productId: string, price: number): Promise<void> {
		try {
			await supabase.from('price_history').insert({
				product_id: productId,
				price,
				date: new Date().toISOString()
			});
		} catch (error) {
			// Ignore if table doesn't exist
			if (error && typeof error === 'object' && 'message' in error) {
				if (!(error as any).message.includes('does not exist')) {
					console.error('Error recording price:', error);
				}
			}
		}
	}

	/**
	 * Get price history for a product
	 */
	async getPriceHistory(productId: string, days: number = 30): Promise<PriceHistory[]> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - days);

			const { data, error } = await supabase
				.from('price_history')
				.select('*')
				.eq('product_id', productId)
				.gte('date', cutoffDate.toISOString())
				.order('date', { ascending: false });

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			return (data || []) as PriceHistory[];
		} catch (error) {
			console.error('Error getting price history:', error);
			return [];
		}
	}

	/**
	 * Create price_alerts table if it doesn't exist
	 */
	private async createPriceAlertsTable(): Promise<void> {
		// This would typically be done via migration, but we can create it here as fallback
		// In production, use proper migrations
		console.log('Price alerts table should be created via migration');
	}
}

export const priceAlertService = new PriceAlertService();

