// MODEL: Financial Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type {
	Expense,
	PaymentTransaction,
	FinancialStatement,
	CreateExpenseDTO,
	UpdateExpenseDTO
} from './Financial';
import { SaleModel } from './SaleModel';
import { OrderModel } from './OrderModel';

export class ExpenseModel {
	// Data properties
	id: string;
	category: string;
	description: string;
	amount: number;
	date: string;
	payment_method?: string;
	receipt_url?: string;
	notes?: string;
	created_at?: string;
	updated_at?: string;

	constructor(data: Expense) {
		this.id = data.id || '';
		this.category = data.category;
		this.description = data.description;
		this.amount = data.amount;
		this.date = data.date;
		this.payment_method = data.payment_method;
		this.receipt_url = data.receipt_url;
		this.notes = data.notes;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	// BUSINESS LOGIC: Validation
	validate(): void {
		if (!this.category || this.category.trim().length < 2) {
			throw new Error('Category must be at least 2 characters');
		}
		if (!this.description || this.description.trim().length < 3) {
			throw new Error('Description must be at least 3 characters');
		}
		if (this.amount <= 0) {
			throw new Error('Amount must be greater than 0');
		}
	}

	// DATA ACCESS: Get all expenses (static method)
	static async getAll(startDate?: string, endDate?: string): Promise<ExpenseModel[]> {
		try {
			let query = supabase.from('expenses').select('*').order('date', { ascending: false });

			if (startDate) {
				query = query.gte('date', startDate);
			}
			if (endDate) {
				query = query.lte('date', endDate);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch expenses: ${error.message}`);
			}

			return (data || []).map((item) => new ExpenseModel(item as Expense));
		} catch (error) {
			return [];
		}
	}

	// DATA ACCESS: Get expense by ID (static method)
	static async getById(id: string): Promise<ExpenseModel | null> {
		if (!id) throw new Error('Expense ID is required');

		const { data, error } = await supabase
			.from('expenses')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch expense: ${error.message}`);
		}

		return data ? new ExpenseModel(data as Expense) : null;
	}

	// DATA ACCESS: Create expense (static method)
	static async create(input: CreateExpenseDTO): Promise<ExpenseModel> {
		// BUSINESS LOGIC: Validate
		if (!input.category || input.category.trim().length < 2) {
			throw new Error('Category must be at least 2 characters');
		}
		if (!input.description || input.description.trim().length < 3) {
			throw new Error('Description must be at least 3 characters');
		}
		if (!input.amount || input.amount <= 0) {
			throw new Error('Amount must be greater than 0');
		}

		// DATA ACCESS: Create expense
		const { data, error } = await supabase
			.from('expenses')
			.insert({ ...input, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create expense: ${error.message}`);

		return new ExpenseModel(data as Expense);
	}

	// DATA ACCESS: Update expense (instance method)
	async update(input: UpdateExpenseDTO): Promise<ExpenseModel> {
		// BUSINESS LOGIC: Validate
		if (input.category !== undefined && input.category.trim().length < 2) {
			throw new Error('Category must be at least 2 characters');
		}
		if (input.description !== undefined && input.description.trim().length < 3) {
			throw new Error('Description must be at least 3 characters');
		}
		if (input.amount !== undefined && input.amount <= 0) {
			throw new Error('Amount must be greater than 0');
		}

		// DATA ACCESS: Update expense
		const { data, error } = await supabase
			.from('expenses')
			.update({ ...input, updated_at: new Date().toISOString() })
			.eq('id', this.id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update expense: ${error.message}`);

		return new ExpenseModel(data as Expense);
	}

	// DATA ACCESS: Delete expense (instance method)
	async delete(): Promise<void> {
		const { error } = await supabase.from('expenses').delete().eq('id', this.id);
		if (error) throw new Error(`Failed to delete expense: ${error.message}`);
	}

	// Convert to plain object
	toJSON(): Expense {
		return {
			id: this.id,
			category: this.category,
			description: this.description,
			amount: this.amount,
			date: this.date,
			payment_method: this.payment_method,
			receipt_url: this.receipt_url,
			notes: this.notes,
			created_at: this.created_at,
			updated_at: this.updated_at
		};
	}
}

export class PaymentTransactionModel {
	// Data properties
	id: string;
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

	constructor(data: PaymentTransaction) {
		this.id = data.id || '';
		this.order_id = data.order_id;
		this.user_id = data.user_id;
		this.amount = data.amount;
		this.payment_method = data.payment_method;
		this.status = data.status;
		this.transaction_id = data.transaction_id;
		this.gateway_response = data.gateway_response;
		this.failed_reason = data.failed_reason;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	// DATA ACCESS: Get all transactions (static method)
	static async getAll(filters?: {
		status?: string;
		paymentMethod?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<PaymentTransactionModel[]> {
		try {
			let query = supabase.from('payment_transactions').select('*').order('created_at', { ascending: false });

			if (filters?.status) {
				query = query.eq('status', filters.status);
			}
			if (filters?.paymentMethod) {
				query = query.eq('payment_method', filters.paymentMethod);
			}
			if (filters?.startDate) {
				query = query.gte('created_at', filters.startDate);
			}
			if (filters?.endDate) {
				query = query.lte('created_at', filters.endDate);
			}

			const { data, error } = await query;

			if (error) {
				if (error.code === '42P01') return [];
				throw new Error(`Failed to fetch transactions: ${error.message}`);
			}

			return (data || []).map((item) => new PaymentTransactionModel(item as PaymentTransaction));
		} catch (error) {
			return [];
		}
	}

	// BUSINESS LOGIC: Get failed transactions (static method)
	static async getFailed(): Promise<PaymentTransactionModel[]> {
		return this.getAll({ status: 'failed' });
	}

	// BUSINESS LOGIC: Get payment method analytics (static method)
	static async getPaymentMethodAnalytics(): Promise<Array<{ method: string; count: number; total: number }>> {
		const transactions = await this.getAll();
		const methodMap = new Map<string, { count: number; total: number }>();

		transactions.forEach((t) => {
			if (t.status === 'completed') {
				const existing = methodMap.get(t.payment_method) || { count: 0, total: 0 };
				methodMap.set(t.payment_method, {
					count: existing.count + 1,
					total: existing.total + t.amount
				});
			}
		});

		return Array.from(methodMap.entries()).map(([method, data]) => ({
			method,
			...data
		}));
	}

	// Convert to plain object
	toJSON(): PaymentTransaction {
		return {
			id: this.id,
			order_id: this.order_id,
			user_id: this.user_id,
			amount: this.amount,
			payment_method: this.payment_method,
			status: this.status,
			transaction_id: this.transaction_id,
			gateway_response: this.gateway_response,
			failed_reason: this.failed_reason,
			created_at: this.created_at,
			updated_at: this.updated_at
		};
	}
}

// BUSINESS LOGIC: Generate financial statement (static utility)
export class FinancialModel {
	static async generateFinancialStatement(startDate: string, endDate: string): Promise<FinancialStatement> {
		const [salesModels, expensesModels, ordersModels] = await Promise.all([
			SaleModel.getAll({ startDate, endDate }, true),
			ExpenseModel.getAll(startDate, endDate),
			OrderModel.getAll({ startDate, endDate })
		]);

		const sales = salesModels.map((s) => s.toJSON());
		const expenses = expensesModels.map((e) => e.toJSON());

		const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
		const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
		const netProfit = totalRevenue - totalExpenses;

		// Calculate tax (simplified - assume 15% tax rate)
		const taxRate = 0.15;
		const taxAmount = totalRevenue * taxRate;

		// Revenue by category
		const revenueByCategory = new Map<string, number>();
		sales.forEach((sale) => {
			const category = sale.product_name || 'Other';
			revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + sale.total_amount);
		});

		// Expenses by category
		const expensesByCategory = new Map<string, number>();
		expenses.forEach((expense) => {
			const category = expense.category;
			expensesByCategory.set(category, (expensesByCategory.get(category) || 0) + expense.amount);
		});

		return {
			period: `${startDate} to ${endDate}`,
			start_date: startDate,
			end_date: endDate,
			total_revenue: totalRevenue,
			total_expenses: totalExpenses,
			net_profit: netProfit,
			tax_amount: taxAmount,
			revenue_by_category: Array.from(revenueByCategory.entries()).map(([category, amount]) => ({
				category,
				amount
			})),
			expenses_by_category: Array.from(expensesByCategory.entries()).map(([category, amount]) => ({
				category,
				amount
			}))
		};
	}

	// BUSINESS LOGIC: Get revenue vs expenses (static utility)
	static async getRevenueVsExpenses(
		startDate?: string,
		endDate?: string
	): Promise<{ revenue: number; expenses: number; net: number; byMonth: Array<{ month: string; revenue: number; expenses: number }> }> {
		const [salesModels, expensesModels] = await Promise.all([
			SaleModel.getAll(startDate ? { startDate, endDate } : undefined, true),
			ExpenseModel.getAll(startDate, endDate)
		]);

		const sales = salesModels.map((s) => s.toJSON());
		const expenses = expensesModels.map((e) => e.toJSON());

		const revenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
		const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
		const net = revenue - expensesTotal;

		// By month
		const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
		sales.forEach((sale) => {
			if (!sale.created_at) return;
			const date = new Date(sale.created_at);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0 };
			monthlyMap.set(monthKey, { ...existing, revenue: existing.revenue + sale.total_amount });
		});

		expenses.forEach((expense) => {
			if (!expense.date) return;
			const date = new Date(expense.date);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0 };
			monthlyMap.set(monthKey, { ...existing, expenses: existing.expenses + expense.amount });
		});

		const byMonth = Array.from(monthlyMap.entries())
			.map(([month, data]) => ({ month, ...data }))
			.sort((a, b) => a.month.localeCompare(b.month));

		return { revenue, expenses: expensesTotal, net, byMonth };
	}

	// BUSINESS LOGIC: Get inventory valuation (static utility)
	static async getInventoryValuation(): Promise<{
		totalValue: number;
		totalItems: number;
		byCategory: Array<{ category: string; value: number; items: number }>;
		lowStockValue: number;
		outOfStockValue: number;
	}> {
		const { ProductModel } = await import('./ProductModel');
		const products = await ProductModel.getAll();

		let totalValue = 0;
		let totalItems = 0;
		let lowStockValue = 0;
		let outOfStockValue = 0;
		const categoryMap = new Map<string, { value: number; items: number }>();

		products.forEach((product) => {
			const productValue = (product.cost_price || 0) * (product.stock || 0);
			totalValue += productValue;
			totalItems += product.stock || 0;

			if (product.stock === 0) {
				outOfStockValue += productValue;
			} else if (product.stock < 10) {
				lowStockValue += productValue;
			}

			const category = product.component_category_name || 'Uncategorized';
			const existing = categoryMap.get(category) || { value: 0, items: 0 };
			categoryMap.set(category, {
				value: existing.value + productValue,
				items: existing.items + (product.stock || 0)
			});
		});

		return {
			totalValue,
			totalItems,
			byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
				category,
				...data
			})),
			lowStockValue,
			outOfStockValue
		};
	}
}

