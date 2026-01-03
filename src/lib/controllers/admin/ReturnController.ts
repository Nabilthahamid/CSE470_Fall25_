// CONTROLLER: Return management controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { ReturnModel } from '$lib/models/ReturnModel';

export class ReturnController extends BaseController {
	/**
	 * Load returns list with filters
	 */
	async loadReturns() {
		requireAdmin(this.getUser());

		try {
			const status = this.getQueryParam('status') || undefined;
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const activeTab = this.getQueryParam('tab', 'requests');

			const [returns, reasons, analytics] = await Promise.all([
				ReturnModel.getAll({ status, startDate, endDate }),
				ReturnModel.getReturnReasons(),
				ReturnModel.getReturnAnalytics(startDate, endDate)
			]);

			return {
				activeTab,
				returns: returns.map((r) => r.toJSON()),
				reasons,
				analytics,
				filters: { status, startDate, endDate },
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
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
	}

	/**
	 * Approve return request
	 */
	async approveReturn() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';
		const adminNotes = formData.get('admin_notes')?.toString() || undefined;

		try {
			const returnRequest = await ReturnModel.getById(id);
			if (!returnRequest) {
				return { error: 'Return request not found' };
			}
			await returnRequest.approve(adminNotes);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Reject return request
	 */
	async rejectReturn() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';
		const adminNotes = formData.get('admin_notes')?.toString() || undefined;

		try {
			const returnRequest = await ReturnModel.getById(id);
			if (!returnRequest) {
				return { error: 'Return request not found' };
			}
			await returnRequest.reject(adminNotes);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Process refund
	 */
	async processRefund() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';
		const refundAmount = parseFloat(formData.get('refund_amount')?.toString() || '0');
		const refundMethod = formData.get('refund_method')?.toString() || '';
		const adminNotes = formData.get('admin_notes')?.toString() || undefined;

		try {
			const returnRequest = await ReturnModel.getById(id);
			if (!returnRequest) {
				return { error: 'Return request not found' };
			}
			await returnRequest.processRefund(refundAmount, refundMethod, adminNotes);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Complete return
	 */
	async completeReturn() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';

		try {
			const returnRequest = await ReturnModel.getById(id);
			if (!returnRequest) {
				return { error: 'Return request not found' };
			}
			await returnRequest.complete();
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}

