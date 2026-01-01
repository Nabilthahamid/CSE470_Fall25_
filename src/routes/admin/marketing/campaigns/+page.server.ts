// CONTROLLER: Promotional Campaigns Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { campaignService } from '$lib/services/CampaignService';
import { discountService } from '$lib/services/DiscountService';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals.user);

	try {
		const [campaigns, discounts, products] = await Promise.all([
			campaignService.getAllCampaigns(),
			discountService.getAllDiscounts(),
			productService.getAllProducts()
		]);

		return {
			campaigns,
			discounts,
			products,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			campaigns: [],
			discounts: [],
			products: [],
			error: message
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const productsJson = formData.get('products')?.toString() || '[]';
		const buyXGetYJson = formData.get('buy_x_get_y_config')?.toString();

		const startDate = formData.get('start_date')?.toString() || '';
		const endDate = formData.get('end_date')?.toString() || '';

		const campaign = {
			name: formData.get('name')?.toString() || '',
			description: formData.get('description')?.toString() || undefined,
			campaign_type: (formData.get('campaign_type')?.toString() || 'flash_sale') as any,
			start_date: startDate ? new Date(startDate).toISOString() : '',
			end_date: endDate ? new Date(endDate).toISOString() : '',
			is_active: formData.get('is_active')?.toString() === 'true',
			discount_id: formData.get('discount_id')?.toString() || undefined,
			products: JSON.parse(productsJson),
			buy_x_get_y_config: buyXGetYJson ? JSON.parse(buyXGetYJson) : undefined,
			image_url: formData.get('image_url')?.toString() || undefined
		};

		try {
			await campaignService.createCampaign(campaign);
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
			return { error: 'Campaign ID is required' };
		}

		const campaign: any = {};

		const name = formData.get('name')?.toString();
		if (name !== null) campaign.name = name;

		const description = formData.get('description')?.toString();
		if (description !== null) campaign.description = description || undefined;

		const campaignType = formData.get('campaign_type')?.toString();
		if (campaignType) campaign.campaign_type = campaignType;

		const startDate = formData.get('start_date')?.toString();
		if (startDate) {
			// Convert datetime-local to ISO string
			campaign.start_date = new Date(startDate).toISOString();
		}

		const endDate = formData.get('end_date')?.toString();
		if (endDate) {
			// Convert datetime-local to ISO string
			campaign.end_date = new Date(endDate).toISOString();
		}

		const isActive = formData.get('is_active')?.toString();
		if (isActive !== null) campaign.is_active = isActive === 'true';

		const discountId = formData.get('discount_id')?.toString();
		if (discountId !== null) campaign.discount_id = discountId || undefined;

		const productsJson = formData.get('products')?.toString();
		if (productsJson) campaign.products = JSON.parse(productsJson);

		const buyXGetYJson = formData.get('buy_x_get_y_config')?.toString();
		if (buyXGetYJson) campaign.buy_x_get_y_config = JSON.parse(buyXGetYJson);

		const imageUrl = formData.get('image_url')?.toString();
		if (imageUrl !== null) campaign.image_url = imageUrl || undefined;

		try {
			await campaignService.updateCampaign(id, campaign);
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
			await campaignService.deleteCampaign(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

