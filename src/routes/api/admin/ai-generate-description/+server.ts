// API: AI Product Description Generator endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check admin authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized - Please login' }, { status: 401 });
	}
	
	if (locals.user.role !== 'admin') {
		return json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { name, brand, specifications, price, component_category_name } = body;

		if (!name) {
			return json({ error: 'Product name is required' }, { status: 400 });
		}

		const result = await aiService.generateProductDescription({
			name,
			brand: brand || null,
			specifications: specifications || null,
			price: price || undefined,
			component_category_name: component_category_name || null
		});

		return json({
			success: true,
			...result
		});
	} catch (error: any) {
		console.error('Error generating product description:', error);
		return json(
			{ error: error.message || 'Failed to generate product description' },
			{ status: 500 }
		);
	}
};

