// CONTROLLER: Admin order management controller (Pure MVC)
import { redirect } from '@sveltejs/kit';
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { OrderModel } from '$lib/models/OrderModel';
import { scoreOrderRisk } from '$lib/utils/ai';

export class OrderController extends BaseController {
	/**
	 * Load orders list with filters
	 */
	async loadOrdersList() {
		requireAdmin(this.getUser());

		try {
			const statusFilter = this.getQueryParam('status') as any;
			const searchQuery = this.getQueryParam('search');
			const startDate = this.getQueryParam('startDate');
			const endDate = this.getQueryParam('endDate');

			// Build filters
			const filters: any = {};
			if (statusFilter) filters.status = statusFilter;
			if (startDate) filters.startDate = startDate;
			if (endDate) filters.endDate = endDate;

			let orders = await OrderModel.getAll(Object.keys(filters).length > 0 ? filters : undefined);

			// Apply search filter
			if (searchQuery.trim()) {
				const searchLower = searchQuery.toLowerCase();
				orders = orders.filter(
					(order) =>
						order.id.toLowerCase().includes(searchLower) ||
						order.customer_name?.toLowerCase().includes(searchLower) ||
						order.customer_email?.toLowerCase().includes(searchLower) ||
						order.tracking_number?.toLowerCase().includes(searchLower)
				);
			}

			// Calculate risk scores for orders (non-blocking)
			const orderRiskScores = new Map<string, any>();
			try {
				const riskScores = await Promise.all(
					orders.map(async (order) => {
						try {
							const riskScore = await scoreOrderRisk(order.toJSON());
							return { orderId: order.id, riskScore };
						} catch (error) {
							console.error(`Error calculating risk for order ${order.id}:`, error);
							return null;
						}
					})
				);
				riskScores.forEach((rs) => {
					if (rs) orderRiskScores.set(rs.orderId, rs.riskScore);
				});
			} catch (error) {
				console.error('Error calculating order risk scores:', error);
			}

			return {
				orders: orders.map((o) => o.toJSON()),
				orderRiskScores: Object.fromEntries(orderRiskScores),
				user: this.getUser(),
				currentFilter: statusFilter || 'all',
				searchQuery,
				filters: { startDate, endDate }
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				orders: [],
				user: this.getUser(),
				currentFilter: 'all',
				searchQuery: '',
				filters: { startDate: '', endDate: '' },
				error: message
			};
		}
	}

	/**
	 * Update order status
	 */
	async updateOrderStatus() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();

		const orderId = formData.get('order_id')?.toString();
		const status = formData.get('status')?.toString();
		const trackingNumber = formData.get('tracking_number')?.toString() || undefined;
		const notes = formData.get('notes')?.toString() || undefined;

		if (!orderId || !status) {
			return { error: 'Order ID and status are required' };
		}

		try {
			const order = await OrderModel.getById(orderId);
			if (!order) {
				return { error: 'Order not found' };
			}

			await order.updateStatus(status as any, trackingNumber, notes, this.getUser()?.id);

			// Redirect to reload page with fresh data
			const statusFilter = this.getQueryParam('status');
			if (statusFilter) {
				throw redirect(303, `/admin/orders?status=${statusFilter}&updated=true`);
			} else {
				throw redirect(303, '/admin/orders?updated=true');
			}
		} catch (error) {
			// Re-throw redirects
			if (error && typeof error === 'object' && 'status' in error) {
				throw error;
			}
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Load single order details
	 */
	async loadOrderDetails(orderId: string) {
		requireAdmin(this.getUser());

		try {
			const order = await OrderModel.getById(orderId);
			if (!order) {
				return {
					order: null,
					error: 'Order not found'
				};
			}

			return {
				order: order.toJSON(),
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				order: null,
				error: message
			};
		}
	}
}
