// CONTROLLER: Advanced Analytics Dashboard
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { saleService } from '$lib/services/SaleService';
import { productService } from '$lib/services/ProductService';
import { orderService } from '$lib/services/OrderService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const period = url.searchParams.get('period') || 'month'; // day, week, month, year
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const comparePeriod = url.searchParams.get('compare') === 'true';

		// Get all sales data
		const filters: any = {};
		if (startDate) filters.startDate = startDate;
		if (endDate) filters.endDate = endDate;

		const allSales = await saleService.getAllSales(filters);
		const products = await productService.getAllProducts();
		const orders = await orderService.getAllOrders();

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

		// Revenue trends data (grouped by time intervals)
		const revenueTrends = calculateRevenueTrends(periodSales, period);
		const previousRevenueTrends = comparePeriod ? calculateRevenueTrends(previousPeriodSales, period) : null;

		// Product performance data
		const productPerformance = calculateProductPerformance(periodSales, products);

		// Category performance
		const categoryPerformance = calculateCategoryPerformance(periodSales, products);

		// Sales heatmap data (by day of week and hour if daily, by day if weekly/monthly)
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
			productPerformance: productPerformance.slice(0, 20), // Top 20
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
		const { message } = handleError(error);
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
};

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

	// Convert to array and sort
	return Object.entries(trends)
		.map(([date, data]) => ({ date, ...data }))
		.sort((a, b) => {
			// Sort by date if possible, otherwise alphabetically
			return a.date.localeCompare(b.date);
		});
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

