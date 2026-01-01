// API: Multi-language product translation
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { multiLanguageService } from '$lib/services/MultiLanguageService';

export const GET: RequestHandler = async ({ params, request }) => {
	try {
		const productId = params.id;
		const language = (new URL(request.url).searchParams.get('lang') || 'en') as 'en' | 'bn';

		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}

		const translatedProduct = await multiLanguageService.getProductInLanguage(productId, language);

		return json({ translatedProduct });
	} catch (error: any) {
		console.error('Translation error:', error);
		// If translation fails (e.g., no API keys), return original product with error message
		if (error.message?.includes('AI translation unavailable')) {
			return json({
				error: 'Translation service unavailable. Please configure API keys.',
				translatedProduct: null,
				needsApiKey: true
			}, { status: 503 });
		}
		return json({ error: error.message || 'Failed to translate product' }, { status: 500 });
	}
};

