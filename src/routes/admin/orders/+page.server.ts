// CONTROLLER: Admin orders management page
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { orderService } from '$lib/services/OrderService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const statusFilter = url.searchParams.get('status') as any;
		const orders = await orderService.getAllOrders(
			statusFilter ? { status: statusFilter } : undefined
		);

		return {
			orders,
			user: locals.user,
			currentFilter: statusFilter || 'all'
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			orders: [],
			user: locals.user,
			currentFilter: 'all',
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

