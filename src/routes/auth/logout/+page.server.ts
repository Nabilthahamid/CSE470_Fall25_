// VIEW: Logout page - thin wrapper that calls controller
import type { Actions } from './$types';
import { AuthController } from '$lib/controllers';

export const actions: Actions = {
	default: async (event) => {
		const controller = new AuthController(event);
		return await controller.logout();
	}
};

