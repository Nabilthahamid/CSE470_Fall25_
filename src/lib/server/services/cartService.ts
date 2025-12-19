import { getProductById } from '../models/products';
import type { Product } from '../models/products';

export type CartItem = {
	productId: string;
	quantity: number;
	product?: Product;
};

export type Cart = {
	items: CartItem[];
	total: number;
	subtotal: number;
	tax: number;
	itemCount: number;
};

const TAX_RATE = 0.08; // 8% tax rate - adjust as needed

/**
 * Calculate cart totals including tax
 * @param items - Array of cart items
 * @returns Cart with calculated totals
 */
export async function calculateCartTotals(items: CartItem[]): Promise<Cart> {
	let subtotal = 0;
	let itemCount = 0;

	// Fetch product details and calculate subtotal
	const itemsWithProducts = await Promise.all(
		items.map(async (item) => {
			const product = await getProductById(item.productId);
			if (product) {
				const price = parseFloat(product.price);
				subtotal += price * item.quantity;
				itemCount += item.quantity;
				return { ...item, product };
			}
			return item;
		})
	);

	// Tax is calculated but not included in total (shipping added separately in checkout)
	const tax = subtotal * TAX_RATE;
	const total = subtotal; // No tax included, shipping added at checkout

	return {
		items: itemsWithProducts,
		total: Math.round(total * 100) / 100, // Round to 2 decimal places
		subtotal: Math.round(subtotal * 100) / 100,
		tax: Math.round(tax * 100) / 100,
		itemCount
	};
}

/**
 * Validate inventory for cart items
 * @param items - Array of cart items
 * @returns Object with validation result and any errors
 */
export async function validateInventory(items: CartItem[]): Promise<{
	valid: boolean;
	errors: Array<{ productId: string; message: string }>;
}> {
	const errors: Array<{ productId: string; message: string }> = [];

	for (const item of items) {
		const product = await getProductById(item.productId);

		if (!product) {
			errors.push({
				productId: item.productId,
				message: 'Product not found'
			});
			continue;
		}

		if (product.stock < item.quantity) {
			errors.push({
				productId: item.productId,
				message: `Insufficient stock. Only ${product.stock} available.`
			});
		}

		if (item.quantity <= 0) {
			errors.push({
				productId: item.productId,
				message: 'Quantity must be greater than 0'
			});
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Check if product is in stock
 * @param productId - Product UUID
 * @param quantity - Required quantity
 * @returns True if in stock, false otherwise
 */
export async function checkStock(productId: string, quantity: number): Promise<boolean> {
	const product = await getProductById(productId);
	if (!product) return false;
	return product.stock >= quantity;
}

