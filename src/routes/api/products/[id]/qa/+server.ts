// API: Product Q&A endpoint
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { productQAService } from '$lib/services/ProductQAService';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
		const { question } = await request.json();
		const productId = params.id;
		const userId = locals.user?.id;

		if (!question || typeof question !== 'string' || question.trim().length === 0) {
			return json({ error: 'Question is required' }, { status: 400 });
		}

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const answer = await productQAService.answerQuestion(productId, question.trim(), userId);

		return json({ answer });
	} catch (error: any) {
		console.error('Product QA error:', error);
		return json({ error: error.message || 'Failed to answer question' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ params }) => {
	try {
		const productId = params.id;

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const qaList = await productQAService.getProductQA(productId);

		return json({ qa: qaList });
	} catch (error: any) {
		console.error('Get product QA error:', error);
		return json({ error: error.message || 'Failed to get Q&A' }, { status: 500 });
	}
};

