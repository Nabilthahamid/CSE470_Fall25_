// MODEL: Cart data structure and types
export interface CartItem {
	id: string;
	user_id?: string | null;
	product_id: string;
	quantity: number;
	created_at?: string;
	updated_at?: string;
	// Joined data
	product?: {
		id: string;
		name: string;
		description: string;
		price: number;
		image_url?: string | null;
		stock: number;
	};
}

export interface AddToCartDTO {
	product_id: string;
	quantity: number;
}

export interface UpdateCartItemDTO {
	quantity: number;
}

export interface CartRepository {
	getCartItems(userId?: string): Promise<CartItem[]>;
	addToCart(userId: string | null, input: AddToCartDTO): Promise<CartItem>;
	updateCartItem(itemId: string, input: UpdateCartItemDTO): Promise<CartItem>;
	removeCartItem(itemId: string): Promise<void>;
	clearCart(userId?: string): Promise<void>;
	getCartTotal(userId?: string): Promise<number>;
}

