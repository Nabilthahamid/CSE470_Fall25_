// CONTROLLER: KPI Dashboard - Business Intelligence
import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { saleService } from '$lib/services/SaleService';
import { productService } from '$lib/services/ProductService';
import { orderService } from '$lib/services/OrderService';
import { userService } from '$lib/services/UserService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const period = url.searchParams.get('period') || 'month'; // day, week, month, year
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const comparePeriod = url.searchParams.get('compare') === 'true';

		// Get all data
		const [allSales, allOrders, allUsers, allProducts] = await Promise.all([
			saleService.getAllSales({ startDate, endDate }),
			orderService.getAllOrders({ startDate, endDate }),
			userService.getAllUsers(),
			productService.getAllProducts()
		]);

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

		// Filter data by period
		const periodSales = allSales.filter((sale) => {
			if (!sale.created_at) return false;
			const saleDate = new Date(sale.created_at);
			return saleDate >= periodStart && saleDate <= periodEnd;
		});

		const periodOrders = allOrders.filter((order) => {
			if (!order.created_at) return false;
			const orderDate = new Date(order.created_at);
			return orderDate >= periodStart && orderDate <= periodEnd;
		});

		// Calculate previous period for comparison
		let previousPeriodSales: typeof allSales = [];
		let previousPeriodOrders: typeof allOrders = [];
		if (comparePeriod) {
			const periodDuration = periodEnd.getTime() - periodStart.getTime();
			const previousPeriodEnd = new Date(periodStart.getTime() - 1);
			const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);

			previousPeriodSales = allSales.filter((sale) => {
				if (!sale.created_at) return false;
				const saleDate = new Date(sale.created_at);
				return saleDate >= previousPeriodStart && saleDate <= previousPeriodEnd;
			});

			previousPeriodOrders = allOrders.filter((order) => {
				if (!order.created_at) return false;
				const orderDate = new Date(order.created_at);
				return orderDate >= previousPeriodStart && orderDate <= previousPeriodEnd;
			});
		}

		// Calculate KPIs
		const kpis = calculateKPIs({
			periodSales,
			periodOrders,
			allUsers,
			allProducts,
			previousPeriodSales: comparePeriod ? previousPeriodOrders : [],
			previousPeriodOrders: comparePeriod ? previousPeriodOrders : []
		});

		// Calculate conversion rate trends
		const conversionTrends = calculateConversionTrends(periodOrders, allUsers, period);

		// Calculate AOV trends
		const aovTrends = calculateAOVTrends(periodOrders, period);

		// Calculate customer retention metrics
		const retentionMetrics = calculateRetentionMetrics(allOrders, allUsers, periodStart, periodEnd);

		// Calculate gross margin analysis
		const grossMarginAnalysis = calculateGrossMarginAnalysis(periodSales, allProducts);

		// Time-based comparisons
		const timeComparisons = comparePeriod
			? {
					currentPeriod: {
						revenue: periodSales.reduce((sum, s) => sum + s.total_amount, 0),
						orders: periodOrders.length,
						averageOrderValue: periodOrders.length > 0
							? periodOrders.reduce((sum, o) => sum + o.total_amount, 0) / periodOrders.length
							: 0,
						conversionRate: kpis.conversionRate,
						customerRetention: kpis.customerRetention,
						grossMargin: kpis.grossMargin
					},
					previousPeriod: {
						revenue: previousPeriodSales.reduce((sum, s) => sum + s.total_amount, 0),
						orders: previousPeriodOrders.length,
						averageOrderValue: previousPeriodOrders.length > 0
							? previousPeriodOrders.reduce((sum, o) => sum + o.total_amount, 0) / previousPeriodOrders.length
							: 0,
						conversionRate: calculateKPIs({
							periodSales: previousPeriodSales,
							periodOrders: previousPeriodOrders,
							allUsers,
							allProducts,
							previousPeriodSales: [],
							previousPeriodOrders: []
						}).conversionRate,
						customerRetention: (() => {
							const periodDuration = periodEnd.getTime() - periodStart.getTime();
							const prevPeriodEnd = new Date(periodStart.getTime() - 1);
							const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodDuration);
							return calculateRetentionMetrics(allOrders, allUsers, prevPeriodStart, prevPeriodEnd).retentionRate;
						})(),
						grossMargin: calculateGrossMarginAnalysis(previousPeriodSales, allProducts).overallMargin
					}
				}
			: null;

		return {
			kpis,
			conversionTrends,
			aovTrends,
			retentionMetrics,
			grossMarginAnalysis,
			timeComparisons,
			period,
			periodStart: periodStart.toISOString(),
			periodEnd: periodEnd.toISOString(),
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			kpis: {
				conversionRate: 0,
				averageOrderValue: 0,
				customerRetention: 0,
				grossMargin: 0,
				repeatCustomerRate: 0,
				customerLifetimeValue: 0
			},
			conversionTrends: [],
			aovTrends: [],
			retentionMetrics: {
				retentionRate: 0,
				repeatCustomers: 0,
				newCustomers: 0,
				lostCustomers: 0,
				customerSegments: {
					champions: 0,
					loyal: 0,
					atRisk: 0,
					new: 0,
					lost: 0
					}
			},
			grossMarginAnalysis: {
				overallMargin: 0,
				marginByCategory: [],
				marginByProduct: []
			},
			timeComparisons: null,
			period: 'month',
			periodStart: new Date().toISOString(),
			periodEnd: new Date().toISOString(),
			error: message
		};
	}
};

function calculateKPIs({
	periodSales,
	periodOrders,
	allUsers,
	allProducts,
	previousPeriodSales,
	previousPeriodOrders
}: {
	periodSales: any[];
	periodOrders: any[];
	allUsers: any[];
	allProducts: any[];
	previousPeriodSales: any[];
	previousPeriodOrders: any[];
}) {
	// Conversion Rate: (Orders / Registered Users) * 100
	// Since we don't track visitors, we use registered users as proxy
	const totalUsers = allUsers.length;
	const conversionRate = totalUsers > 0 ? (periodOrders.length / totalUsers) * 100 : 0;

	// Average Order Value
	const totalRevenue = periodOrders.reduce((sum, o) => sum + o.total_amount, 0);
	const averageOrderValue = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0;

	// Customer Retention: Repeat customers / Total customers
	const uniqueCustomers = new Set(periodOrders.map((o) => o.user_id).filter(Boolean));
	const customerOrderCounts = new Map<string, number>();
	periodOrders.forEach((order) => {
		if (order.user_id) {
			customerOrderCounts.set(order.user_id, (customerOrderCounts.get(order.user_id) || 0) + 1);
		}
	});
	const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;
	const customerRetention = uniqueCustomers.size > 0 ? (repeatCustomers / uniqueCustomers.size) * 100 : 0;

	// Gross Margin: (Revenue - Cost) / Revenue * 100
	const totalCost = periodSales.reduce((sum, s) => sum + s.cost_price * s.quantity, 0);
	const totalRevenueFromSales = periodSales.reduce((sum, s) => sum + s.total_amount, 0);
	const grossMargin = totalRevenueFromSales > 0 ? ((totalRevenueFromSales - totalCost) / totalRevenueFromSales) * 100 : 0;

	// Repeat Customer Rate
	const repeatCustomerRate = uniqueCustomers.size > 0 ? (repeatCustomers / uniqueCustomers.size) * 100 : 0;

	// Customer Lifetime Value (simplified: average revenue per customer)
	const customerLifetimeValue = uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;

	return {
		conversionRate,
		averageOrderValue,
		customerRetention,
		grossMargin,
		repeatCustomerRate,
		customerLifetimeValue
	};
}

function calculateConversionTrends(orders: any[], users: any[], period: string): Array<{ date: string; rate: number }> {
	if (orders.length === 0) return [];

	const trends: Record<string, { orders: number; users: number }> = {};

	orders.forEach((order) => {
		if (!order.created_at) return;
		const date = new Date(order.created_at);
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
			trends[key] = { orders: 0, users: users.length };
		}
		trends[key].orders += 1;
	});

	return Object.entries(trends)
		.map(([date, data]) => ({
			date,
			rate: data.users > 0 ? (data.orders / data.users) * 100 : 0
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateAOVTrends(orders: any[], period: string): Array<{ date: string; aov: number }> {
	if (orders.length === 0) return [];

	const trends: Record<string, { total: number; count: number }> = {};

	orders.forEach((order) => {
		if (!order.created_at) return;
		const date = new Date(order.created_at);
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
			trends[key] = { total: 0, count: 0 };
		}
		trends[key].total += order.total_amount;
		trends[key].count += 1;
	});

	return Object.entries(trends)
		.map(([date, data]) => ({
			date,
			aov: data.count > 0 ? data.total / data.count : 0
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateRetentionMetrics(
	allOrders: any[],
	allUsers: any[],
	periodStart: Date,
	periodEnd: Date
): {
	retentionRate: number;
	repeatCustomers: number;
	newCustomers: number;
	lostCustomers: number;
	customerSegments: {
		champions: number;
		loyal: number;
		atRisk: number;
		new: number;
		lost: number;
	};
} {
	// Get orders in period
	const periodOrders = allOrders.filter((order) => {
		if (!order.created_at) return false;
		const orderDate = new Date(order.created_at);
		return orderDate >= periodStart && orderDate <= periodEnd;
	});

	// Get orders before period
	const previousPeriodEnd = new Date(periodStart.getTime() - 1);
	const previousPeriodStart = new Date(previousPeriodEnd.getTime() - (periodEnd.getTime() - periodStart.getTime()));
	const previousOrders = allOrders.filter((order) => {
		if (!order.created_at) return false;
		const orderDate = new Date(order.created_at);
		return orderDate >= previousPeriodStart && orderDate <= previousPeriodEnd;
	});

	// Customer analysis
	const periodCustomers = new Set(periodOrders.map((o) => o.user_id).filter(Boolean));
	const previousCustomers = new Set(previousOrders.map((o) => o.user_id).filter(Boolean));

	// New customers (in period but not in previous)
	const newCustomers = Array.from(periodCustomers).filter((id) => !previousCustomers.has(id)).length;

	// Lost customers (in previous but not in period)
	const lostCustomers = Array.from(previousCustomers).filter((id) => !periodCustomers.has(id)).length;

	// Repeat customers (customers with multiple orders in period)
	const customerOrderCounts = new Map<string, number>();
	periodOrders.forEach((order) => {
		if (order.user_id) {
			customerOrderCounts.set(order.user_id, (customerOrderCounts.get(order.user_id) || 0) + 1);
		}
	});
	const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;

	// Retention rate: (Returning customers / Previous customers) * 100
	const returningCustomers = Array.from(periodCustomers).filter((id) => previousCustomers.has(id)).length;
	const retentionRate = previousCustomers.size > 0 ? (returningCustomers / previousCustomers.size) * 100 : 0;

	// Customer segments (simplified RFM)
	const customerStats = new Map<string, { totalSpent: number; orderCount: number; lastOrder: Date }>();
	allOrders.forEach((order) => {
		if (!order.user_id || !order.created_at) return;
		const userId = order.user_id;
		if (!customerStats.has(userId)) {
			customerStats.set(userId, { totalSpent: 0, orderCount: 0, lastOrder: new Date(order.created_at) });
		}
		const stats = customerStats.get(userId)!;
		stats.totalSpent += order.total_amount;
		stats.orderCount += 1;
		if (new Date(order.created_at) > stats.lastOrder) {
			stats.lastOrder = new Date(order.created_at);
		}
	});

	const daysSincePeriodEnd = (now: Date, date: Date) => Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
	const now = new Date();

	let champions = 0;
	let loyal = 0;
	let atRisk = 0;
	let newCustomerSegments = 0;
	let lost = 0;

	customerStats.forEach((stats) => {
		const daysSinceLastOrder = daysSincePeriodEnd(now, stats.lastOrder);
		const avgOrderValue = stats.orderCount > 0 ? stats.totalSpent / stats.orderCount : 0;

		if (stats.orderCount >= 3 && avgOrderValue >= 1000 && daysSinceLastOrder <= 30) {
			champions++;
		} else if (stats.orderCount >= 2 && daysSinceLastOrder <= 60) {
			loyal++;
		} else if (daysSinceLastOrder > 90 && daysSinceLastOrder <= 180) {
			atRisk++;
		} else if (daysSinceLastOrder > 180) {
			lost++;
		} else if (stats.orderCount === 1 && daysSinceLastOrder <= 30) {
			newCustomerSegments++;
		}
	});

	return {
		retentionRate,
		repeatCustomers,
		newCustomers,
		lostCustomers,
		customerSegments: {
			champions,
			loyal,
			atRisk,
			new: newCustomerSegments,
			lost
		}
	};
}

function calculateGrossMarginAnalysis(sales: any[], products: any[]): {
	overallMargin: number;
	marginByCategory: Array<{ category: string; margin: number; revenue: number }>;
	marginByProduct: Array<{ productName: string; margin: number; revenue: number }>;
} {
	const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
	const totalCost = sales.reduce((sum, s) => sum + s.cost_price * s.quantity, 0);
	const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

	// Margin by category
	const categoryMap = new Map<string, { revenue: number; cost: number }>();
	sales.forEach((sale) => {
		const product = products.find((p) => p.id === sale.product_id);
		const category = product?.component_category_name || 'Uncategorized';
		if (!categoryMap.has(category)) {
			categoryMap.set(category, { revenue: 0, cost: 0 });
		}
		const cat = categoryMap.get(category)!;
		cat.revenue += sale.total_amount;
		cat.cost += sale.cost_price * sale.quantity;
	});

	const marginByCategory = Array.from(categoryMap.entries())
		.map(([category, data]) => ({
			category,
			margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0,
			revenue: data.revenue
		}))
		.sort((a, b) => b.revenue - a.revenue);

	// Margin by product (top 10)
	const productMap = new Map<string, { revenue: number; cost: number; name: string }>();
	sales.forEach((sale) => {
		const product = products.find((p) => p.id === sale.product_id);
		const productName = product?.name || sale.product_name || 'Unknown';
		if (!productMap.has(sale.product_id)) {
			productMap.set(sale.product_id, { revenue: 0, cost: 0, name: productName });
		}
		const prod = productMap.get(sale.product_id)!;
		prod.revenue += sale.total_amount;
		prod.cost += sale.cost_price * sale.quantity;
	});

	const marginByProduct = Array.from(productMap.values())
		.map((data) => ({
			productName: data.name,
			margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0,
			revenue: data.revenue
		}))
		.sort((a, b) => b.revenue - a.revenue)
		.slice(0, 10);

	return {
		overallMargin,
		marginByCategory,
		marginByProduct
	};
}

