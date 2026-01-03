// VIEW: Login page - thin wrapper that calls controller
import type { Actions, PageServerLoad } from './$types';
import { AuthController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new AuthController(event);
	return controller.loadLoginPage();
};

export const actions: Actions = {
	default: async (event) => {
		const controller = new AuthController(event);
		return await controller.login();
	}
};

