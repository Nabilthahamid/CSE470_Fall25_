// API: Public product list endpoint (for comparison and other public features)
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { handleError } from '$lib/utils/errors';

export const GET: RequestHandler = async () => {
	try {
		const productsModels = await ProductModel.getAll();
		const products = productsModels.map(p => p.toJSON());

		return json({
			products,
			success: true
		});
	} catch (error) {
		const { message } = handleError(error);
		return json({ 
			products: [], 
			error: message,
			success: false 
		}, { status: 500 });
	}
};

