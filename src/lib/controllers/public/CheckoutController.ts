// CONTROLLER: Checkout controller (Pure MVC)
import { redirect } from '@sveltejs/kit';
import { BaseController } from '../BaseController';
import { CartModel } from '$lib/models/CartModel';
import { OrderModel } from '$lib/models/OrderModel';
import { sendInvoice } from '$lib/utils/email';
import { UserModel } from '$lib/models/UserModel';

export class CheckoutController extends BaseController {
	/**
	 * Load checkout page
	 */
	async loadCheckout() {
		try {
			const userId = this.getUser()?.id || undefined;
			const cartItems = await CartModel.getCartItems(userId);
			const total = await CartModel.getCartTotal(userId);

			if (cartItems.length === 0) {
				throw redirect(302, '/cart');
			}

			// Get user profile data if logged in
			let userProfile = null;
			if (userId) {
				try {
					const user = await UserModel.getById(userId);
					if (user) {
						userProfile = {
							customer_name: user.customer_name || '',
							customer_email: user.email || '',
							customer_address: user.customer_address || '',
							customer_phone: user.customer_phone || '',
							customer_city: user.customer_city || '',
							customer_postal_code: user.customer_postal_code || '',
							customer_country: user.customer_country || 'Bangladesh'
						};
					}
				} catch (e) {
					console.error('Error loading user profile:', e);
				}
			}

			return {
				cartItems: cartItems.map((item) => item.toJSON()),
				total,
				user: this.getUser(),
				userProfile,
				error: null
			};
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
				throw error;
			}
			const { message } = this.handleError(error);
			throw redirect(302, '/cart?error=' + encodeURIComponent(message));
		}
	}

	/**
	 * Process checkout (create order)
	 */
	async processCheckout() {
		const formData = await this.getFormData();

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
		const coupon_code = formData.get('coupon_code')?.toString() || null;
		const coupon_id = formData.get('coupon_id')?.toString() || null;
		const discount_amount = parseFloat(formData.get('discount_amount')?.toString() || '0');

		// Build full address
		const fullAddress = [customer_address, customer_city, customer_postal_code, customer_country]
			.filter(Boolean)
			.join(', ');

		if (!customer_name || !customer_email) {
			return {
				error: 'Name and email are required'
			};
		}

		try {
			const userId = this.getUser()?.id || undefined;

			// Create order (this will also create sales and clear cart)
			const order = await OrderModel.create(
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
					shipping_cost: shipping_cost || 0,
					coupon_code: coupon_code || null,
					coupon_id: coupon_id || null,
					discount_amount: discount_amount || 0
				},
				[], // Empty items array - OrderModel.create will get from cart
				userId
			);

			// Record discount usage if coupon was applied
			if (coupon_id && discount_amount > 0) {
				try {
					const { recordDiscountUsage } = await import('$lib/utils/discount');
					await recordDiscountUsage(coupon_id, order.id, userId || '', discount_amount);
				} catch (discountError) {
					console.error('Failed to record discount usage:', discountError);
				}
			}

			// Save profile information if user checked "save_info" and is logged in
			const saveInfo = formData.get('save_info')?.toString() === 'true';
			if (saveInfo && userId) {
				try {
					const user = await UserModel.getById(userId);
					if (user) {
						await user.update({
							customer_name: customer_name || undefined,
							customer_address: customer_address || undefined,
							customer_phone: customer_phone || undefined,
							customer_city: customer_city || undefined,
							customer_postal_code: customer_postal_code || undefined,
							customer_country: customer_country || undefined
						});
					}
				} catch (profileError) {
					console.error('Failed to save profile information:', profileError);
				}
			}

			// Send invoice email
			try {
				await sendInvoice(order.toJSON());
			} catch (emailError) {
				console.error('Failed to send invoice email:', emailError);
			}

			throw redirect(302, `/checkout/success?order_id=${order.id}`);
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
				throw error;
			}
			const { message } = this.handleError(error);
			return {
				error: message
			};
		}
	}
}
