// API: AI bundle suggestions
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { productBundleService } from '$lib/services/ProductBundleService';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const productId = url.searchParams.get('productId') || undefined;
		const limit = parseInt(url.searchParams.get('limit') || '5');

		const bundles = await productBundleService.suggestSmartBundles(productId, limit);

		return json({ bundles });
	} catch (error: any) {
		console.error('Bundle suggestions error:', error);
		return json({ error: error.message || 'Failed to suggest bundles' }, { status: 500 });
	}
};

