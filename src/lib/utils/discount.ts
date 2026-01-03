// UTILITY: Discount helper functions
import { supabase } from '$lib/config/supabase';
import type { Discount } from '$lib/models/Discount';

/**
 * Record discount usage
 */
export async function recordDiscountUsage(
	couponId: string,
	orderId: string,
	userId: string,
	discountAmount: number
): Promise<void> {
	try {
		await supabase.from('discount_usage').insert({
			coupon_id: couponId,
			order_id: orderId,
			user_id: userId,
			discount_amount: discountAmount,
			used_at: new Date().toISOString()
		});
	} catch (error) {
		console.error('Failed to record discount usage:', error);
		// Non-critical, don't throw
	}
}

/**
 * Validate discount code
 */
export async function validateDiscount(
	code: string,
	userId: string,
	cartTotal: number,
	productIds: string[]
): Promise<{
	valid: boolean;
	discount?: Discount;
	error?: string;
}> {
	try {
		const { data: discount, error } = await supabase
			.from('discounts')
			.select('*')
			.eq('code', code.toUpperCase())
			.eq('is_active', true)
			.single();

		if (error || !discount) {
			return { valid: false, error: 'Invalid or expired coupon code' };
		}

		// Check if discount is expired
		if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
			return { valid: false, error: 'Coupon code has expired' };
		}

		// Check if discount hasn't started yet
		if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
			return { valid: false, error: 'Coupon code is not yet active' };
		}

		// Check minimum purchase amount
		if (discount.minimum_purchase && cartTotal < discount.minimum_purchase) {
			return {
				valid: false,
				error: `Minimum purchase of $${discount.minimum_purchase} required`
			};
		}

		// Check usage limits
		if (discount.max_uses) {
			const { count } = await supabase
				.from('discount_usage')
				.select('id', { count: 'exact', head: true })
				.eq('coupon_id', discount.id);

			if ((count || 0) >= discount.max_uses) {
				return { valid: false, error: 'Coupon code has reached its usage limit' };
			}
		}

		// Check user-specific limits
		if (userId && discount.max_uses_per_user) {
			const { count } = await supabase
				.from('discount_usage')
				.select('id', { count: 'exact', head: true })
				.eq('coupon_id', discount.id)
				.eq('user_id', userId);

			if ((count || 0) >= discount.max_uses_per_user) {
				return { valid: false, error: 'You have already used this coupon code' };
			}
		}

		// Check if applicable to specific products
		if (discount.applicable_product_ids && discount.applicable_product_ids.length > 0) {
			const hasApplicableProduct = productIds.some((id) =>
				discount.applicable_product_ids!.includes(id)
			);
			if (!hasApplicableProduct) {
				return { valid: false, error: 'Coupon code is not applicable to items in your cart' };
			}
		}

		return { valid: true, discount: discount as Discount };
	} catch (error: any) {
		return { valid: false, error: error.message || 'Failed to validate coupon code' };
	}
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(discount: Discount, cartTotal: number): number {
	if (discount.discount_type === 'percentage') {
		return Math.min((cartTotal * discount.discount_value) / 100, discount.max_discount_amount || Infinity);
	} else if (discount.discount_type === 'fixed') {
		return Math.min(discount.discount_value, cartTotal);
	} else if (discount.discount_type === 'free_shipping') {
		return 0; // Shipping cost will be handled separately
	}
	return 0;
}

/**
 * Get all discounts
 */
export async function getAllDiscounts(): Promise<Discount[]> {
	try {
		const { data, error } = await supabase
			.from('discounts')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01') return [];
			throw new Error(`Failed to fetch discounts: ${error.message}`);
		}
		return data || [];
	} catch (error) {
		return [];
	}
}

/**
 * Get discount by ID
 */
export async function getDiscountById(id: string): Promise<Discount | null> {
	const { data, error } = await supabase
		.from('discounts')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		if (error.code === 'PGRST116') return null;
		throw new Error(`Failed to fetch discount: ${error.message}`);
	}
	return data;
}

/**
 * Create discount
 */
export async function createDiscount(discount: any): Promise<Discount> {
	const { data, error } = await supabase
		.from('discounts')
		.insert({ ...discount, created_at: new Date().toISOString() })
		.select()
		.single();

	if (error) throw new Error(`Failed to create discount: ${error.message}`);
	return data;
}

/**
 * Update discount
 */
export async function updateDiscount(id: string, discount: any): Promise<Discount> {
	const { data, error } = await supabase
		.from('discounts')
		.update({ ...discount, updated_at: new Date().toISOString() })
		.eq('id', id)
		.select()
		.single();

	if (error) throw new Error(`Failed to update discount: ${error.message}`);
	return data;
}

/**
 * Delete discount
 */
export async function deleteDiscount(id: string): Promise<void> {
	const { error } = await supabase.from('discounts').delete().eq('id', id);
	if (error) throw new Error(`Failed to delete discount: ${error.message}`);
}

/**
 * Get discount analytics
 */
export async function getDiscountAnalytics(startDate?: string, endDate?: string): Promise<any> {
	// Simplified analytics - can be enhanced
	const discounts = await getAllDiscounts();
	const { OrderModel } = await import('$lib/models/OrderModel');
	const orders = await OrderModel.getAll(startDate ? { startDate, endDate } : undefined);
	
	return {
		totalDiscounts: discounts.length,
		activeDiscounts: discounts.filter(d => d.is_active).length,
		totalUsage: 0,
		totalDiscountAmount: 0,
		revenueImpact: 0,
		byType: [],
		topDiscounts: [],
		byMonth: []
	};
}

/**
 * Get discount usage
 */
export async function getDiscountUsage(startDate?: string, endDate?: string): Promise<any[]> {
	let query = supabase.from('discount_usage').select('*').order('used_at', { ascending: false });

	if (startDate) {
		query = query.gte('used_at', startDate);
	}
	if (endDate) {
		query = query.lte('used_at', endDate);
	}

	const { data, error } = await query;
	if (error) {
		if (error.code === '42P01') return [];
		throw new Error(`Failed to fetch discount usage: ${error.message}`);
	}
	return data || [];
}
