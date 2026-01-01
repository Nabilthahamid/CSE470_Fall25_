// SERVICE: Shopping list generator business logic
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { pcBuildService } from './PCBuildService';
import { enhancedAIService } from './EnhancedAIService';
import type { Product } from '$lib/models/Product';

export interface ShoppingListItem {
	id: string;
	product_id: string;
	product?: Product;
	quantity: number;
	checked: boolean;
	notes?: string;
}

export interface ShoppingList {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	use_case?: string;
	budget?: number;
	items: ShoppingListItem[];
	created_at: string;
	updated_at: string;
}

export interface CreateShoppingListDTO {
	name: string;
	description?: string;
	use_case?: string;
	budget?: number;
}

export class ShoppingListService {
	/**
	 * Generate shopping list based on use case
	 */
	async generateShoppingList(
		userId: string,
		useCase: string,
		budget?: number
	): Promise<ShoppingList> {
		try {
			// Get all products and categories
			const allProducts = await productService.getAllProducts();
			const categories = await pcBuildService.getAllCategories();

			// Define use case requirements
			const useCaseRequirements: Record<string, string[]> = {
				gaming: ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling'],
				'gaming-setup': [
					'CPU',
					'GPU',
					'Motherboard',
					'RAM',
					'Storage',
					'PSU',
					'Case',
					'Cooling',
					'Monitor',
					'Keyboard',
					'Mouse',
					'Headphone'
				],
				'home-office': ['CPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Monitor', 'Keyboard', 'Mouse'],
				'streaming-setup': [
					'CPU',
					'GPU',
					'Motherboard',
					'RAM',
					'Storage',
					'PSU',
					'Case',
					'Monitor',
					'Keyboard',
					'Mouse',
					'Headphone',
					'Microphone'
				],
				'content-creation': [
					'CPU',
					'GPU',
					'Motherboard',
					'RAM',
					'Storage',
					'PSU',
					'Case',
					'Monitor',
					'Keyboard',
					'Mouse'
				]
			};

			const requiredCategories = useCaseRequirements[useCase] || useCaseRequirements.gaming;

			// Find products for each category
			const items: ShoppingListItem[] = [];
			let totalPrice = 0;

			for (const categoryName of requiredCategories) {
				const category = categories.find(
					(c) =>
						c.display_name.toLowerCase().includes(categoryName.toLowerCase()) ||
						c.name.toLowerCase().includes(categoryName.toLowerCase())
				);

				if (!category) continue;

				// Find products in this category
				const categoryProducts = allProducts.filter(
					(p) => p.component_category_id === category.id && p.stock > 0
				);

				if (categoryProducts.length === 0) continue;

				// Select best product (by price if budget, otherwise by stock/price ratio)
				let selectedProduct: Product;
				if (budget) {
					// Select product that fits remaining budget
					const remainingBudget = budget - totalPrice;
					const affordableProducts = categoryProducts.filter((p) => p.price <= remainingBudget);
					selectedProduct =
						affordableProducts.length > 0
							? affordableProducts.sort((a, b) => b.price - a.price)[0] // Highest price that fits
							: categoryProducts.sort((a, b) => a.price - b.price)[0]; // Cheapest if none fit
				} else {
					// Select best value product
					selectedProduct = categoryProducts.sort((a, b) => {
						const aValue = a.stock > 0 ? a.price / (a.stock + 1) : a.price;
						const bValue = b.stock > 0 ? b.price / (b.stock + 1) : b.price;
						return aValue - bValue;
					})[0];
				}

				items.push({
					id: `temp-${category.id}`,
					product_id: selectedProduct.id,
					product: selectedProduct,
					quantity: 1,
					checked: false
				});

				totalPrice += selectedProduct.price;
			}

			// Create shopping list
			const listName = `${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Setup Shopping List`;
			const listDescription = `Complete shopping list for ${useCase} setup${budget ? ` (Budget: Tk ${budget.toFixed(2)})` : ''}`;

			const shoppingList: ShoppingList = {
				id: `temp-${Date.now()}`,
				user_id: userId,
				name: listName,
				description: listDescription,
				use_case: useCase,
				budget,
				items,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			// Save to database
			return await this.saveShoppingList(shoppingList);
		} catch (error: any) {
			console.error('Error generating shopping list:', error);
			throw new Error(`Failed to generate shopping list: ${error.message}`);
		}
	}

	/**
	 * Save shopping list to database
	 */
	async saveShoppingList(list: ShoppingList): Promise<ShoppingList> {
		try {
			// Save list
			const { data: listData, error: listError } = await supabase
				.from('shopping_lists')
				.insert({
					user_id: list.user_id,
					name: list.name,
					description: list.description,
					use_case: list.use_case,
					budget: list.budget,
					created_at: list.created_at,
					updated_at: list.updated_at
				})
				.select()
				.single();

			if (listError) {
				// If table doesn't exist, return the list without saving
				if (listError.message.includes('does not exist')) {
					return list;
				}
				throw listError;
			}

			// Save items
			if (list.items.length > 0) {
				const itemsToSave = list.items.map((item) => ({
					shopping_list_id: listData.id,
					product_id: item.product_id,
					quantity: item.quantity,
					checked: item.checked,
					notes: item.notes
				}));

				await supabase.from('shopping_list_items').insert(itemsToSave);
			}

			return { ...list, id: listData.id };
		} catch (error) {
			// If tables don't exist, return list without saving
			console.warn('Could not save shopping list to database:', error);
			return list;
		}
	}

	/**
	 * Get user's shopping lists
	 */
	async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
		try {
			const { data, error } = await supabase
				.from('shopping_lists')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) {
				if (error.message.includes('does not exist')) {
					return [];
				}
				throw error;
			}

			// Fetch items for each list
			const listsWithItems = await Promise.all(
				(data || []).map(async (list) => {
					const { data: items } = await supabase
						.from('shopping_list_items')
						.select('*, products(*)')
						.eq('shopping_list_id', list.id);

					return {
						...list,
						items: (items || []).map((item: any) => ({
							id: item.id,
							product_id: item.product_id,
							product: item.products,
							quantity: item.quantity,
							checked: item.checked,
							notes: item.notes
						}))
					};
				})
			);

			return listsWithItems as ShoppingList[];
		} catch (error) {
			console.error('Error getting shopping lists:', error);
			return [];
		}
	}

	/**
	 * Update shopping list item (check/uncheck, update quantity)
	 */
	async updateListItem(
		listId: string,
		itemId: string,
		updates: { checked?: boolean; quantity?: number; notes?: string }
	): Promise<void> {
		try {
			await supabase
				.from('shopping_list_items')
				.update(updates)
				.eq('id', itemId)
				.eq('shopping_list_id', listId);
		} catch (error) {
			console.error('Error updating list item:', error);
		}
	}

	/**
	 * Delete shopping list
	 */
	async deleteShoppingList(listId: string, userId: string): Promise<void> {
		try {
			// Delete items first
			await supabase.from('shopping_list_items').delete().eq('shopping_list_id', listId);

			// Delete list
			await supabase.from('shopping_lists').delete().eq('id', listId).eq('user_id', userId);
		} catch (error) {
			console.error('Error deleting shopping list:', error);
			throw error;
		}
	}
}

export const shoppingListService = new ShoppingListService();

