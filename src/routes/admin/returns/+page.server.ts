// CONTROLLER: Returns & Refunds Management Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { returnService } from '$lib/services/ReturnService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const status = url.searchParams.get('status') || undefined;
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const activeTab = url.searchParams.get('tab') || 'requests';

		const [returns, reasons, analytics] = await Promise.all([
			returnService.getAllReturns({ status, startDate, endDate }),
			returnService.getReturnReasons(),
			returnService.getReturnAnalytics(startDate, endDate)
		]);

		return {
			activeTab,
			returns,
			reasons,
			analytics,
			filters: { status, startDate, endDate },
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			activeTab: 'requests',
			returns: [],
			reasons: [],
			analytics: {
				totalReturns: 0,
				returnRate: 0,
				byReason: [],
				byStatus: [],
				totalRefunded: 0,
				averageRefundAmount: 0,
				byMonth: []
			},
			filters: { status: undefined, startDate: undefined, endDate: undefined },
			error: message
		};
	}
};

export const actions: Actions = {
	approveReturn: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const adminNotes = formData.get('admin_notes')?.toString() || undefined;

		try {
			await returnService.approveReturn(id, adminNotes);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	rejectReturn: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const adminNotes = formData.get('admin_notes')?.toString() || undefined;

		try {
			await returnService.rejectReturn(id, adminNotes);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	processRefund: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const refundAmount = parseFloat(formData.get('refund_amount')?.toString() || '0');
		const refundMethod = formData.get('refund_method')?.toString() || '';
		const adminNotes = formData.get('admin_notes')?.toString() || undefined;

		try {
			await returnService.processRefund(id, refundAmount, refundMethod, adminNotes);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	completeReturn: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await returnService.completeReturn(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

