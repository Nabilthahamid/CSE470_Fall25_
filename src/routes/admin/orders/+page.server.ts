// CONTROLLER: Admin orders management page
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { orderService } from '$lib/services/OrderService';
import { aiService } from '$lib/services/AIService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const statusFilter = url.searchParams.get('status') as any;
		const searchQuery = url.searchParams.get('search') || '';
		const startDate = url.searchParams.get('startDate') || '';
		const endDate = url.searchParams.get('endDate') || '';

		// Build filters
		const filters: any = {};
		if (statusFilter) {
			filters.status = statusFilter;
		}
		if (startDate) {
			filters.startDate = startDate;
		}
		if (endDate) {
			filters.endDate = endDate;
		}

		let orders = await orderService.getAllOrders(Object.keys(filters).length > 0 ? filters : undefined);

		// Apply search filter (client-side for now, can be moved to server-side)
		if (searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase();
			orders = orders.filter(order => 
				order.id.toLowerCase().includes(searchLower) ||
				order.customer_name?.toLowerCase().includes(searchLower) ||
				order.customer_email?.toLowerCase().includes(searchLower) ||
				order.tracking_number?.toLowerCase().includes(searchLower)
			);
		}

		// Calculate risk scores for orders (non-blocking, catch errors gracefully)
		const orderRiskScores = new Map<string, any>();
		try {
			const riskScores = await Promise.all(
				orders.map(async (order) => {
					try {
						const riskScore = await aiService.scoreOrderRisk(order);
						return { orderId: order.id, riskScore };
					} catch (error) {
						console.error(`Error calculating risk for order ${order.id}:`, error);
						return null;
					}
				})
			);
			riskScores.forEach(rs => {
				if (rs) orderRiskScores.set(rs.orderId, rs.riskScore);
			});
		} catch (error) {
			console.error('Error calculating order risk scores:', error);
			// Continue without risk scores
		}

		return {
			orders,
			orderRiskScores: Object.fromEntries(orderRiskScores),
			user: locals.user,
			currentFilter: statusFilter || 'all',
			searchQuery,
			filters: {
				startDate,
				endDate
			}
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			orders: [],
			user: locals.user,
			currentFilter: 'all',
			searchQuery: '',
			filters: {
				startDate: '',
				endDate: ''
			},
			error: message
		};
	}
};

export const actions: Actions = {
	updateStatus: async ({ request, locals, url }) => {
		requireAdmin(locals.user);

		const formData = await request.formData();
		const orderId = formData.get('order_id')?.toString();
		const status = formData.get('status')?.toString();
		const trackingNumber = formData.get('tracking_number')?.toString() || undefined;
		const notes = formData.get('notes')?.toString() || undefined;

		if (!orderId || !status) {
			return {
				error: 'Order ID and status are required'
			};
		}

		try {
			await orderService.updateOrderStatus(
				orderId,
				status as any,
				trackingNumber,
				notes,
				locals.user.id
			);

			// Redirect to reload page with fresh data
			const statusFilter = url.searchParams.get('status');
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
			const { message } = handleError(error);
			return {
				error: message
			};
		}
	}
};

