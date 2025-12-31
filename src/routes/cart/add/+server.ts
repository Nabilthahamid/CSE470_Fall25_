// API: Add to cart
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cartService } from '$lib/services/CartService';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const formData = await request.formData();
		const product_id = formData.get('product_id')?.toString();
		const quantity = parseInt(formData.get('quantity')?.toString() || '1');

		if (!product_id) {
			return json({ success: false, error: 'Product ID is required' }, { status: 400 });
		}

		const userId = locals.user?.id || null;
		await cartService.addToCart(userId, { product_id, quantity });

		return json({ success: true, message: 'Item added to cart successfully!' });
	} catch (error) {
		const { message } = handleError(error);
		return json({ success: false, error: message }, { status: 400 });
	}
};

