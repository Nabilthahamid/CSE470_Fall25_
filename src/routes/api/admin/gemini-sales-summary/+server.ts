// API: Generate sales report summary using Gemini
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { aiService } from '$lib/services/AIService';
import { saleService } from '$lib/services/SaleService';

export const POST: RequestHandler = async ({ request, locals }) => {
	requireAdmin(locals.user);

	try {
		const { startDate, endDate } = await request.json();

		// Fetch sales data
		const sales = await saleService.getAllSales();
		
		// Filter by date range if provided
		let filteredSales = sales;
		if (startDate && endDate) {
			filteredSales = sales.filter(sale => {
				const saleDate = new Date(sale.created_at);
				return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
			});
		}

		// Calculate metrics
		const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_price, 0);
		const totalOrders = new Set(filteredSales.map(s => s.order_id)).size;

		// Get top products
		const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
		filteredSales.forEach(sale => {
			if (sale.items) {
				sale.items.forEach(item => {
					if (!productSales[item.product_id]) {
						productSales[item.product_id] = {
							name: item.product_name,
							quantity: 0,
							revenue: 0
						};
					}
					productSales[item.product_id].quantity += item.quantity;
					productSales[item.product_id].revenue += item.total_price;
				});
			}
		});

		const topProducts = Object.values(productSales)
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 10);

		// Detect trends
		const recentSales = filteredSales.slice(-30);
		const olderSales = filteredSales.slice(-60, -30);
		const recentRevenue = recentSales.reduce((sum, s) => sum + s.total_price, 0);
		const olderRevenue = olderSales.reduce((sum, s) => sum + s.total_price, 0);
		
		let trends = 'Stable sales performance.';
		if (recentRevenue > olderRevenue * 1.1) {
			trends = 'Strong upward trend in sales.';
		} else if (recentRevenue < olderRevenue * 0.9) {
			trends = 'Declining sales trend detected.';
		}

		// Generate summary
		const period = startDate && endDate 
			? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
			: 'All Time';

		const summary = await aiService.generateSalesReportSummary({
			totalRevenue,
			totalOrders,
			period,
			topProducts,
			trends
		});

		return json({ summary, error: null });
	} catch (error: any) {
		console.error('Error generating sales summary:', error);
		return json(
			{ summary: null, error: error.message || 'Failed to generate sales summary' },
			{ status: 500 }
		);
	}
};

