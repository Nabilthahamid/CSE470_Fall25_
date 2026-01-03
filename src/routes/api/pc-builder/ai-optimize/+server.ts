// API: AI Build Optimization endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { build, optimizationGoal } = await request.json();

		if (!build || !Array.isArray(build)) {
			return json({ error: 'Build components are required' }, { status: 400 });
		}

		// Get available products and categories
		const [productsModels, categories] = await Promise.all([
			ProductModel.getAll(),
			getAllCategories()
		]);
		const products = productsModels.map(p => p.toJSON());

		// Basic optimization (AI service removed)
		const optimization = {
			optimizedBuild: build,
			suggestions: [],
			message: 'Build optimization feature - AI service removed, basic implementation'
		};

		return json(optimization);
	} catch (error: any) {
		console.error('AI Build Optimization error:', error);
		return json(
			{ error: error.message || 'Failed to optimize build' },
			{ status: 500 }
		);
	}
};

