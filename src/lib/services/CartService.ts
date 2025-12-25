// SERVICE: Cart business logic and data access layer
import { supabase } from '$lib/config/supabase';
import type {
	CartItem,
	AddToCartDTO,
	UpdateCartItemDTO,
	CartRepository
} from '$lib/models/Cart';
import { productService } from './ProductService';

class CartRepositoryImpl implements CartRepository {
	async getCartItems(userId?: string): Promise<CartItem[]> {
		let query = supabase
			.from('cart_items')
			.select(
				`
				*,
				products(*)
			`
			)
			.order('created_at', { ascending: false });

		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			query = query.is('user_id', null);
		}

		const { data, error } = await query;

		if (error) throw new Error(`Failed to fetch cart items: ${error.message}`);

		return (data || []).map((item: any) => ({
			...item,
			product: item.products
		}));
	}

	async addToCart(userId: string | null, input: AddToCartDTO): Promise<CartItem> {
		// Check product exists and has stock
		const product = await productService.getProductById(input.product_id);

		if (product.stock < input.quantity) {
			throw new Error(`Insufficient stock. Available: ${product.stock}`);
		}

		// Check if item already exists in cart
		let query = supabase.from('cart_items').select('*').eq('product_id', input.product_id);

		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			query = query.is('user_id', null);
		}

		const { data: existingItem } = await query.maybeSingle();

		if (existingItem) {
			// Update quantity
			const newQuantity = existingItem.quantity + input.quantity;
			if (product.stock < newQuantity) {
				throw new Error(`Insufficient stock. Available: ${product.stock}`);
			}

			return this.updateCartItem(existingItem.id, { quantity: newQuantity });
		}

		// Create new cart item
		const { data, error } = await supabase
			.from('cart_items')
			.insert({
				user_id: userId,
				product_id: input.product_id,
				quantity: input.quantity
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to add to cart: ${error.message}`);

		// Fetch with product data
		const items = await this.getCartItems(userId || undefined);
		return items.find((item) => item.id === data.id)!;
	}

	async updateCartItem(itemId: string, input: UpdateCartItemDTO): Promise<CartItem> {
		// Get current cart item to check product stock
		const { data: currentItem, error: fetchError } = await supabase
			.from('cart_items')
			.select('*, products(*)')
			.eq('id', itemId)
			.single();

		if (fetchError || !currentItem) {
			throw new Error('Cart item not found');
		}

		const product = currentItem.products;
		if (product.stock < input.quantity) {
			throw new Error(`Insufficient stock. Available: ${product.stock}`);
		}

		const { data, error } = await supabase
			.from('cart_items')
			.update({ quantity: input.quantity })
			.eq('id', itemId)
			.select()
			.single();

		if (error) throw new Error(`Failed to update cart item: ${error.message}`);

		// Fetch with product data
		const userId = data.user_id || undefined;
		const items = await this.getCartItems(userId);
		return items.find((item) => item.id === data.id)!;
	}

	async removeCartItem(itemId: string): Promise<void> {
		const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
		if (error) throw new Error(`Failed to remove cart item: ${error.message}`);
	}

	async clearCart(userId?: string): Promise<void> {
		let query = supabase.from('cart_items').delete();

		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			query = query.is('user_id', null);
		}

		const { error } = await query;
		if (error) throw new Error(`Failed to clear cart: ${error.message}`);
	}

	async getCartTotal(userId?: string): Promise<number> {
		const items = await this.getCartItems(userId);
		return items.reduce((total, item) => {
			if (item.product) {
				return total + item.product.price * item.quantity;
			}
			return total;
		}, 0);
	}
}

// SERVICE: Business logic layer
export class CartService {
	private repository: CartRepository;

	constructor(repository?: CartRepository) {
		this.repository = repository || new CartRepositoryImpl();
	}

	async getCartItems(userId?: string): Promise<CartItem[]> {
		return await this.repository.getCartItems(userId);
	}

	async addToCart(userId: string | null, input: AddToCartDTO): Promise<CartItem> {
		if (!input.product_id) throw new Error('Product ID is required');
		if (!input.quantity || input.quantity < 1) {
			throw new Error('Quantity must be at least 1');
		}

		return await this.repository.addToCart(userId, input);
	}

	async updateCartItem(itemId: string, input: UpdateCartItemDTO): Promise<CartItem> {
		if (!itemId) throw new Error('Cart item ID is required');
		if (!input.quantity || input.quantity < 1) {
			throw new Error('Quantity must be at least 1');
		}

		return await this.repository.updateCartItem(itemId, input);
	}

	async removeCartItem(itemId: string): Promise<void> {
		if (!itemId) throw new Error('Cart item ID is required');
		await this.repository.removeCartItem(itemId);
	}

	async clearCart(userId?: string): Promise<void> {
		await this.repository.clearCart(userId);
	}

	async getCartTotal(userId?: string): Promise<number> {
		return await this.repository.getCartTotal(userId);
	}
}

// Export singleton instance
export const cartService = new CartService();

