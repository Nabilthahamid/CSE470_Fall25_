// API: AI PC Builder Suggestions endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aiService } from '$lib/services/AIService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { requireAuth } from '$lib/utils/auth';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		requireAuth(locals.user);

		const { preferences } = await request.json();
		const userQuestion = preferences || '';

		// Get available products and categories
		const [products, categories] = await Promise.all([
			productService.getAllProducts(),
			pcBuildService.getAllCategories()
		]);

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

			// Generate full build
			const suggestion = await aiService.suggestPCBuild(
				{ budget, useCase, preferences: userQuestion },
				products,
				categories.map(c => ({ id: c.id, name: c.name, is_required: c.is_required }))
			);

			return json(suggestion);
		}

		// For ALL other queries, use Gemini to answer the question naturally
		const answer = await aiService.answerQuestion(
			userQuestion,
			products,
			categories.map(c => ({ id: c.id, name: c.name, is_required: c.is_required }))
		);

		return json({
			answer: answer.answer,
			products: answer.products,
			isQuestion: true
		});
	} catch (error: any) {
		console.error('AI PC Builder error:', error);
		return json(
			{ error: error.message || 'Failed to generate PC build suggestions' },
			{ status: 500 }
		);
	}
};

