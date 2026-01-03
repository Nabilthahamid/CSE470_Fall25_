// API: Review Summary endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReviewModel } from '$lib/models/ReviewModel';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const productId = url.searchParams.get('productId');

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const reviewsModels = await ReviewModel.getByProduct(productId);
		const reviews = reviewsModels.map(r => r.toJSON());

		// Generate simple summary from reviews
		const avgRating = reviews.length > 0 
			? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
			: 0;
		const totalReviews = reviews.length;
		const positiveReviews = reviews.filter(r => r.rating >= 4).length;
		const negativeReviews = reviews.filter(r => r.rating <= 2).length;

		const summary = {
			averageRating: avgRating,
			totalReviews,
			positiveReviews,
			negativeReviews,
			summary: `Based on ${totalReviews} reviews, this product has an average rating of ${avgRating.toFixed(1)}/5.`
		};

		return json(summary);
	} catch (error: any) {
		console.error('Review summary error:', error);
		return json(
			{ error: error.message || 'Failed to generate review summary' },
			{ status: 500 }
		);
	}
};

