// API: Add to cart
import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cartService } from '$lib/services/CartService';
import { handleError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	try {
		// Try to parse as JSON first (for fetch requests)
		let product_id: string | undefined;
		let quantity: number = 1;
		let redirectToCart = false;

		const contentType = request.headers.get('content-type');
		if (contentType?.includes('application/json')) {
			const body = await request.json();
			product_id = body.product_id;
			quantity = parseInt(body.quantity?.toString() || '1');
			redirectToCart = body.redirect === false ? false : true;
		} else {
			// Parse as form data
			const formData = await request.formData();
			product_id = formData.get('product_id')?.toString();
			quantity = parseInt(formData.get('quantity')?.toString() || '1');
			redirectToCart = formData.get('redirect')?.toString() !== 'false';
		}

		if (!product_id || product_id.trim() === '') {
			console.error('Cart add error: Product ID is missing');
			// For form submissions, redirect back with error
			if (!contentType?.includes('application/json')) {
				throw redirect(303, url.searchParams.get('redirect') || '/cart?error=' + encodeURIComponent('Product ID is required'));
			}
			return json({ success: false, error: 'Product ID is required' }, { status: 400 });
		}

		if (isNaN(quantity) || quantity < 1) {
			console.error('Cart add error: Invalid quantity', quantity);
			if (!contentType?.includes('application/json')) {
				throw redirect(303, url.searchParams.get('redirect') || '/cart?error=' + encodeURIComponent('Quantity must be at least 1'));
			}
			return json({ success: false, error: 'Quantity must be at least 1' }, { status: 400 });
		}

		const userId = locals.user?.id || null;
		
		try {
			await cartService.addToCart(userId, { product_id: product_id.trim(), quantity });
			
			// For form submissions (not JSON), redirect to prevent showing JSON page
			if (!contentType?.includes('application/json')) {
				const redirectUrl = url.searchParams.get('redirect') || '/cart';
				throw redirect(303, redirectUrl + '?success=' + encodeURIComponent('Item added to cart successfully!'));
			}
			
			// For JSON requests (fetch), return JSON
			return json({ success: true, message: 'Item added to cart successfully!' });
		} catch (cartError: any) {
			console.error('Cart service error:', cartError);
			const errorMessage = cartError?.message || 'Failed to add item to cart';
			
			// If it's a redirect, re-throw it
			if (cartError && typeof cartError === 'object' && 'status' in cartError && cartError.status === 303) {
				throw cartError;
			}
			
			if (!contentType?.includes('application/json')) {
				throw redirect(303, url.searchParams.get('redirect') || '/cart?error=' + encodeURIComponent(errorMessage));
			}
			
			return json({ success: false, error: errorMessage }, { status: 400 });
		}
	} catch (error) {
		// If it's a redirect, re-throw it
		if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
			throw error;
		}
		
		console.error('Cart add endpoint error:', error);
		const { message } = handleError(error);
		
		const contentType = request.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			throw redirect(303, url.searchParams.get('redirect') || '/cart?error=' + encodeURIComponent(message || 'Failed to add item to cart'));
		}
		
		return json({ success: false, error: message || 'Failed to add item to cart' }, { status: 400 });
	}
};

