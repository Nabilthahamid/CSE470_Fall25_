// CONTROLLER: Discount Management Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { getAllDiscounts, getDiscountAnalytics, getDiscountUsage, createDiscount, updateDiscount, deleteDiscount } from '$lib/utils/discount';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireAdmin(locals.user);

	try {
		const startDate = url.searchParams.get('startDate') || undefined;
		const endDate = url.searchParams.get('endDate') || undefined;
		const activeTab = url.searchParams.get('tab') || 'discounts';

		const [discounts, analytics, usage] = await Promise.all([
			getAllDiscounts(),
			getDiscountAnalytics(startDate, endDate),
			getDiscountUsage(startDate, endDate)
		]);

		return {
			activeTab,
			discounts,
			analytics,
			usage,
			startDate: startDate || '',
			endDate: endDate || '',
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			activeTab: 'discounts',
			discounts: [],
			analytics: {
				totalDiscounts: 0,
				activeDiscounts: 0,
				totalUsage: 0,
				totalDiscountAmount: 0,
				revenueImpact: 0,
				byType: [],
				topDiscounts: [],
				byMonth: []
			},
			usage: [],
			startDate: '',
			endDate: '',
			error: message
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const startDate = formData.get('start_date')?.toString();
		const endDate = formData.get('end_date')?.toString();

		const discount = {
			code: formData.get('code')?.toString() || '',
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			discount_type: (formData.get('discount_type')?.toString() || 'percentage') as 'percentage' | 'fixed_amount' | 'free_shipping',
			discount_value: parseFloat(formData.get('discount_value')?.toString() || '0'),
			minimum_purchase: formData.get('minimum_purchase') ? parseFloat(formData.get('minimum_purchase')?.toString() || '0') : undefined,
			maximum_discount: formData.get('maximum_discount') ? parseFloat(formData.get('maximum_discount')?.toString() || '0') : undefined,
			usage_limit_total: formData.get('usage_limit_total') ? parseInt(formData.get('usage_limit_total')?.toString() || '0') : undefined,
			usage_limit_per_customer: formData.get('usage_limit_per_customer') ? parseInt(formData.get('usage_limit_per_customer')?.toString() || '0') : undefined,
			start_date: startDate ? new Date(startDate).toISOString() : undefined,
			end_date: endDate ? new Date(endDate).toISOString() : undefined,
			is_active: formData.get('is_active')?.toString() === 'true',
			applicable_to: (formData.get('applicable_to')?.toString() || 'all') as 'all' | 'categories' | 'products',
			applicable_ids: formData.get('applicable_ids')?.toString()?.split(',').map(id => id.trim()).filter(Boolean) || undefined
		};

		try {
			await createDiscount(discount);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		if (!id) {
			return { error: 'Discount ID is required' };
		}

		const discount: any = {};

		const name = formData.get('name')?.toString();
		if (name !== null) discount.name = name;

		const description = formData.get('description')?.toString();
		if (description !== null) discount.description = description || undefined;

		const discountType = formData.get('discount_type')?.toString();
		if (discountType) discount.discount_type = discountType;

		const discountValue = formData.get('discount_value')?.toString();
		if (discountValue) discount.discount_value = parseFloat(discountValue);

		const minimumPurchase = formData.get('minimum_purchase')?.toString();
		if (minimumPurchase !== null && minimumPurchase !== '') {
			discount.minimum_purchase = parseFloat(minimumPurchase) || undefined;
		}

		const maximumDiscount = formData.get('maximum_discount')?.toString();
		if (maximumDiscount !== null && maximumDiscount !== '') {
			discount.maximum_discount = parseFloat(maximumDiscount) || undefined;
		}

		const usageLimitTotal = formData.get('usage_limit_total')?.toString();
		if (usageLimitTotal !== null && usageLimitTotal !== '') {
			discount.usage_limit_total = parseInt(usageLimitTotal) || undefined;
		}

		const usageLimitPerCustomer = formData.get('usage_limit_per_customer')?.toString();
		if (usageLimitPerCustomer !== null && usageLimitPerCustomer !== '') {
			discount.usage_limit_per_customer = parseInt(usageLimitPerCustomer) || undefined;
		}

		const startDate = formData.get('start_date')?.toString();
		if (startDate) {
			discount.start_date = startDate ? new Date(startDate).toISOString() : undefined;
		}

		const endDate = formData.get('end_date')?.toString();
		if (endDate) {
			discount.end_date = endDate ? new Date(endDate).toISOString() : undefined;
		}

		const isActive = formData.get('is_active')?.toString();
		if (isActive !== null) discount.is_active = isActive === 'true';

		const applicableTo = formData.get('applicable_to')?.toString();
		if (applicableTo) discount.applicable_to = applicableTo;

		const applicableIds = formData.get('applicable_ids')?.toString();
		if (applicableIds !== null) {
			discount.applicable_ids = applicableIds ? applicableIds.split(',').map(id => id.trim()).filter(Boolean) : undefined;
		}

		try {
			await updateDiscount(id, discount);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await deleteDiscount(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

