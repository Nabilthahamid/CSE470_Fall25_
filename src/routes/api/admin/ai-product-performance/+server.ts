// API: Product Performance Analysis endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';
import { saleService } from '$lib/services/SaleService';
import { reviewService } from '$lib/services/ReviewService';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		const productId = url.searchParams.get('productId');

		if (productId) {
			// Get performance analysis for a specific product
			const product = await productService.getProductById(productId);
			if (!product) {
				return json({ error: 'Product not found' }, { status: 404 });
			}

			const allSales = await saleService.getAllSales();
			const sales = allSales.filter(s => s.product_id === productId);
			const reviews = await reviewService.getAllReviews({ productId });

			const analysis = await aiService.analyzeProductPerformance(
				productId,
				product,
				sales,
				reviews.map(r => ({ rating: r.rating }))
			);
			return json(analysis);
		} else {
			// Get performance analysis for all products
			const products = await productService.getAllProducts();
			const allSales = await saleService.getAllSales();
			const allReviews = await reviewService.getAllReviews({});

			const analyses = await Promise.all(
				products.map(async (product) => {
					const productSales = allSales.filter(s => s.product_id === product.id);
					const productReviews = allReviews.filter(r => r.product_id === product.id);
					return aiService.analyzeProductPerformance(
						product.id,
						product,
						productSales,
						productReviews.map(r => ({ rating: r.rating }))
					);
				})
			);

			// Sort by sales velocity descending
			analyses.sort((a, b) => b.salesVelocity - a.salesVelocity);

			return json({ analyses });
		}
	} catch (error: any) {
		console.error('Product Performance Analysis error:', error);
		return json(
			{ error: error.message || 'Failed to analyze product performance' },
			{ status: 500 }
		);
	}
};

