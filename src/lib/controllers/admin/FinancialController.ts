// CONTROLLER: Financial management controller
import { BaseController } from '../BaseController';
import { requireAdmin } from '$lib/utils/auth';
import { ExpenseModel, PaymentTransactionModel, FinancialModel } from '$lib/models/FinancialModel';

export class FinancialController extends BaseController {
	/**
	 * Load financial dashboard
	 */
	async loadFinancial() {
		requireAdmin(this.getUser());

		try {
			const startDate = this.getQueryParam('startDate') || undefined;
			const endDate = this.getQueryParam('endDate') || undefined;
			const activeTab = this.getQueryParam('tab', 'overview');

			const [expensesModels, transactionsModels, paymentAnalytics, revenueVsExpenses, inventoryValuation] = await Promise.all([
				ExpenseModel.getAll(startDate, endDate),
				PaymentTransactionModel.getAll({ startDate, endDate }),
				PaymentTransactionModel.getPaymentMethodAnalytics(),
				FinancialModel.getRevenueVsExpenses(startDate, endDate),
				FinancialModel.getInventoryValuation()
			]);

			const expenses = expensesModels.map((e) => e.toJSON());
			const transactions = transactionsModels.map((t) => t.toJSON());
			const failedTransactionsModels = await PaymentTransactionModel.getFailed();
			const failedTransactions = failedTransactionsModels.map((t) => t.toJSON());

			let financialStatement = null;
			if (startDate && endDate) {
				financialStatement = await FinancialModel.generateFinancialStatement(startDate, endDate);
			}

			return {
				activeTab,
				expenses,
				transactions,
				failedTransactions,
				paymentAnalytics,
				revenueVsExpenses,
				financialStatement,
				inventoryValuation,
				startDate: startDate || '',
				endDate: endDate || '',
				error: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				activeTab: 'overview',
				expenses: [],
				transactions: [],
				failedTransactions: [],
				paymentAnalytics: [],
				revenueVsExpenses: { revenue: 0, expenses: 0, net: 0, byMonth: [] },
				financialStatement: null,
				inventoryValuation: { totalValue: 0, totalItems: 0, byCategory: [], lowStockValue: 0, outOfStockValue: 0 },
				startDate: '',
				endDate: '',
				error: message
			};
		}
	}

	/**
	 * Create expense
	 */
	async createExpense() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		
		const expense = {
			category: formData.get('category')?.toString() || '',
			description: formData.get('description')?.toString() || '',
			amount: parseFloat(formData.get('amount')?.toString() || '0'),
			date: formData.get('date')?.toString() || new Date().toISOString().split('T')[0],
			payment_method: formData.get('payment_method')?.toString() || null,
			receipt_url: formData.get('receipt_url')?.toString() || null,
			notes: formData.get('notes')?.toString() || null
		};

		try {
			await ExpenseModel.create(expense);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Update expense
	 */
	async updateExpense() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';
		const expense: any = {};

		if (formData.get('category')) expense.category = formData.get('category')?.toString();
		if (formData.get('description')) expense.description = formData.get('description')?.toString();
		if (formData.get('amount')) expense.amount = parseFloat(formData.get('amount')?.toString() || '0');
		if (formData.get('date')) expense.date = formData.get('date')?.toString();
		if (formData.get('payment_method')) expense.payment_method = formData.get('payment_method')?.toString() || null;
		if (formData.get('receipt_url')) expense.receipt_url = formData.get('receipt_url')?.toString() || null;
		if (formData.get('notes')) expense.notes = formData.get('notes')?.toString() || null;

		try {
			const expenseModel = await ExpenseModel.getById(id);
			if (!expenseModel) {
				return { error: 'Expense not found' };
			}
			await expenseModel.update(expense);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Delete expense
	 */
	async deleteExpense() {
		requireAdmin(this.getUser());
		const formData = await this.getFormData();
		const id = formData.get('id')?.toString() || '';

		try {
			const expenseModel = await ExpenseModel.getById(id);
			if (!expenseModel) {
				return { error: 'Expense not found' };
			}
			await expenseModel.delete();
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}

