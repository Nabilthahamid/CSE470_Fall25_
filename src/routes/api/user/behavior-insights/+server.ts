// API: Shopping behavior insights
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { shoppingBehaviorInsightsService } from '$lib/services/ShoppingBehaviorInsightsService';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const userId = locals.user?.id;

		if (!userId) {
			return json({ error: 'User must be logged in' }, { status: 401 });
		}

		const profile = await shoppingBehaviorInsightsService.generateInsights(userId);

		return json({ profile });
	} catch (error: any) {
		console.error('Behavior insights error:', error);
		return json({ error: error.message || 'Failed to generate insights' }, { status: 500 });
	}
};

