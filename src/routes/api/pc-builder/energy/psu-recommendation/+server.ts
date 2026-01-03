// API: Get power supply recommendation
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { recommendPowerSupply } from '$lib/utils/energy';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { total_peak_watts } = await request.json();

		if (!total_peak_watts || typeof total_peak_watts !== 'number') {
			return json({ error: 'total_peak_watts is required' }, { status: 400 });
		}

		// Get all PSU products
		const [categories, allProductsModels] = await Promise.all([
			getAllCategories(),
			ProductModel.getAll()
		]);
		const allProducts = allProductsModels.map(p => p.toJSON());

		const psuCategory = categories.find(c => 
			c.name === 'power_supply' || c.display_name?.toLowerCase().includes('power')
		);
		const psuProducts = psuCategory
			? allProducts.filter(p => p.component_category_id === psuCategory.id)
			: allProducts.filter(p => {
				const category = categories.find(c => c.id === p.component_category_id);
				return category?.name === 'power_supply' || category?.display_name?.toLowerCase().includes('power');
			});

		const recommendation = recommendPowerSupply(
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

