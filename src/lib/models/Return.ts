// MODEL: Returns & Refunds data structures
export interface ReturnRequest {
	id?: string;
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
}

export interface ReturnReason {
	id?: string;
	reason: string;
	category: string;
	count: number;
}

export interface CreateReturnRequestDTO {
	order_id: string;
	product_id: string;
	quantity: number;
	reason: string;
	notes?: string;
}

export interface UpdateReturnRequestDTO {
	status?: 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed';
	refund_amount?: number;
	refund_method?: string;
	admin_notes?: string;
}

export interface ReturnAnalytics {
	totalReturns: number;
	returnRate: number;
	byReason: Array<{ reason: string; count: number; percentage: number }>;
	byStatus: Array<{ status: string; count: number; percentage: number }>;
	totalRefunded: number;
	averageRefundAmount: number;
	byMonth: Array<{ month: string; count: number; refunded: number }>;
}

