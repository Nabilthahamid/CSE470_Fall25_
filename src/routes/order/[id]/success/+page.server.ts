import type { PageServerLoad } from './$types';
import { getOrderById } from '$lib/server/models/orders';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const orderId = params.id;
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const order = await getOrderById(orderId);

	if (!order || order.userId !== userId) {
		throw error(404, 'Order not found');
	}

	return {
		order
	};
};

