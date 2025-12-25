// CONTROLLER: Cart page
import type { PageServerLoad, Actions } from './$types';
import { cartService } from '$lib/services/CartService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const userId = locals.user?.id || undefined;
		const cartItems = await cartService.getCartItems(userId);
		const total = await cartService.getCartTotal(userId);

		return {
			cartItems,
			total,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			cartItems: [],
			total: 0,
			error: message
		};
	}
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const itemId = formData.get('item_id')?.toString();
		const quantity = parseInt(formData.get('quantity')?.toString() || '1');

		if (!itemId) {
			return { error: 'Item ID is required' };
		}

		try {
			await cartService.updateCartItem(itemId, { quantity });
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},
	remove: async ({ request }) => {
		const formData = await request.formData();
		const itemId = formData.get('item_id')?.toString();

		if (!itemId) {
			return { error: 'Item ID is required' };
		}

		try {
			await cartService.removeCartItem(itemId);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

