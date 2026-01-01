// API: Calculate energy consumption for PC build
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

		// Build component list with full product and category data
		const componentList = await Promise.all(
			components.map(async (comp: any) => {
				const product = await productService.getProductById(comp.product_id);
				const category = categories.find(c => c.id === comp.component_category_id);

				if (!product || !category) {
					throw new Error(`Product or category not found for component ${comp.product_id}`);
				}

				return { product, category };
			})
		);

		// Calculate energy analysis
		const analysis = await energyEfficiencyService.calculateBuildEnergy(componentList);

		// Get PSU recommendations
		const psuProducts = allProducts.filter(p => {
			const category = categories.find(c => c.id === p.component_category_id);
			return category?.name === 'power_supply';
		});

		const psuRecommendation = energyEfficiencyService.recommendPowerSupply(
			analysis.total_peak_watts,
			psuProducts
		);

		return json({
			analysis,
			psu_recommendation: psuRecommendation
		});
	} catch (error: any) {
		console.error('Energy calculation error:', error);
		return json(
			{ error: error.message || 'Failed to calculate energy consumption' },
			{ status: 500 }
		);
	}
};

