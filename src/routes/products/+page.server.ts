// VIEW: Products page - thin wrapper that calls controller
import type { PageServerLoad } from './$types';
import { PublicProductController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new PublicProductController(event);
	return await controller.loadProductsList();
};

