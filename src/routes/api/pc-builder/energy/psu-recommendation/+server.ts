// API: Get power supply recommendation
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { energyEfficiencyService } from '$lib/services/EnergyEfficiencyService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { total_peak_watts } = await request.json();

		if (!total_peak_watts || typeof total_peak_watts !== 'number') {
			return json({ error: 'total_peak_watts is required' }, { status: 400 });
		}

		// Get all PSU products
		const [categories, allProducts] = await Promise.all([
			pcBuildService.getAllCategories(),
			productService.getAllProducts()
		]);

		const psuCategory = categories.find(c => c.name === 'power_supply');
		const psuProducts = psuCategory
			? allProducts.filter(p => p.component_category_id === psuCategory.id)
			: [];

		const recommendation = energyEfficiencyService.recommendPowerSupply(
			total_peak_watts,
			psuProducts
		);

		return json({ recommendation });
	} catch (error: any) {
		console.error('PSU recommendation error:', error);
		return json(
			{ error: error.message || 'Failed to get PSU recommendation' },
			{ status: 500 }
		);
	}
};

