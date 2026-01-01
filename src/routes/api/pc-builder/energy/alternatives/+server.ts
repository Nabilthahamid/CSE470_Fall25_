// API: Find energy-efficient alternatives
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { energyEfficiencyService } from '$lib/services/EnergyEfficiencyService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { components } = await request.json();

		if (!components || !Array.isArray(components)) {
			return json({ error: 'Components array is required' }, { status: 400 });
		}

		// Get categories and products
		const [categories, allProducts] = await Promise.all([
			pcBuildService.getAllCategories(),
			productService.getAllProducts()
		]);

		// Build component list
		const componentList = await Promise.all(
			components.map(async (comp: any) => {
				const product = await productService.getProductById(comp.product_id);
				const category = categories.find(c => c.id === comp.component_category_id);

				if (!product || !category) {
					throw new Error(`Product or category not found`);
				}

				return { product, category };
			})
		);

		// Find energy-efficient alternatives
		const alternatives = await energyEfficiencyService.findEnergyEfficientAlternatives(
			componentList,
			allProducts
		);

		// Calculate original energy
		const originalAnalysis = await energyEfficiencyService.calculateBuildEnergy(componentList);

		// Calculate savings
		const savings = energyEfficiencyService.calculateEnergySavings(originalAnalysis, alternatives);

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

