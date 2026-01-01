// CONTROLLER: Financial Management Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { financialService } from '$lib/services/FinancialService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const activeTab = url.searchParams.get('tab') || 'overview';

		const [expenses, transactions, paymentAnalytics, revenueVsExpenses] = await Promise.all([
			financialService.getAllExpenses(startDate, endDate),
			financialService.getAllTransactions({ startDate, endDate }),
			financialService.getPaymentMethodAnalytics(),
			financialService.getRevenueVsExpenses(startDate, endDate)
		]);

		const failedTransactions = await financialService.getFailedTransactions();

		let financialStatement = null;
		if (startDate && endDate) {
			financialStatement = await financialService.generateFinancialStatement(startDate, endDate);
		}

		return {
			activeTab,
			expenses,
			transactions,
			failedTransactions,
			paymentAnalytics,
			revenueVsExpenses,
			financialStatement,
			startDate: startDate || '',
			endDate: endDate || '',
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			activeTab: 'overview',
			expenses: [],
			transactions: [],
			failedTransactions: [],
			paymentAnalytics: [],
			revenueVsExpenses: { revenue: 0, expenses: 0, net: 0, byMonth: [] },
			financialStatement: null,
			startDate: '',
			endDate: '',
			error: message
		};
	}
};

export const actions: Actions = {
	createExpense: async ({ request }) => {
		const formData = await request.formData();
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
			await financialService.createExpense(expense);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updateExpense: async ({ request }) => {
		const formData = await request.formData();
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
			await financialService.updateExpense(id, expense);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteExpense: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await financialService.deleteExpense(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

