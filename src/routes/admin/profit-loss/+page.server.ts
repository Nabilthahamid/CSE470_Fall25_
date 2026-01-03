// VIEW: Profit/Loss report page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { SalesController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new SalesController(event);
	return await controller.loadProfitLossReport();
};

export const actions: Actions = {
	export: async (event) => {
		const controller = new SalesController(event);
		return await controller.exportProfitLossReport();
	}
};

