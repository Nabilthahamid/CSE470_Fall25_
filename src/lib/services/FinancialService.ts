// SERVICE: Financial Management
import { supabase } from '$lib/config/supabase';
import { saleService } from './SaleService';
import { orderService } from './OrderService';
import type {
	Expense,
	PaymentTransaction,
	FinancialStatement,
	CreateExpenseDTO,
	UpdateExpenseDTO
} from '$lib/models/Financial';

export class FinancialService {
	// Expenses
	async getAllExpenses(startDate?: string, endDate?: string): Promise<Expense[]> {
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
				if (error.code === '42P01') return []; // Table doesn't exist
				throw new Error(`Failed to fetch expenses: ${error.message}`);
			}
			return data || [];
		} catch (error) {
			return [];
		}
	}

	async createExpense(expense: CreateExpenseDTO): Promise<Expense> {
		const { data, error } = await supabase
			.from('expenses')
			.insert({ ...expense, created_at: new Date().toISOString() })
			.select()
			.single();

		if (error) throw new Error(`Failed to create expense: ${error.message}`);
		return data;
	}

	async updateExpense(id: string, expense: UpdateExpenseDTO): Promise<Expense> {
		const { data, error } = await supabase
			.from('expenses')
			.update({ ...expense, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw new Error(`Failed to update expense: ${error.message}`);
		return data;
	}

	async deleteExpense(id: string): Promise<void> {
		const { error } = await supabase.from('expenses').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete expense: ${error.message}`);
	}

	// Payment Transactions
	async getAllTransactions(filters?: {
		status?: string;
		paymentMethod?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<PaymentTransaction[]> {
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
			return data || [];
		} catch (error) {
			return [];
		}
	}

	async getFailedTransactions(): Promise<PaymentTransaction[]> {
		return this.getAllTransactions({ status: 'failed' });
	}

	async getPaymentMethodAnalytics(): Promise<Array<{ method: string; count: number; total: number }>> {
		const transactions = await this.getAllTransactions();
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

	// Financial Statements
	async generateFinancialStatement(startDate: string, endDate: string): Promise<FinancialStatement> {
		const [sales, expenses, orders] = await Promise.all([
			saleService.getAllSales({ startDate, endDate }),
			this.getAllExpenses(startDate, endDate),
			orderService.getAllOrders({ startDate, endDate })
		]);

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
			expensesByCategory.set(
				expense.category,
				(expensesByCategory.get(expense.category) || 0) + expense.amount
			);
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

	// Revenue vs Expenses tracking
	async getRevenueVsExpenses(startDate?: string, endDate?: string): Promise<{
		revenue: number;
		expenses: number;
		net: number;
		byMonth: Array<{ month: string; revenue: number; expenses: number; net: number }>;
	}> {
		const sales = await saleService.getAllSales({ startDate, endDate });
		const expenses = await this.getAllExpenses(startDate, endDate);

		const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
		const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
		const net = totalRevenue - totalExpenses;

		// Group by month
		const monthlyData = new Map<string, { revenue: number; expenses: number }>();

		sales.forEach((sale) => {
			if (!sale.created_at) return;
			const date = new Date(sale.created_at);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const existing = monthlyData.get(monthKey) || { revenue: 0, expenses: 0 };
			monthlyData.set(monthKey, { ...existing, revenue: existing.revenue + sale.total_amount });
		});

		expenses.forEach((expense) => {
			const date = new Date(expense.date);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const existing = monthlyData.get(monthKey) || { revenue: 0, expenses: 0 };
			monthlyData.set(monthKey, { ...existing, expenses: existing.expenses + expense.amount });
		});

		const byMonth = Array.from(monthlyData.entries())
			.map(([month, data]) => ({
				month,
				...data,
				net: data.revenue - data.expenses
			}))
			.sort((a, b) => a.month.localeCompare(b.month));

		return {
			revenue: totalRevenue,
			expenses: totalExpenses,
			net,
			byMonth
		};
	}
}

export const financialService = new FinancialService();

