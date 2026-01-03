// VIEW: Admin page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { AdminController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new AdminController(event);
	return await controller.loadDashboard();
};

export const actions: Actions = {
	markNotificationRead: async (event) => {
		const controller = new AdminController(event);
		return await controller.markNotificationRead();
	},
	markAllRead: async (event) => {
		const controller = new AdminController(event);
		return await controller.markAllNotificationsRead();
	}
};

