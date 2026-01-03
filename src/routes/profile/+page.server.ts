// VIEW: Profile page - thin wrapper that calls controller
import type { PageServerLoad, Actions } from './$types';
import { ProfileController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new ProfileController(event);
	return await controller.loadProfile();
};

export const actions: Actions = {
	update: async (event) => {
		const controller = new ProfileController(event);
		return await controller.updateProfile();
	}
};

