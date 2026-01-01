// API: Generate marketing content using Gemini
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/utils/auth';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';

export const POST: RequestHandler = async ({ request, locals }) => {
	requireAdmin(locals.user);

	try {
		const { productId } = await request.json();

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		// Fetch product
		const product = await productService.getProductById(productId);

		// Generate marketing content
		const content = await aiService.generateMarketingContent({
			name: product.name,
			price: product.price,
			category: product.component_category_name || undefined,
			stock: product.stock
		});

		return json({ content, error: null });
	} catch (error: any) {
		console.error('Error generating marketing content:', error);
		return json(
			{ content: null, error: error.message || 'Failed to generate marketing content' },
			{ status: 500 }
		);
	}
};

