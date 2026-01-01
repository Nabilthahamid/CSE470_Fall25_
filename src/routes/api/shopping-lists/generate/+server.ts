// API: Generate shopping list
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { shoppingListService } from '$lib/services/ShoppingListService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { useCase, budget } = await request.json();
		const userId = locals.user?.id;

		if (!userId) {
			return json({ error: 'User must be logged in' }, { status: 401 });
		}

		if (!useCase) {
			return json({ error: 'Use case is required' }, { status: 400 });
		}

		const shoppingList = await shoppingListService.generateShoppingList(
			userId,
			useCase,
			budget
		);

		return json({ shoppingList });
	} catch (error: any) {
		console.error('Shopping list generation error:', error);
		return json({ error: error.message || 'Failed to generate shopping list' }, { status: 500 });
	}
};

