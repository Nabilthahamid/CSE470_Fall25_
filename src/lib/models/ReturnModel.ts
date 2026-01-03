// MODEL: Return Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type {
	ReturnRequest,
	ReturnReason,
	CreateReturnRequestDTO,
	UpdateReturnRequestDTO,
	ReturnAnalytics
} from './Return';
import { OrderModel } from './OrderModel';
import { ProductModel } from './ProductModel';
import { SaleModel } from './SaleModel';

export class ReturnModel {
	// Data properties
	id: string;
	order_id: string;
	user_id: string;
	product_id: string;
	quantity: number;
	reason: string;
	status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed';
	refund_amount?: number;
	refund_method?: string;
	notes?: string;
	admin_notes?: string;
	created_at?: string;
	updated_at?: string;

	constructor(data: ReturnRequest) {
		this.id = data.id || '';
		this.order_id = data.order_id;
		this.user_id = data.user_id;
		this.product_id = data.product_id;
		this.quantity = data.quantity;
		this.reason = data.reason;
		this.status = data.status;
		this.refund_amount = data.refund_amount;
		this.refund_method = data.refund_method;
		this.notes = data.notes;
		this.admin_notes = data.admin_notes;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.order_id) throw new Error('Order ID is required');
		if (!this.user_id) throw new Error('User ID is required');
		if (!this.product_id) throw new Error('Product ID is required');
		if (!this.quantity || this.quantity < 1) {
			throw new Error('Quantity must be at least 1');
		}
		if (!this.reason || this.reason.trim().length < 3) {
			throw new Error('Return reason must be at least 3 characters');
		}
	}

	// DATA ACCESS: Get all returns (static method)
	static async getAll(filters?: {
		status?: string;
		orderId?: string;
		userId?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<ReturnModel[]> {
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

			return (data || []).map((item) => new ReturnModel(item as ReturnRequest));
		} catch (error) {
			return [];
		}
	}

	// DATA ACCESS: Get return by ID (static method)
	static async getById(id: string): Promise<ReturnModel | null> {
		if (!id) throw new Error('Return ID is required');

		const { data, error } = await supabase
			.from('return_requests')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch return: ${error.message}`);
		}

		return data ? new ReturnModel(data as ReturnRequest) : null;
	}

	// DATA ACCESS: Create return request (static method)
	static async create(input: CreateReturnRequestDTO, userId: string): Promise<ReturnModel> {
		// BUSINESS LOGIC: Validate order exists
		const order = await OrderModel.getById(input.order_id);
		if (!order) {
			throw new Error('Order not found');
		}

		// BUSINESS LOGIC: Validate
		if (!input.order_id) throw new Error('Order ID is required');
		if (!input.product_id) throw new Error('Product ID is required');
		if (!input.quantity || input.quantity < 1) {
			throw new Error('Quantity must be at least 1');
		}
		if (!input.reason || input.reason.trim().length < 3) {
			throw new Error('Return reason must be at least 3 characters');
		}

		// DATA ACCESS: Create return request
		const { data, error } = await supabase
			.from('return_requests')
			.insert({
				...input,
				user_id: userId,
				status: 'pending',
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create return request: ${error.message}`);

		return new ReturnModel(data as ReturnRequest);
	}

	// DATA ACCESS: Update return request (instance method)
	async update(input: UpdateReturnRequestDTO): Promise<ReturnModel> {
		// DATA ACCESS: Update in database
		const { data, error } = await supabase
			.from('return_requests')
			.update({ ...input, updated_at: new Date().toISOString() })
			.eq('id', this.id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update return request: ${error.message}`);

		// Update instance properties
		if (input.status) this.status = input.status;
		if (input.refund_amount !== undefined) this.refund_amount = input.refund_amount;
		if (input.refund_method) this.refund_method = input.refund_method;
		if (input.admin_notes !== undefined) this.admin_notes = input.admin_notes;

		return new ReturnModel(data as ReturnRequest);
	}

	// BUSINESS LOGIC: Approve return request (instance method)
	async approve(adminNotes?: string): Promise<ReturnModel> {
		return this.update({
			status: 'approved',
			admin_notes: adminNotes
		});
	}

	// BUSINESS LOGIC: Reject return request (instance method)
	async reject(adminNotes?: string): Promise<ReturnModel> {
		return this.update({
			status: 'rejected',
			admin_notes: adminNotes
		});
	}

	// BUSINESS LOGIC: Process refund (instance method)
	async processRefund(refundAmount: number, refundMethod: string, adminNotes?: string): Promise<ReturnModel> {
		// BUSINESS LOGIC: Validate refund amount
		if (refundAmount <= 0) {
			throw new Error('Refund amount must be greater than 0');
		}

		// Update return status to refunded
		return this.update({
			status: 'refunded',
			refund_amount: refundAmount,
			refund_method: refundMethod,
			admin_notes: adminNotes
		});
	}

	// BUSINESS LOGIC: Complete return (instance method)
	async complete(): Promise<ReturnModel> {
		// BUSINESS LOGIC: Restore stock for returned items
		try {
			const product = await ProductModel.getById(this.product_id);
			if (product) {
				await product.update({ stock: (product.stock || 0) + this.quantity });
			}
		} catch (error) {
			console.error('Failed to restore stock for return:', error);
			// Continue - stock restoration failure shouldn't block return completion
		}

		// BUSINESS LOGIC: Adjust sales records for this order item
		try {
			const sales = await SaleModel.getByOrderId(this.order_id);
			const matchingSales = sales.filter(
				(s) => s.product_id === this.product_id && s.order_id === this.order_id
			);

			if (matchingSales.length > 0) {
				const matchingSale = matchingSales.find((s) => s.quantity === this.quantity);
				if (matchingSale) {
					// Exact quantity match: delete the sale
					await matchingSale.delete();
				} else if (matchingSales[0].quantity > this.quantity) {
					// Partial return: update quantity
					const sale = matchingSales[0];
					const newQuantity = sale.quantity - this.quantity;
					const newTotalAmount = sale.sale_price * newQuantity;
					const newProfit = (sale.sale_price - sale.cost_price) * newQuantity;

					// Update sale (we need to update the SaleModel)
					// Since SaleModel doesn't have update method, we'll delete and recreate
					await sale.delete();
					await SaleModel.create({
						product_id: sale.product_id,
						user_id: sale.user_id,
						order_id: sale.order_id,
						quantity: newQuantity,
						skipStockCheck: true
					});
				}
			}
		} catch (error) {
			console.error('Failed to adjust sales for return:', error);
			// Continue - sales adjustment failure shouldn't block return completion
		}

		// Update status to completed
		return this.update({
			status: 'completed'
		});
	}

	// BUSINESS LOGIC: Get return reasons analytics (static method)
	static async getReturnReasons(): Promise<ReturnReason[]> {
		const returns = await this.getAll();
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

	// BUSINESS LOGIC: Get return analytics (static method)
	static async getReturnAnalytics(startDate?: string, endDate?: string): Promise<ReturnAnalytics> {
		const returns = await this.getAll({ startDate, endDate });
		const orders = await OrderModel.getAll({ startDate, endDate });

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

	// Convert to plain object (for compatibility)
	toJSON(): ReturnRequest {
		return {
			id: this.id,
			order_id: this.order_id,
			user_id: this.user_id,
			product_id: this.product_id,
			quantity: this.quantity,
			reason: this.reason,
			status: this.status,
			refund_amount: this.refund_amount,
			refund_method: this.refund_method,
			notes: this.notes,
			admin_notes: this.admin_notes,
			created_at: this.created_at,
			updated_at: this.updated_at
		};
	}
}

