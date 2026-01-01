// MODEL: Discount & Coupon data structures
export interface Discount {
	id?: string;
	code: string;
	name: string;
	description?: string;
	discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
	discount_value: number; // Percentage (0-100) or fixed amount
	minimum_purchase?: number;
	maximum_discount?: number; // For percentage discounts
	usage_limit_total?: number; // Total number of times coupon can be used
	usage_limit_per_customer?: number; // Times per customer
	used_count: number;
	start_date?: string;
	end_date?: string;
	is_active: boolean;
	applicable_to: 'all' | 'categories' | 'products'; // What the discount applies to
	applicable_ids?: string[]; // Category or product IDs
	created_at?: string;
	updated_at?: string;
}

export interface CreateDiscountDTO {
	code: string;
	name: string;
	description?: string;
	discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
	discount_value: number;
	minimum_purchase?: number;
	maximum_discount?: number;
	usage_limit_total?: number;
	usage_limit_per_customer?: number;
	start_date?: string;
	end_date?: string;
	is_active: boolean;
	applicable_to: 'all' | 'categories' | 'products';
	applicable_ids?: string[];
}

export interface UpdateDiscountDTO {
	name?: string;
	description?: string;
	discount_type?: 'percentage' | 'fixed_amount' | 'free_shipping';
	discount_value?: number;
	minimum_purchase?: number;
	maximum_discount?: number;
	usage_limit_total?: number;
	usage_limit_per_customer?: number;
	start_date?: string;
	end_date?: string;
	is_active?: boolean;
	applicable_to?: 'all' | 'categories' | 'products';
	applicable_ids?: string[];
}

export interface DiscountUsage {
	discount_id: string;
	order_id: string;
	user_id: string;
	discount_amount: number;
	used_at: string;
}

export interface DiscountAnalytics {
	totalDiscounts: number;
	activeDiscounts: number;
	totalUsage: number;
	totalDiscountAmount: number;
	revenueImpact: number; // Revenue lost due to discounts
	byType: Array<{ type: string; count: number; totalAmount: number }>;
	topDiscounts: Array<{ code: string; usage: number; totalAmount: number }>;
	byMonth: Array<{ month: string; usage: number; totalAmount: number }>;
}

