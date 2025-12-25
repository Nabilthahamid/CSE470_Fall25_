// CONTROLLER: Checkout page
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { cartService } from '$lib/services/CartService';
import { orderService } from '$lib/services/OrderService';
import { emailService } from '$lib/services/EmailService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const userId = locals.user?.id || undefined;
		const cartItems = await cartService.getCartItems(userId);
		const total = await cartService.getCartTotal(userId);

		if (cartItems.length === 0) {
			throw redirect(302, '/cart');
		}

		return {
			cartItems,
			total,
			user: locals.user,
			error: null
		};
	} catch (error) {
		if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
			throw error;
		}
		const { message } = handleError(error);
		throw redirect(302, '/cart?error=' + encodeURIComponent(message));
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const customer_name = formData.get('customer_name')?.toString() || '';
		const customer_email = formData.get('customer_email')?.toString() || '';
		const customer_address = formData.get('customer_address')?.toString() || '';
		const customer_phone = formData.get('customer_phone')?.toString() || '';
		const customer_city = formData.get('customer_city')?.toString() || '';
		const customer_postal_code = formData.get('customer_postal_code')?.toString() || '';
		const customer_country = formData.get('customer_country')?.toString() || 'Bangladesh';
		const shipping_method = formData.get('shipping_method')?.toString() || 'inside_dhaka';
		const payment_method = formData.get('payment_method')?.toString() || 'cod';
		const shipping_cost = parseFloat(formData.get('shipping_cost')?.toString() || '0');

		// Build full address
		const fullAddress = [
			customer_address,
			customer_city,
			customer_postal_code,
			customer_country
		]
			.filter(Boolean)
			.join(', ');

		if (!customer_name || !customer_email) {
			return {
				error: 'Name and email are required'
			};
		}

		try {
			const userId = locals.user?.id || undefined;

			// Create order (this will also create sales and clear cart)
			const order = await orderService.createOrder(
				{
					customer_name,
					customer_email,
					customer_address: fullAddress || customer_address || null,
					customer_phone: customer_phone || null,
					customer_city: customer_city || null,
					customer_postal_code: customer_postal_code || null,
					customer_country: customer_country || null,
					shipping_method: shipping_method || null,
					payment_method: payment_method || null,
					shipping_cost: shipping_cost || 0
				},
				userId
			);

			// Send invoice email
			try {
				await emailService.sendInvoice(order);
			} catch (emailError) {
				console.error('Failed to send invoice email:', emailError);
				// Don't fail the order if email fails
			}

			throw redirect(302, `/checkout/success?order_id=${order.id}`);
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
				throw error;
			}
			const { message } = handleError(error);
			return {
				error: message
			};
		}
	}
};

