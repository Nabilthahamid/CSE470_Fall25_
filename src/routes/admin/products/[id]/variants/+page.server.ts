// CONTROLLER: Product Variants Page
import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { productVariantService } from '$lib/services/ProductVariantService';
import { productService } from '$lib/services/ProductService';
import { handleError } from '$lib/utils/errors';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireAdmin(locals.user);

	try {
		const product = await productService.getProductById(params.id);
		if (!product) {
			throw new Error('Product not found');
		}

		const variants = await productVariantService.getVariantsByProduct(params.id);

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
			await productVariantService.createVariant(variant);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	bulkCreateVariants: async ({ request, params }) => {
		const formData = await request.formData();
		const attributesJson = formData.get('attributes')?.toString() || '[]';
		const attributes: Array<{ name: string; values: string[] }> = JSON.parse(attributesJson);
		const basePrice = formData.get('base_price') ? parseFloat(formData.get('base_price')?.toString() || '0') : undefined;
		const baseStock = parseInt(formData.get('base_stock')?.toString() || '0');

		try {
			const variants = productVariantService.generateVariantCombinations(
				params.id,
				attributes,
				basePrice,
				baseStock
			);
			await productVariantService.bulkCreateVariants(variants);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	updateVariant: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';
		const variant: any = {};

		if (formData.get('name')) variant.name = formData.get('name')?.toString();
		if (formData.get('sku')) variant.sku = formData.get('sku')?.toString();
		if (formData.get('attributes')) variant.attributes = JSON.parse(formData.get('attributes')?.toString() || '{}');
		if (formData.get('price')) variant.price = parseFloat(formData.get('price')?.toString() || '0');
		if (formData.get('stock')) variant.stock = parseInt(formData.get('stock')?.toString() || '0');
		if (formData.get('image_url')) variant.image_url = formData.get('image_url')?.toString();
		if (formData.get('is_active') !== null) variant.is_active = formData.get('is_active')?.toString() === 'true';

		try {
			await productVariantService.updateVariant(id, variant);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	},

	deleteVariant: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString() || '';

		try {
			await productVariantService.deleteVariant(id);
			return { success: true };
		} catch (error) {
			const { message } = handleError(error);
			return { error: message };
		}
	}
};

