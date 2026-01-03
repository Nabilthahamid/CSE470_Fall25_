// VIEW: Home page - thin wrapper that calls controller
import type { PageServerLoad } from './$types';
import { HomeController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new HomeController(event);
	return await controller.loadHome();
};
