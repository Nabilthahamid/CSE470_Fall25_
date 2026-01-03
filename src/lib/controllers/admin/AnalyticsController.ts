// CONTROLLER: Analytics controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { SaleModel } from '$lib/models/SaleModel';
import { ProductModel } from '$lib/models/ProductModel';
import { OrderModel } from '$lib/models/OrderModel';

// Helper functions (moved from route file)
function calculateRevenueTrends(sales: any[], period: string): Array<{ date: string; revenue: number; orders: number }> {
	if (sales.length === 0) return [];

	const trends: Record<string, { revenue: number; orders: number }> = {};

	sales.forEach((sale) => {
		if (!sale.created_at) return;
		const date = new Date(sale.created_at);
		let key: string;

		switch (period) {
			case 'day':
				key = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
				break;
			case 'week':
				key = date.toLocaleDateString('en-US', { weekday: 'short' });
				break;
			case 'month':
				key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
				break;
			case 'year':
				key = date.toLocaleDateString('en-US', { month: 'short' });
				break;
			default:
				key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
		}

		if (!trends[key]) {
			trends[key] = { revenue: 0, orders: 0 };
		}
		trends[key].revenue += sale.total_amount;
		trends[key].orders += 1;
	});

	return Object.entries(trends)
		.map(([date, data]) => ({ date, ...data }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateProductPerformance(
	sales: any[],
	products: any[]
): Array<{ productId: string; productName: string; revenue: number; quantity: number; orders: number }> {
	const performance: Record<
		string,
		{ productId: string; productName: string; revenue: number; quantity: number; orders: number }
	> = {};

	sales.forEach((sale) => {
		const productId = sale.product_id;
		if (!performance[productId]) {
			const product = products.find((p) => p.id === productId);
			performance[productId] = {
				productId,
				productName: product?.name || 'Unknown Product',
				revenue: 0,
				quantity: 0,
				orders: 0
			};
		}
		performance[productId].revenue += sale.total_amount;
		performance[productId].quantity += sale.quantity;
		performance[productId].orders += 1;
	});

	return Object.values(performance).sort((a, b) => b.revenue - a.revenue);
}

function calculateCategoryPerformance(sales: any[], products: any[]): Array<{ category: string; revenue: number; quantity: number }> {
	const performance: Record<string, { revenue: number; quantity: number }> = {};

	sales.forEach((sale) => {
		const product = products.find((p) => p.id === sale.product_id);
		const category = product?.component_category_name || 'Uncategorized';

		if (!performance[category]) {
			performance[category] = { revenue: 0, quantity: 0 };
		}
		performance[category].revenue += sale.total_amount;
		performance[category].quantity += sale.quantity;
	});

	return Object.entries(performance)
		.map(([category, data]) => ({ category, ...data }))
		.sort((a, b) => b.revenue - a.revenue);
}

function calculateSalesHeatmap(sales: any[], period: string): Array<{ day: string; hour?: number; value: number }> {
	const heatmap: Record<string, number> = {};

	sales.forEach((sale) => {
		if (!sale.created_at) return;
		const date = new Date(sale.created_at);
		let key: string;

		if (period === 'day') {
			const hour = date.getHours();
			const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
			key = `${dayName}_${hour}`;
		} else {
			const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
			key = dayName;
		}

		if (!heatmap[key]) {
			heatmap[key] = 0;
		}
		heatmap[key] += sale.total_amount;
	});

	return Object.entries(heatmap).map(([key, value]) => {
		if (period === 'day') {
			const [day, hour] = key.split('_');
			return { day, hour: parseInt(hour), value };
		}
		return { day: key, value };
	});
}

export class AnalyticsController extends BaseController {
	/**
	 * Load analytics dashboard data
	 */
	async loadAnalytics() {
		requireAdmin(this.getUser());

		try {
			const period = this.getQueryParam('period', 'month');
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const comparePeriod = this.getQueryParamAsBoolean('compare');

			// Get all sales data (exclude cancelled orders)
			const filters: any = {};
			if (startDate) filters.startDate = startDate;
			if (endDate) filters.endDate = endDate;

			const allSalesModels = await SaleModel.getAll(filters, true);
			const allSales = allSalesModels.map((s) => s.toJSON());
			const productsModels = await ProductModel.getAll();
			const products = productsModels.map((p) => p.toJSON());
			const ordersModels = await OrderModel.getAll();
			const orders = ordersModels.map((o) => o.toJSON());

			// Calculate date ranges
			const now = new Date();
			let periodStart: Date;
			let periodEnd: Date = now;

			switch (period) {
				case 'day':
					periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					break;
				case 'week':
					const dayOfWeek = now.getDay();
					periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
					periodStart.setHours(0, 0, 0, 0);
					break;
				case 'month':
					periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
					break;
				case 'year':
					periodStart = new Date(now.getFullYear(), 0, 1);
					break;
				default:
					periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
			}

			// Filter sales by period
			const periodSales = allSales.filter((sale) => {
				if (!sale.created_at) return false;
				const saleDate = new Date(sale.created_at);
				return saleDate >= periodStart && saleDate <= periodEnd;
			});

			// Calculate previous period for comparison
			let previousPeriodSales: typeof allSales = [];
			if (comparePeriod) {
				const periodDuration = periodEnd.getTime() - periodStart.getTime();
				const previousPeriodEnd = new Date(periodStart.getTime() - 1);
				const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);

				previousPeriodSales = allSales.filter((sale) => {
					if (!sale.created_at) return false;
					const saleDate = new Date(sale.created_at);
					return saleDate >= previousPeriodStart && saleDate <= previousPeriodEnd;
				});
			}

			// Revenue trends data
			const revenueTrends = calculateRevenueTrends(periodSales, period);
			const previousRevenueTrends = comparePeriod ? calculateRevenueTrends(previousPeriodSales, period) : null;

			// Product performance data
			const productPerformance = calculateProductPerformance(periodSales, products);

			// Category performance
			const categoryPerformance = calculateCategoryPerformance(periodSales, products);

			// Sales heatmap data
			const salesHeatmap = calculateSalesHeatmap(periodSales, period);

			// Time-based comparisons
			const timeComparisons = comparePeriod
				? {
						currentPeriod: {
							revenue: periodSales.reduce((sum, s) => sum + s.total_amount, 0),
							orders: periodSales.length,
							averageOrderValue: periodSales.length > 0
								? periodSales.reduce((sum, s) => sum + s.total_amount, 0) / periodSales.length
								: 0
						},
						previousPeriod: {
							revenue: previousPeriodSales.reduce((sum, s) => sum + s.total_amount, 0),
							orders: previousPeriodSales.length,
							averageOrderValue: previousPeriodSales.length > 0
								? previousPeriodSales.reduce((sum, s) => sum + s.total_amount, 0) / previousPeriodSales.length
								: 0
						}
					}
				: null;

			return {
				revenueTrends,
				previousRevenueTrends,
				productPerformance: productPerformance.slice(0, 20),
				categoryPerformance,
				salesHeatmap,
				timeComparisons,
				period,
				periodStart: periodStart.toISOString(),
				periodEnd: periodEnd.toISOString(),
				summary: {
					totalRevenue: periodSales.reduce((sum, s) => sum + s.total_amount, 0),
					totalOrders: periodSales.length,
					totalProducts: products.length,
					averageOrderValue: periodSales.length > 0
						? periodSales.reduce((sum, s) => sum + s.total_amount, 0) / periodSales.length
						: 0
				},
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				revenueTrends: [],
				previousRevenueTrends: null,
				productPerformance: [],
				categoryPerformance: [],
				salesHeatmap: [],
				timeComparisons: null,
				period: 'month',
				periodStart: new Date().toISOString(),
				periodEnd: new Date().toISOString(),
				summary: {
					totalRevenue: 0,
					totalOrders: 0,
					totalProducts: 0,
					averageOrderValue: 0
				},
				error: message
			};
		}
	}
}

