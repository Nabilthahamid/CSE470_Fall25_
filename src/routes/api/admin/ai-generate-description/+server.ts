// API: AI Product Description Generator endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
// AI service removed - basic implementation

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

		// Basic description generation (AI service removed)
		const description = `${name}${brand ? ` by ${brand}` : ''}${specifications ? `. ${specifications}` : ''}${price ? `. Price: ${price}` : ''}`;
		const shortDescription = `${name}${brand ? ` by ${brand}` : ''}`;

		return json({
			success: true,
			description,
			shortDescription,
			keywords: [name, brand, component_category_name].filter(Boolean)
		});
	} catch (error: any) {
		console.error('Error generating product description:', error);
		return json(
			{ error: error.message || 'Failed to generate product description' },
			{ status: 500 }
		);
	}
};

