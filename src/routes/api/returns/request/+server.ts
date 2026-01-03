// API: Create return request endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReturnModel } from '$lib/models/ReturnModel';
import { requireAuth } from '$lib/utils/auth';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const body = await request.json();
		const { order_id, product_id, quantity, reason, notes } = body;

		// Validate required fields
		if (!order_id || !product_id || !quantity || !reason) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate quantity
		if (quantity <= 0) {
			return json({ error: 'Quantity must be greater than 0' }, { status: 400 });
		}

		// Create return request
		const returnRequestModel = await ReturnModel.create(
			{
				order_id,
				product_id,
				quantity,
				reason,
				notes
			},
			locals.user.id
		);

		return json({ success: true, returnRequest: returnRequestModel.toJSON() }, { status: 201 });
	} catch (error) {
		const { message } = handleError(error);
		return json({ error: message }, { status: 400 });
	}
};

