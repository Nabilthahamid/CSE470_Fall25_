// VIEW: Financial Management Page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { FinancialController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new FinancialController(event);
	return await controller.loadFinancial();
};

export const actions: Actions = {
	createExpense: async (event) => {
		const controller = new FinancialController(event);
		return await controller.createExpense();
	},
	updateExpense: async (event) => {
		const controller = new FinancialController(event);
		return await controller.updateExpense();
	},
	deleteExpense: async (event) => {
		const controller = new FinancialController(event);
		return await controller.deleteExpense();
	}
};

