// API: Product specs translator
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { productSpecsTranslatorService } from '$lib/services/ProductSpecsTranslatorService';
import { productService } from '$lib/services/ProductService';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const productId = params.id;

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const product = await productService.getProductById(productId);
		if (!product) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		const explanations = productSpecsTranslatorService.translateSpecs(product);

		return json({ explanations, product });
	} catch (error: any) {
		console.error('Specs translation error:', error);
		return json({ error: error.message || 'Failed to translate specs' }, { status: 500 });
	}
};

