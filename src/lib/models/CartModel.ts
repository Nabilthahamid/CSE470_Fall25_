// MODEL: Cart Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type { CartItem, AddToCartDTO, UpdateCartItemDTO } from './Cart';
import { ProductModel } from './ProductModel';

export class CartModel {
	// Data properties
	id: string;
	user_id?: string | null;
	product_id: string;
	quantity: number;
	created_at?: string;
	updated_at?: string;
	product?: {
		id: string;
		name: string;
		description: string;
		price: number;
		image_url?: string | null;
		stock: number;
		brand?: string;
	};

	constructor(data: CartItem) {
		this.id = data.id;
		this.user_id = data.user_id ?? null;
		this.product_id = data.product_id;
		this.quantity = data.quantity;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
		this.product = data.product;
	}

	// BUSINESS LOGIC: Validate quantity
	validateQuantity(quantity: number): void {
		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}
	}

	// DATA ACCESS: Get cart items (static method)
	static async getCartItems(userId?: string): Promise<CartModel[]> {
		let query = supabase
			.from('cart_items')
			.select(`
				*,
				products(*)
			`)
			.order('created_at', { ascending: false });

		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			query = query.is('user_id', null);
		}

		const { data, error } = await query;

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return [];
			}
			throw new Error(`Failed to fetch cart items: ${error.message}`);
		}

		return (data || []).map((item: any) => new CartModel({
			...item,
			product: item.products
		}));
	}

	// DATA ACCESS: Add to cart (static method)
	static async addItem(userId: string | null, input: AddToCartDTO): Promise<CartModel> {
		// BUSINESS LOGIC: Validate quantity
		if (input.quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		// BUSINESS LOGIC: Check product exists and has stock
		const product = await ProductModel.getById(input.product_id);
		if (!product) {
			throw new Error('Product not found');
		}

		if (!product.isInStock(input.quantity)) {
			throw new Error(`Insufficient stock. Available: ${product.stock}`);
		}

		// DATA ACCESS: Check if item already exists in cart
		let query = supabase
			.from('cart_items')
			.select('*')
			.eq('product_id', input.product_id);

		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			query = query.is('user_id', null);
		}

		const { data: existingItem } = await query.maybeSingle();

		if (existingItem) {
			// BUSINESS LOGIC: Update quantity
			const newQuantity = existingItem.quantity + input.quantity;
			if (!product.isInStock(newQuantity)) {
				throw new Error(`Insufficient stock. Available: ${product.stock}`);
			}

			return await this.updateItem(existingItem.id, { quantity: newQuantity });
		}

		// DATA ACCESS: Create new cart item
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
		const item = items.find((item) => item.id === data.id);
		if (!item) throw new Error('Failed to retrieve cart item');
		return item;
	}

	// DATA ACCESS: Update cart item (static method)
	static async updateItem(itemId: string, input: UpdateCartItemDTO): Promise<CartModel> {
		// BUSINESS LOGIC: Validate quantity
		if (input.quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		// DATA ACCESS: Get current cart item to check product stock
		const { data: currentItem, error: fetchError } = await supabase
			.from('cart_items')
			.select('*, products(*)')
			.eq('id', itemId)
			.single();

		if (fetchError || !currentItem) {
			throw new Error('Cart item not found');
		}

		// BUSINESS LOGIC: Check product stock
		const product = currentItem.products;
		if (product.stock < input.quantity) {
			throw new Error(`Insufficient stock. Available: ${product.stock}`);
		}

		// DATA ACCESS: Update in database
		const { data, error } = await supabase
			.from('cart_items')
			.update({ quantity: input.quantity, updated_at: new Date().toISOString() })
			.eq('id', itemId)
			.select()
			.single();

		if (error) throw new Error(`Failed to update cart item: ${error.message}`);

		return new CartModel({
			...data,
			product: (data as any).products
		});
	}

	// DATA ACCESS: Remove cart item (static method)
	static async removeItem(itemId: string): Promise<void> {
		const { error } = await supabase
			.from('cart_items')
			.delete()
			.eq('id', itemId);

		if (error) throw new Error(`Failed to remove cart item: ${error.message}`);
	}

	// DATA ACCESS: Clear cart (static method)
	static async clearCart(userId?: string): Promise<void> {
		let query = supabase.from('cart_items').delete();

		if (userId) {
			query = query.eq('user_id', userId);
		} else {
			query = query.is('user_id', null);
		}

		const { error } = await query;
		if (error) throw new Error(`Failed to clear cart: ${error.message}`);
	}

	// BUSINESS LOGIC: Calculate cart total (static method)
	static async getCartTotal(userId?: string): Promise<number> {
		const items = await this.getCartItems(userId);
		return items.reduce((total, item) => {
			if (item.product) {
				return total + item.product.price * item.quantity;
			}
			return total;
		}, 0);
	}

	// Convert to plain object (for compatibility)
	toJSON(): CartItem {
		return {
			id: this.id,
			user_id: this.user_id,
			product_id: this.product_id,
			quantity: this.quantity,
			created_at: this.created_at,
			updated_at: this.updated_at,
			product: this.product
		};
	}
}

