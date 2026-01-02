// API: Validate coupon code
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { discountService } from '$lib/services/DiscountService';
import { cartService } from '$lib/services/CartService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { code } = await request.json();

		if (!code || typeof code !== 'string' || code.trim() === '') {
			return json({ valid: false, error: 'Coupon code is required' }, { status: 400 });
		}

		const userId = locals.user?.id || undefined;
		const cartTotal = await cartService.getCartTotal(userId);
		const cartItems = await cartService.getCartItems(userId);
		const productIds = cartItems.map(item => item.product_id).filter(Boolean) as string[];

		// Validate the coupon (userId can be empty string for guests)
		const validation = await discountService.validateDiscount(
			code.trim(),
			userId || '',
			cartTotal,
			productIds
		);

		if (!validation.valid || !validation.discount) {
			return json({ valid: false, error: validation.error || 'Invalid coupon code' }, { status: 200 });
		}

		// Calculate discount amount
		const discountAmount = discountService.calculateDiscountAmount(validation.discount, cartTotal);
		const finalTotal = cartTotal - discountAmount;

		return json({
			valid: true,
			discount: {
				id: validation.discount.id,
				code: validation.discount.code,
				name: validation.discount.name,
				discount_type: validation.discount.discount_type,
				discount_value: validation.discount.discount_value,
				discount_amount: discountAmount,
				free_shipping: validation.discount.discount_type === 'free_shipping'
			},
			original_total: cartTotal,
			discount_amount: discountAmount,
			final_total: finalTotal
		});
	} catch (error: any) {
		console.error('Coupon validation error:', error);
		return json(
			{ valid: false, error: error.message || 'Failed to validate coupon code' },
			{ status: 500 }
		);
	}
};

