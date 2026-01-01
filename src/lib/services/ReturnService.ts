// SERVICE: Returns & Refunds Management
import { supabase } from '$lib/config/supabase';
import { orderService } from './OrderService';
import type {
	ReturnRequest,
	ReturnReason,
	CreateReturnRequestDTO,
	UpdateReturnRequestDTO,
	ReturnAnalytics
} from '$lib/models/Return';

export class ReturnService {
	/**
	 * Get all return requests
	 */
	async getAllReturns(filters?: {
		status?: string;
		orderId?: string;
		userId?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<ReturnRequest[]> {
		try {
			let query = supabase.from('return_requests').select('*').order('created_at', { ascending: false });

			if (filters?.status) {
				query = query.eq('status', filters.status);
			}
			if (filters?.orderId) {
				query = query.eq('order_id', filters.orderId);
			}
			if (filters?.userId) {
				query = query.eq('user_id', filters.userId);
			}
			if (filters?.startDate) {
				query = query.gte('created_at', filters.startDate);
			}
			if (filters?.endDate) {
				query = query.lte('created_at', filters.endDate);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01') return []; // Table doesn't exist
				throw new Error(`Failed to fetch returns: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get return request by ID
	 */
	async getReturnById(id: string): Promise<ReturnRequest | null> {
		const { data, error } = await supabase.from('return_requests').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch return: ${error.message}`);
		}
		return data;
	}

	/**
	 * Create return request
	 */
	async createReturnRequest(returnRequest: CreateReturnRequestDTO, userId: string): Promise<ReturnRequest> {
		// Get order to validate
		const order = await orderService.getOrderById(returnRequest.order_id);
		if (!order) {
			throw new Error('Order not found');
		}

		const { data, error } = await supabase
			.from('return_requests')
			.insert({
				...returnRequest,
				user_id: userId,
				status: 'pending',
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create return request: ${error.message}`);
		return data;
	}

	/**
	 * Update return request
	 */
	async updateReturnRequest(id: string, update: UpdateReturnRequestDTO): Promise<ReturnRequest> {
		const { data, error } = await supabase
			.from('return_requests')
			.update({ ...update, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update return request: ${error.message}`);
		return data;
	}

	/**
	 * Process refund
	 */
	async processRefund(
		returnId: string,
		refundAmount: number,
		refundMethod: string,
		adminNotes?: string
	): Promise<ReturnRequest> {
		const returnRequest = await this.getReturnById(returnId);
		if (!returnRequest) {
			throw new Error('Return request not found');
		}

		// Update return status to refunded
		const updated = await this.updateReturnRequest(returnId, {
			status: 'refunded',
			refund_amount: refundAmount,
			refund_method: refundMethod,
			admin_notes: adminNotes
		});

		// Here you would integrate with payment gateway to process actual refund
		// For now, we just update the status

		return updated;
	}

	/**
	 * Approve return request
	 */
	async approveReturn(id: string, adminNotes?: string): Promise<ReturnRequest> {
		return this.updateReturnRequest(id, {
			status: 'approved',
			admin_notes: adminNotes
		});
	}

	/**
	 * Reject return request
	 */
	async rejectReturn(id: string, adminNotes?: string): Promise<ReturnRequest> {
		return this.updateReturnRequest(id, {
			status: 'rejected',
			admin_notes: adminNotes
		});
	}

	/**
	 * Complete return (after item received)
	 */
	async completeReturn(id: string): Promise<ReturnRequest> {
		return this.updateReturnRequest(id, {
			status: 'completed'
		});
	}

	/**
	 * Get return reasons analytics
	 */
	async getReturnReasons(): Promise<ReturnReason[]> {
		const returns = await this.getAllReturns();
		const reasonMap = new Map<string, { reason: string; category: string; count: number }>();

		returns.forEach((r) => {
			const existing = reasonMap.get(r.reason) || { reason: r.reason, category: 'Other', count: 0 };
			reasonMap.set(r.reason, { ...existing, count: existing.count + 1 });
		});

		return Array.from(reasonMap.values()).map((r) => ({
			reason: r.reason,
			category: r.category,
			count: r.count
		}));
	}

	/**
	 * Get return analytics
	 */
	async getReturnAnalytics(startDate?: string, endDate?: string): Promise<ReturnAnalytics> {
		const returns = await this.getAllReturns({ startDate, endDate });
		const orders = await orderService.getAllOrders({ startDate, endDate });

		const totalReturns = returns.length;
		const totalOrders = orders.length;
		const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;

		// By reason
		const reasonMap = new Map<string, number>();
		returns.forEach((r) => {
			reasonMap.set(r.reason, (reasonMap.get(r.reason) || 0) + 1);
		});

		const byReason = Array.from(reasonMap.entries()).map(([reason, count]) => ({
			reason,
			count,
			percentage: totalReturns > 0 ? (count / totalReturns) * 100 : 0
		}));

		// By status
		const statusMap = new Map<string, number>();
		returns.forEach((r) => {
			statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
		});

		const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
			status,
			count,
			percentage: totalReturns > 0 ? (count / totalReturns) * 100 : 0
		}));

		// Refund statistics
		const refundedReturns = returns.filter((r) => r.status === 'refunded' && r.refund_amount);
		const totalRefunded = refundedReturns.reduce((sum, r) => sum + (r.refund_amount || 0), 0);
		const averageRefundAmount =
			refundedReturns.length > 0 ? totalRefunded / refundedReturns.length : 0;

		// By month
		const monthlyMap = new Map<string, { count: number; refunded: number }>();
		returns.forEach((r) => {
			if (!r.created_at) return;
			const date = new Date(r.created_at);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const existing = monthlyMap.get(monthKey) || { count: 0, refunded: 0 };
			monthlyMap.set(monthKey, {
				count: existing.count + 1,
				refunded: existing.refunded + (r.refund_amount || 0)
			});
		});

		const byMonth = Array.from(monthlyMap.entries())
			.map(([month, data]) => ({ month, ...data }))
			.sort((a, b) => a.month.localeCompare(b.month));

		return {
			totalReturns,
			returnRate,
			byReason,
			byStatus,
			totalRefunded,
			averageRefundAmount,
			byMonth
		};
	}
}

export const returnService = new ReturnService();

