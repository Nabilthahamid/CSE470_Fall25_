// API: AI Build Optimization endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { build, optimizationGoal } = await request.json();

		if (!build || !Array.isArray(build)) {
			return json({ error: 'Build components are required' }, { status: 400 });
		}

		// Get available products and categories
		const [products, categories] = await Promise.all([
			productService.getAllProducts(),
			pcBuildService.getAllCategories()
		]);

		// Optimize build
		const optimization = await aiService.optimizeBuild(
			build,
			products,
			categories.map(c => ({ id: c.id, name: c.name })),
			optimizationGoal || 'value'
		);

		return json(optimization);
	} catch (error: any) {
		console.error('AI Build Optimization error:', error);
		return json(
			{ error: error.message || 'Failed to optimize build' },
			{ status: 500 }
		);
	}
};

