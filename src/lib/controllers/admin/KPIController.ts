// CONTROLLER: KPI Dashboard controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { SaleModel } from '$lib/models/SaleModel';
import { ProductModel } from '$lib/models/ProductModel';
import { OrderModel } from '$lib/models/OrderModel';
import { UserModel } from '$lib/models/UserModel';

// Helper functions
function calculateKPIs(data: any) {
	const { periodSales, periodOrders, allUsers, allProducts, previousPeriodSales, previousPeriodOrders } = data;

	const totalRevenue = periodSales.reduce((sum: number, s: any) => sum + s.total_amount, 0);
	const totalOrders = periodOrders.length;
	const totalCustomers = allUsers.length;
	const totalProducts = allProducts.length;
	const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
	const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

	const previousRevenue = previousPeriodSales?.reduce((sum: number, s: any) => sum + s.total_amount, 0) || 0;
	const previousOrders = previousPeriodOrders?.length || 0;
	const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

	return {
		totalRevenue,
		totalOrders,
		totalCustomers,
		totalProducts,
		averageOrderValue,
		conversionRate,
		revenueGrowth: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
		ordersGrowth: previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0,
		aovGrowth: previousAOV > 0 ? ((averageOrderValue - previousAOV) / previousAOV) * 100 : 0
	};
}

function calculateConversionTrends(orders: any[], users: any[], period: string) {
	// Simplified - return empty array for now, can be enhanced
	return [];
}

function calculateAOVTrends(orders: any[], period: string) {
	// Simplified - return empty array for now, can be enhanced
	return [];
}

export class KPIController extends BaseController {
	/**
	 * Load KPI dashboard data
	 */
	async loadKPIDashboard() {
		requireAdmin(this.getUser());

		try {
			const period = this.getQueryParam('period', 'month');
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const comparePeriod = this.getQueryParam('compare') === 'true';

			// Get all data (exclude cancelled orders from sales)
			const [allSalesModels, allOrdersModels, allUsersModels, allProductsModels] = await Promise.all([
				SaleModel.getAll({ startDate, endDate }, true),
				OrderModel.getAll({ startDate, endDate }),
				UserModel.getAll(),
				ProductModel.getAll()
			]);

			const allSales = allSalesModels.map((s) => s.toJSON());
			const allOrders = allOrdersModels.map((o) => o.toJSON());
			const allUsers = allUsersModels.map((u) => u.toJSON());
			const allProducts = allProductsModels.map((p) => p.toJSON());

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
				previousPeriodSales: comparePeriod ? previousPeriodSales : [],
				previousPeriodOrders: comparePeriod ? previousPeriodOrders : []
			});

			// Calculate conversion rate trends
			const conversionTrends = calculateConversionTrends(periodOrders, allUsers, period);

			// Calculate AOV trends
			const aovTrends = calculateAOVTrends(periodOrders, period);

			return {
				kpis,
				conversionTrends,
				aovTrends,
				period,
				periodStart: periodStart.toISOString(),
				periodEnd: periodEnd.toISOString(),
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				kpis: {
					totalRevenue: 0,
					totalOrders: 0,
					totalCustomers: 0,
					totalProducts: 0,
					averageOrderValue: 0,
					conversionRate: 0,
					revenueGrowth: 0,
					ordersGrowth: 0,
					aovGrowth: 0
				},
				conversionTrends: [],
				aovTrends: [],
				period: 'month',
				periodStart: new Date().toISOString(),
				periodEnd: new Date().toISOString(),
				error: message
			};
		}
	}
}

