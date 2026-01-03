// API: Product Performance Analysis endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { SaleModel } from '$lib/models/SaleModel';
import { ReviewModel } from '$lib/models/ReviewModel';
import { requireAdmin } from '$lib/utils/auth';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		requireAdmin(locals.user);

		const productId = url.searchParams.get('productId');

		if (productId) {
			// Get performance analysis for a specific product
			const productModel = await ProductModel.getById(productId);
			if (!productModel) {
				return json({ error: 'Product not found' }, { status: 404 });
			}

			const product = productModel.toJSON();
			const allSalesModels = await SaleModel.getAll();
			const sales = allSalesModels.filter(s => s.product_id === productId).map(s => s.toJSON());
			const reviewsModels = await ReviewModel.getByProduct(productId);
			const reviews = reviewsModels.map(r => ({ rating: r.rating }));

			// Simple performance analysis
			const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
			const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
			const analysis = {
				productId,
				salesVelocity: totalSales,
				averageRating: avgRating,
				totalRevenue: sales.reduce((sum, s) => sum + s.total_amount, 0),
				reviewCount: reviews.length
			};
			return json(analysis);
		} else {
			// Get performance analysis for all products
			const productsModels = await ProductModel.getAll();
			const products = productsModels.map(p => p.toJSON());
			const allSalesModels = await SaleModel.getAll();
			const allSales = allSalesModels.map(s => s.toJSON());
			const allReviewsModels = await ReviewModel.getAll();
			const allReviews = allReviewsModels.map(r => r.toJSON());

			const analyses = await Promise.all(
				products.map(async (product) => {
					const productSales = allSales.filter(s => s.product_id === product.id);
					const productReviews = allReviews.filter(r => r.product_id === product.id);
					const totalSales = productSales.reduce((sum, s) => sum + s.quantity, 0);
					const avgRating = productReviews.length > 0 
						? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
						: 0;
					return {
						productId: product.id,
						salesVelocity: totalSales,
						averageRating: avgRating,
						totalRevenue: productSales.reduce((sum, s) => sum + s.total_amount, 0),
						reviewCount: productReviews.length
					};
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

