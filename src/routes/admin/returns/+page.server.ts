// VIEW: Returns & Refunds Management Page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { ReturnController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new ReturnController(event);
	return await controller.loadReturns();
};

export const actions: Actions = {
	approveReturn: async (event) => {
		const controller = new ReturnController(event);
		return await controller.approveReturn();
	},
	rejectReturn: async (event) => {
		const controller = new ReturnController(event);
		return await controller.rejectReturn();
	},
	processRefund: async (event) => {
		const controller = new ReturnController(event);
		return await controller.processRefund();
	},
	completeReturn: async (event) => {
		const controller = new ReturnController(event);
		return await controller.completeReturn();
	}
};
