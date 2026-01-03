// CONTROLLER: Product Variants Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { ProductModel } from '$lib/models/ProductModel';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals.user);

	try {
		const productModel = await ProductModel.getById(params.id);
		if (!productModel) {
			throw new Error('Product not found');
		}

		const product = productModel.toJSON();
		// Variants - TODO: Create ProductVariantModel if needed
		const variants: any[] = [];

		return {
			product,
			variants,
			error: null
		};
	} catch (error) {
		const { message } = handleError(error);
		return {
			product: null,
			variants: [],
			error: message
		};
	}
};

export const actions: Actions = {
	createVariant: async ({ request, params }) => {
		const formData = await request.formData();
		const variant = {
			product_id: params.id,
			name: formData.get('name')?.toString() || '',
			sku: formData.get('sku')?.toString() || undefined,
			attributes: JSON.parse(formData.get('attributes')?.toString() || '{}'),
			price: formData.get('price') ? parseFloat(formData.get('price')?.toString() || '0') : undefined,
			stock: parseInt(formData.get('stock')?.toString() || '0'),
			image_url: formData.get('image_url')?.toString() || undefined,
			is_active: formData.get('is_active')?.toString() === 'true'
		};

		try {
			// TODO: Create ProductVariantModel if needed
			// await ProductVariantModel.create(variant);
			return { error: 'Product variants not yet converted to Model' };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	bulkCreateVariants: async ({ request, params }) => {
		// TODO: Implement with ProductVariantModel
		return { error: 'Product variants not yet converted to Model' };
	},

	updateVariant: async ({ request }) => {
		// TODO: Implement with ProductVariantModel
		return { error: 'Product variants not yet converted to Model' };
	},

	deleteVariant: async ({ request }) => {
		// TODO: Implement with ProductVariantModel
		return { error: 'Product variants not yet converted to Model' };
	}
};

