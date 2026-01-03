// CONTROLLER: Cart controller (Pure MVC)
import { redirect } from '@sveltejs/kit';
import { BaseController } from '../BaseController';
import { CartModel } from '$lib/models/CartModel';

export class CartController extends BaseController {
	/**
	 * Load cart items
	 */
	async loadCart() {
		try {
			const userId = this.getUser()?.id || undefined;
			const cartItemsModels = await CartModel.getCartItems(userId);
			const cartItems = cartItemsModels.map(item => item.toJSON());
			const total = await CartModel.getCartTotal(userId);

			// Get success/error messages from URL params
			const success = this.getQueryParam('success');
			const error = this.getQueryParam('error');

			return {
				cartItems,
				total,
				success,
				error,
				errorMessage: null
			};
		} catch (error) {
			const { message } = this.handleError(error);
			return {
				cartItems: [],
				total: 0,
				success: null,
				error: null,
				errorMessage: message
			};
		}
	}

	/**
	 * Add item to cart
	 */
	async addToCart() {
		const formData = await this.getFormData();
		const product_id = formData.get('product_id')?.toString();
		const quantity = parseInt(formData.get('quantity')?.toString() || '1');
		const redirectUrl = formData.get('redirect')?.toString() || this.event.url.pathname;

		if (!product_id || product_id.trim() === '') {
			throw redirect(303, redirectUrl + '?error=' + encodeURIComponent('Product ID is required'));
		}

		if (isNaN(quantity) || quantity < 1) {
			throw redirect(303, redirectUrl + '?error=' + encodeURIComponent('Quantity must be at least 1'));
		}

		try {
			const userId = this.getUser()?.id || null;
			await CartModel.addItem(userId, { product_id: product_id.trim(), quantity });
			throw redirect(303, redirectUrl + '?success=' + encodeURIComponent('Item added to cart successfully!'));
		} catch (error: any) {
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				throw error;
			}
			const { message } = this.handleError(error);
			throw redirect(303, redirectUrl + '?error=' + encodeURIComponent(message || 'Failed to add item to cart'));
		}
	}

	/**
	 * Update cart item quantity
	 */
	async updateCartItem() {
		const formData = await this.getFormData();
		const itemId = formData.get('item_id')?.toString();
		const quantity = parseInt(formData.get('quantity')?.toString() || '1');

		if (!itemId) {
			return { error: 'Item ID is required' };
		}

		if (isNaN(quantity) || quantity < 1) {
			return { error: 'Quantity must be at least 1' };
		}

		try {
			await CartModel.updateItem(itemId, { quantity });
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}

	/**
	 * Remove item from cart
	 */
	async removeFromCart() {
		const formData = await this.getFormData();
		const itemId = formData.get('item_id')?.toString();

		if (!itemId) {
			return { error: 'Item ID is required' };
		}

		try {
			await CartModel.removeItem(itemId);
			return { success: true };
		} catch (error) {
			const { message } = this.handleError(error);
			return { error: message };
		}
	}
}

