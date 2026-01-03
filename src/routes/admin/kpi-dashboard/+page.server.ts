// VIEW: KPI Dashboard - thin wrapper that calls controller
import type { PageServerLoad } from './$types';
import { KPIController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new KPIController(event);
	return await controller.loadKPIDashboard();
};
