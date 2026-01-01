// API: AI Pre-built Configurations endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { useCase, budget } = await request.json();

		if (!useCase || !budget) {
			return json({ error: 'Use case and budget are required' }, { status: 400 });
		}

		// Get available products and categories
		const [products, categories] = await Promise.all([
			productService.getAllProducts(),
			pcBuildService.getAllCategories()
		]);

		// Generate pre-built builds
		const builds = await aiService.generatePrebuiltBuilds(
			useCase,
			parseFloat(budget),
			products,
			categories.map(c => ({ id: c.id, name: c.name, is_required: c.is_required }))
		);

		return json({ builds });
	} catch (error: any) {
		console.error('AI Pre-built Builds error:', error);
		return json(
			{ error: error.message || 'Failed to generate pre-built builds' },
			{ status: 500 }
		);
	}
};

