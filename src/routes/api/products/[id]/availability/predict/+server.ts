// API: Product availability predictor
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { productAvailabilityPredictorService } from '$lib/services/ProductAvailabilityPredictorService';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const productId = params.id;

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const prediction = await productAvailabilityPredictorService.predictAvailability(productId);

		return json({ prediction });
	} catch (error: any) {
		console.error('Availability prediction error:', error);
		return json({ error: error.message || 'Failed to predict availability' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
		const productId = params.id;
		const userId = locals.user?.id;

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		if (!userId) {
			return json({ error: 'User must be logged in' }, { status: 401 });
		}

		await productAvailabilityPredictorService.subscribeToRestock(userId, productId);

		return json({ success: true, message: 'Subscribed to restock notifications' });
	} catch (error: any) {
		console.error('Restock subscription error:', error);
		return json({ error: error.message || 'Failed to subscribe' }, { status: 500 });
	}
};

