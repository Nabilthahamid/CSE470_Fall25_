// API: Add to cart
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cartService } from '$lib/services/CartService';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	try {
		const formData = await request.formData();
		const product_id = formData.get('product_id')?.toString();
		const quantity = parseInt(formData.get('quantity')?.toString() || '1');

		if (!product_id) {
			throw redirect(302, '/products?error=' + encodeURIComponent('Product ID is required'));
		}

		const userId = locals.user?.id || null;
		await cartService.addToCart(userId, { product_id, quantity });

		// Redirect back to products or to cart
		const redirectTo = url.searchParams.get('redirect') || '/products';
		throw redirect(302, redirectTo + '?success=Item added to cart');
	} catch (error) {
		if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
			throw error;
		}
		const { message } = handleError(error);
		throw redirect(302, '/products?error=' + encodeURIComponent(message));
	}
};

