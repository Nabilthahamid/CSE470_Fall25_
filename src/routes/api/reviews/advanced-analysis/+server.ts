// API: Advanced review analysis
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ReviewModel } from '$lib/models/ReviewModel';

export interface AdvancedReviewAnalysis {
	sentimentTimeline: Array<{ date: string; averageSentiment: number; reviewCount: number }>;
	commonIssues: Array<{ issue: string; frequency: number; severity: 'high' | 'medium' | 'low' }>;
	prosCons: {
		pros: Array<{ aspect: string; confidence: number; mentions: number }>;
		cons: Array<{ aspect: string; confidence: number; mentions: number }>;
	};
	authenticityScores: Array<{ reviewId: string; score: number; isVerified: boolean }>;
	recentTrends: {
		improving: boolean;
		declining: boolean;
		trendDescription: string;
	};
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const productId = url.searchParams.get('productId');

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const reviewsModels = await ReviewModel.getByProduct(productId);
		const reviews = reviewsModels.map(r => r.toJSON());

		if (reviews.length === 0) {
			return json({
				analysis: {
					sentimentTimeline: [],
					commonIssues: [],
					prosCons: { pros: [], cons: [] },
					authenticityScores: [],
					recentTrends: {
						improving: false,
						declining: false,
						trendDescription: 'No reviews available'
					}
				}
			});
		}

		// Analyze sentiment timeline
		const sentimentTimeline = analyzeSentimentTimeline(reviews);

		// Detect common issues
		const commonIssues = detectCommonIssues(reviews);

		// Extract pros and cons
		const prosCons = extractProsCons(reviews);

		// Calculate authenticity scores
		const authenticityScores = calculateAuthenticityScores(reviews);

		// Analyze recent trends
		const recentTrends = analyzeRecentTrends(reviews);

		const analysis: AdvancedReviewAnalysis = {
			sentimentTimeline,
			commonIssues,
			prosCons,
			authenticityScores,
			recentTrends
		};

		return json({ analysis });
	} catch (error: any) {
		console.error('Advanced review analysis error:', error);
		return json({ error: error.message || 'Failed to analyze reviews' }, { status: 500 });
	}
};

function analyzeSentimentTimeline(reviews: any[]): Array<{ date: string; averageSentiment: number; reviewCount: number }> {
	// Group reviews by month
	const byMonth: Record<string, { total: number; count: number }> = {};

	reviews.forEach(review => {
		if (!review.created_at) return;
		const date = new Date(review.created_at);
		const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		
		if (!byMonth[monthKey]) {
			byMonth[monthKey] = { total: 0, count: 0 };
		}
		byMonth[monthKey].total += review.rating;
		byMonth[monthKey].count += 1;
	});

	return Object.entries(byMonth)
		.map(([date, data]) => ({
			date,
			averageSentiment: data.total / data.count,
			reviewCount: data.count
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function detectCommonIssues(reviews: any[]): Array<{ issue: string; frequency: number; severity: 'high' | 'medium' | 'low' }> {
	const issueKeywords: Record<string, string[]> = {
		'Battery Life': ['battery', 'charge', 'dies quickly', 'power'],
		'Performance Issues': ['slow', 'lag', 'freeze', 'crash', 'not working'],
		'Build Quality': ['broken', 'defect', 'poor quality', 'cheap'],
		'Compatibility': ['compatible', 'doesn\'t work', 'not compatible'],
		'Customer Service': ['support', 'service', 'warranty', 'help']
	};

	const issues: Record<string, number> = {};

	reviews.forEach(review => {
		if (!review.comment) return;
		const lowerComment = review.comment.toLowerCase();
		
		Object.entries(issueKeywords).forEach(([issue, keywords]) => {
			if (keywords.some(kw => lowerComment.includes(kw))) {
				issues[issue] = (issues[issue] || 0) + 1;
			}
		});
	});

	return Object.entries(issues)
		.map(([issue, frequency]) => ({
			issue,
			frequency,
			severity: frequency > 5 ? 'high' : frequency > 2 ? 'medium' : 'low' as 'high' | 'medium' | 'low'
		}))
		.sort((a, b) => b.frequency - a.frequency)
		.slice(0, 5);
}

function extractProsCons(reviews: any[]): { pros: Array<{ aspect: string; confidence: number; mentions: number }>; cons: Array<{ aspect: string; confidence: number; mentions: number }> } {
	const pros: Record<string, number> = {};
	const cons: Record<string, number> = {};

	reviews.forEach(review => {
		if (!review.comment) return;
		const lowerComment = review.comment.toLowerCase();
		const isPositive = review.rating >= 4;
		const isNegative = review.rating <= 2;

		const aspects = ['performance', 'design', 'price', 'quality', 'features', 'speed', 'battery'];

		aspects.forEach(aspect => {
			if (lowerComment.includes(aspect)) {
				if (isPositive) {
					pros[aspect] = (pros[aspect] || 0) + 1;
				} else if (isNegative) {
					cons[aspect] = (cons[aspect] || 0) + 1;
				}
			}
		});
	});

	return {
		pros: Object.entries(pros)
			.map(([aspect, mentions]) => ({
				aspect,
				confidence: Math.min(mentions / reviews.length, 1),
				mentions
			}))
			.sort((a, b) => b.mentions - a.mentions)
			.slice(0, 5),
		cons: Object.entries(cons)
			.map(([aspect, mentions]) => ({
				aspect,
				confidence: Math.min(mentions / reviews.length, 1),
				mentions
			}))
			.sort((a, b) => b.mentions - a.mentions)
			.slice(0, 5)
	};
}

function calculateAuthenticityScores(reviews: any[]): Array<{ reviewId: string; score: number; isVerified: boolean }> {
	return reviews.map(review => {
		let score = 0.5; // Base score

		// Longer reviews are more authentic
		if (review.comment && review.comment.length > 50) score += 0.2;
		if (review.comment && review.comment.length > 200) score += 0.1;

		// Rating matches comment sentiment
		const sentiment = review.rating >= 4 ? 'positive' : review.rating <= 2 ? 'negative' : 'neutral';
		if (review.comment) {
			const hasPositive = ['good', 'great', 'excellent', 'love'].some(w => review.comment!.toLowerCase().includes(w));
			const hasNegative = ['bad', 'terrible', 'poor', 'disappointed'].some(w => review.comment!.toLowerCase().includes(w));
			
			if (sentiment === 'positive' && hasPositive && !hasNegative) score += 0.2;
			if (sentiment === 'negative' && hasNegative && !hasPositive) score += 0.2;
		}

		// Check if verified purchase (would need to check sales table)
		const isVerified = false; // Placeholder

		return {
			reviewId: review.id,
			score: Math.min(score, 1),
			isVerified
		};
	});
}

function analyzeRecentTrends(reviews: any[]): { improving: boolean; declining: boolean; trendDescription: string } {
	if (reviews.length < 4) {
		return {
			improving: false,
			declining: false,
			trendDescription: 'Insufficient reviews to determine trend'
		};
	}

	const recent = reviews.slice(0, Math.floor(reviews.length / 2));
	const older = reviews.slice(Math.floor(reviews.length / 2));

	const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
	const olderAvg = older.reduce((sum, r) => sum + r.rating, 0) / older.length;

	const improving = recentAvg > olderAvg + 0.3;
	const declining = recentAvg < olderAvg - 0.3;

	let description = 'Reviews are stable';
	if (improving) {
		description = `Reviews are improving - recent average rating is ${recentAvg.toFixed(1)}/5 (was ${olderAvg.toFixed(1)}/5)`;
	} else if (declining) {
		description = `Reviews are declining - recent average rating is ${recentAvg.toFixed(1)}/5 (was ${olderAvg.toFixed(1)}/5)`;
	}

	return { improving, declining, trendDescription: description };
}

