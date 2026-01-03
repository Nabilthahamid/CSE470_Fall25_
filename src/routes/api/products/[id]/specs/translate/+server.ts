// API: Product specs translator
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';

/**
 * Translate technical specs to user-friendly explanations
 */
function translateSpecs(product: any): Record<string, string> {
	const explanations: Record<string, string> = {};
	const specs = product.specifications || '';

	if (!specs) {
		return explanations;
	}

	// Try to parse JSON specs if it's a JSON string
	let parsedSpecs: Record<string, any> = {};
	try {
		parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
	} catch {
		// If not JSON, treat as plain text
		parsedSpecs = { raw: specs };
	}

	// Common spec translations
	const specTranslations: Record<string, string> = {
		'cpu': 'The central processing unit determines overall system performance. Higher clock speeds and more cores generally mean better performance.',
		'ram': 'Random Access Memory stores data temporarily for quick access. More RAM allows for smoother multitasking.',
		'storage': 'Storage capacity determines how many files, programs, and data you can store on your device.',
		'gpu': 'The graphics processing unit handles visual rendering. Important for gaming, video editing, and graphics-intensive tasks.',
		'resolution': 'Screen resolution determines image sharpness. Higher resolution means clearer and more detailed images.',
		'processor': 'The processor is the brain of your computer, handling all calculations and operations.',
		'memory': 'Memory (RAM) is used to store active programs and data for quick access by the processor.',
		'graphics': 'Graphics card handles rendering of images, videos, and games. Better cards provide smoother visuals.',
		'display': 'Display specifications affect visual quality and user experience.',
		'battery': 'Battery capacity determines how long your device can run on a single charge.'
	};

	// Generate explanations for each spec
	for (const [key, value] of Object.entries(parsedSpecs)) {
		const lowerKey = key.toLowerCase();
		if (specTranslations[lowerKey]) {
			explanations[key] = specTranslations[lowerKey];
		} else {
			explanations[key] = `${key}: ${value}`;
		}
	}

	return explanations;
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const productId = params.id;

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const productModel = await ProductModel.getById(productId);
		if (!productModel) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		const product = productModel.toJSON();
		const explanations = translateSpecs(product);

		return json({ explanations, product });
	} catch (error: any) {
		console.error('Specs translation error:', error);
		return json({ error: error.message || 'Failed to translate specs' }, { status: 500 });
	}
};

