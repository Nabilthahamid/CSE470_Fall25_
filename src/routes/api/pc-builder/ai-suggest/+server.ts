// API: AI PC Builder Suggestions endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { budget, useCase, preferences } = await request.json();

		if (!budget || !useCase) {
			return json({ error: 'Budget and use case are required' }, { status: 400 });
		}

		// Get available products and categories
		const [products, categories] = await Promise.all([
			productService.getAllProducts(),
			pcBuildService.getAllCategories()
		]);

		// Get AI suggestions
		const suggestion = await aiService.suggestPCBuild(
			{ budget: parseFloat(budget), useCase, preferences },
			products,
			categories.map(c => ({ id: c.id, name: c.name, is_required: c.is_required }))
		);

		return json(suggestion);
	} catch (error: any) {
		console.error('AI PC Builder error:', error);
		return json(
			{ error: error.message || 'Failed to generate PC build suggestions' },
			{ status: 500 }
		);
	}
};

