// API: Generate marketing content using Gemini
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { ProductModel } from '$lib/models/ProductModel';

export const POST: RequestHandler = async ({ request, locals }) => {
	requireAdmin(locals.user);

	try {
		const { productId } = await request.json();

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		// Fetch product
		const productModel = await ProductModel.getById(productId);
		if (!productModel) {
			return json({ error: 'Product not found' }, { status: 404 });
		}
		const product = productModel.toJSON();

		// Basic marketing content (AI service removed)
		const content = {
			headline: `Discover ${product.name}`,
			description: `${product.name}${product.description ? ` - ${product.description}` : ''}`,
			callToAction: `Buy now for ${product.price}`
		};

		return json({ content, error: null });
	} catch (error: any) {
		console.error('Error generating marketing content:', error);
		return json(
			{ content: null, error: error.message || 'Failed to generate marketing content' },
			{ status: 500 }
		);
	}
};

