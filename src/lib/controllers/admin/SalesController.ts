// CONTROLLER: Sales report controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { SaleModel } from '$lib/models/SaleModel';

export class SalesController extends BaseController {
	/**
	 * Load sales report with filters
	 */
	async loadSalesReport() {
		requireAdmin(this.getUser());

		try {
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const productId = this.getQueryParam('productId') || undefined;

			const filters: any = {};
			if (startDate) filters.startDate = startDate;
			if (endDate) filters.endDate = endDate;
			if (productId) filters.productId = productId;

			const sales = await SaleModel.getAll(filters, true); // Exclude cancelled orders

			return {
				sales: sales.map((s) => s.toJSON()),
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				sales: [],
				error: message
			};
		}
	}

	/**
	 * Export sales report as CSV
	 */
	async exportSalesReport() {
		requireAdmin(this.getUser());

		try {
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const productId = this.getQueryParam('productId') || undefined;

			const filters: any = {};
			if (startDate) filters.startDate = startDate;
			if (endDate) filters.endDate = endDate;
			if (productId) filters.productId = productId;

			const csvContent = await SaleModel.exportSalesReport(filters, true);
			return {
				csvContent,
				filename: `sales-report-${new Date().toISOString().split('T')[0]}.csv`
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Load profit/loss report
	 */
	async loadProfitLossReport() {
		requireAdmin(this.getUser());

		try {
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const productId = this.getQueryParam('productId') || undefined;

			const filters: any = {};
			if (startDate) filters.startDate = startDate;
			if (endDate) filters.endDate = endDate;
			if (productId) filters.productId = productId;

			const report = await SaleModel.getProfitLossReport(filters);

			return {
				report,
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				report: {
					totalSales: 0,
					totalCost: 0,
					totalProfit: 0,
					totalLoss: 0,
					netProfit: 0,
					sales: [],
					productBreakdown: []
				},
				error: message
			};
		}
	}

	/**
	 * Export profit/loss report as CSV
	 */
	async exportProfitLossReport() {
		requireAdmin(this.getUser());

		try {
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const productId = this.getQueryParam('productId') || undefined;

			const filters: any = {};
			if (startDate) filters.startDate = startDate;
			if (endDate) filters.endDate = endDate;
			if (productId) filters.productId = productId;

			const csvContent = await SaleModel.exportSalesReport(filters, true);
			return {
				csvContent,
				filename: `profit-loss-report-${new Date().toISOString().split('T')[0]}.csv`
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}

