// API: Add to cart endpoint (for JSON/fetch requests)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CartModel } from '$lib/models/CartModel';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const product_id = body.product_id;
		const quantity = parseInt(body.quantity?.toString() || '1');

		if (!product_id || product_id.trim() === '') {
			return json({ success: false, error: 'Product ID is required' }, { status: 400 });
		}

		if (isNaN(quantity) || quantity < 1) {
			return json({ success: false, error: 'Quantity must be at least 1' }, { status: 400 });
		}

		const userId = locals.user?.id || undefined;
		await CartModel.addToCart(userId, { product_id: product_id.trim(), quantity });
		
		return json({ 
			success: true, 
			message: 'Item added to cart successfully!' 
		});
		
	} catch (error: any) {
		console.error('Cart add error:', error);
		const { message } = handleError(error);
		
		return json({ 
			success: false, 
			error: message || 'Failed to add item to cart' 
		}, { status: 500 });
	}
};

