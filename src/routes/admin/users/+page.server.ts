// VIEW: Admin users page - thin wrapper that calls controller
import type { PageServerLoad } from './$types';
import { UserController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new UserController(event);
	return await controller.loadUsersList();
};

