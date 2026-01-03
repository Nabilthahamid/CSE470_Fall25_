// VIEW: Advanced Analytics Dashboard - thin wrapper that calls controller
import type { PageServerLoad } from './$types';
import { AnalyticsController } from '$lib/controllers';

export const load: PageServerLoad = async (event) => {
	const controller = new AnalyticsController(event);
	return await controller.loadAnalytics();
};
