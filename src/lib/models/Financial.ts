// MODEL: Financial Management data structures
export interface Expense {
	id?: string;
	category: string;
	description: string;
	amount: number;
	date: string;
	payment_method?: string;
	receipt_url?: string;
	notes?: string;
	created_at?: string;
	updated_at?: string;
}

export interface PaymentTransaction {
	id?: string;
	order_id?: string;
	user_id?: string;
	amount: number;
	payment_method: string;
	status: 'pending' | 'completed' | 'failed' | 'refunded';
	transaction_id?: string;
	gateway_response?: string;
	failed_reason?: string;
	created_at?: string;
	updated_at?: string;
}

export interface FinancialStatement {
	period: string;
	start_date: string;
	end_date: string;
	total_revenue: number;
	total_expenses: number;
	net_profit: number;
	tax_amount: number;
	revenue_by_category: Array<{ category: string; amount: number }>;
	expenses_by_category: Array<{ category: string; amount: number }>;
}

export interface CreateExpenseDTO {
	category: string;
	description: string;
	amount: number;
	date: string;
	payment_method?: string;
	receipt_url?: string;
	notes?: string;
}

export interface UpdateExpenseDTO {
	category?: string;
	description?: string;
	amount?: number;
	date?: string;
	payment_method?: string;
	receipt_url?: string;
	notes?: string;
}

