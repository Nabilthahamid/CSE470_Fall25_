// API: Find energy-efficient alternatives
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { findEnergyEfficientAlternatives, calculateBuildEnergy, calculateEnergySavings } from '$lib/utils/energy';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { components } = await request.json();

		if (!components || !Array.isArray(components)) {
			return json({ error: 'Components array is required' }, { status: 400 });
		}

		// Get categories and products
		const [categories, allProductsModels] = await Promise.all([
			getAllCategories(),
			ProductModel.getAll()
		]);
		const allProducts = allProductsModels.map(p => p.toJSON());

		// Build component list
		const componentList = await Promise.all(
			components.map(async (comp: any) => {
				const product = allProducts.find(p => p.id === comp.product_id);
				const category = categories.find(c => c.id === comp.component_category_id);

				if (!product || !category) {
					throw new Error(`Product or category not found`);
				}

				return { product, category };
			})
		);

		// Calculate original energy
		const originalAnalysis = await calculateBuildEnergy(componentList);

		// Find energy-efficient alternatives
		const alternatives = await findEnergyEfficientAlternatives(
			componentList,
			allProducts
		);

		// Calculate savings
		const savings = calculateEnergySavings(originalAnalysis, alternatives);

		return json({
			alternatives,
			savings,
			original_analysis: originalAnalysis
		});
	} catch (error: any) {
		console.error('Energy alternatives error:', error);
		return json(
			{ error: error.message || 'Failed to find alternatives' },
			{ status: 500 }
		);
	}
};

