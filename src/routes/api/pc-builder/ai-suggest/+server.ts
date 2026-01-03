// API: AI PC Builder Suggestions endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';
import { getAllCategories } from '$lib/utils/pc-builder';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { preferences } = await request.json();
		const userQuestion = preferences || '';

		// Get available products and categories
		const [productsModels, categories] = await Promise.all([
			ProductModel.getAll(),
			getAllCategories()
		]);
		const products = productsModels.map(p => p.toJSON());

		// Check if user explicitly wants a full PC build
		const questionLower = userQuestion.toLowerCase();
		const buildKeywords = ['build a pc', 'build pc', 'pc build', 'computer build', 'gaming pc for', 'workstation for', 'custom pc for'];
		const isExplicitBuildRequest = buildKeywords.some(keyword => questionLower.includes(keyword));

		// Extract budget and use case from question if it's a build request
		if (isExplicitBuildRequest) {
			const budgetMatch = userQuestion.match(/(\d+)\s*(?:taka|tk|taka|bdt)/i);
			const budget = budgetMatch ? parseFloat(budgetMatch[1]) : 50000;
			
			let useCase = 'gaming';
			if (questionLower.includes('work') || questionLower.includes('office')) {
				useCase = 'work';
			} else if (questionLower.includes('content') || questionLower.includes('editing')) {
				useCase = 'content-creation';
			} else if (questionLower.includes('gaming')) {
				useCase = 'gaming';
			}

			// Generate simple build suggestion (AI service removed - basic implementation)
			const suggestion = {
				components: [],
				totalPrice: 0,
				budget,
				useCase,
				message: 'PC build suggestion feature - AI service removed, basic implementation'
			};

			return json(suggestion);
		}

		// For ALL other queries, provide basic answer
		const answer = {
			answer: `I can help you with PC building questions. For "${userQuestion}", please use the PC Builder tool to select components.`,
			products: [],
			isQuestion: true
		};

		return json(answer);
	} catch (error: any) {
		console.error('AI PC Builder error:', error);
		return json(
			{ error: error.message || 'Failed to generate PC build suggestions' },
			{ status: 500 }
		);
	}
};

