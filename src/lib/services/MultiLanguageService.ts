// SERVICE: Multi-language product descriptions with AI translation
import { productService } from './ProductService';
import type { Product } from '$lib/models/Product';
import { supabase } from '$lib/config/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

export type SupportedLanguage = 'en' | 'bn';

export interface TranslatedProduct {
	product: Product;
	language: SupportedLanguage;
	translatedName?: string;
	translatedDescription?: string;
	translatedSpecs?: string;
	translatedFeatures?: string[];
}

interface StoredTranslation {
	id: string;
	product_id: string;
	language: string;
	translated_name: string | null;
	translated_description: string | null;
	translated_specifications: string | null;
	translated_features: string | null;
}

export class MultiLanguageService {
	/**
	 * Get or create translation for a product
	 * Checks database cache first, then uses AI if needed
	 */
	async translateProduct(
		product: Product,
		targetLanguage: SupportedLanguage
	): Promise<TranslatedProduct> {
		if (targetLanguage === 'en') {
			// Already in English
			return {
				product,
				language: 'en'
			};
		}

		// Check if translation exists in database
		const cached = await this.getCachedTranslation(product.id, targetLanguage);
		if (cached) {
			return {
				product,
				language: targetLanguage,
				translatedName: cached.translated_name || undefined,
				translatedDescription: cached.translated_description || undefined,
				translatedSpecs: cached.translated_specifications || undefined,
				translatedFeatures: cached.translated_features
					? JSON.parse(cached.translated_features)
					: undefined
			};
		}

		// Generate AI translation
		let translation;
		try {
			translation = await this.generateAITranslation(product, targetLanguage);
		} catch (error) {
			console.error('Translation error:', error);
			// If AI translation fails completely, return empty (don't use bad fallback)
			// User will see original English text
			return {
				product,
				language: targetLanguage
			};
		}

		// Cache the translation (non-blocking - don't fail if cache save fails)
		try {
			await this.saveTranslation(product.id, targetLanguage, translation);
		} catch (cacheError) {
			console.warn('Could not cache translation:', cacheError);
			// Continue anyway - translation is still returned
		}

		return {
			product,
			language: targetLanguage,
			...translation
		};
	}

	/**
	 * Get cached translation from database
	 */
	private async getCachedTranslation(
		productId: string,
		language: SupportedLanguage
	): Promise<StoredTranslation | null> {
		try {
			const { data, error } = await supabase
				.from('product_translations')
				.select('*')
				.eq('product_id', productId)
				.eq('language', language)
				.single();

			if (error) {
				// Table might not exist yet
				if (error.code === '42P01' || error.message.includes('does not exist')) {
					return null;
				}
				return null;
			}

			return data;
		} catch {
			return null;
		}
	}

	/**
	 * Save translation to database cache
	 */
	private async saveTranslation(
		productId: string,
		language: SupportedLanguage,
		translation: {
			translatedName?: string;
			translatedDescription?: string;
			translatedSpecs?: string;
			translatedFeatures?: string[];
		}
	): Promise<void> {
		try {
			const { error } = await supabase.from('product_translations').upsert({
				product_id: productId,
				language,
				translated_name: translation.translatedName || null,
				translated_description: translation.translatedDescription || null,
				translated_specifications: translation.translatedSpecs || null,
				translated_features: translation.translatedFeatures
					? JSON.stringify(translation.translatedFeatures)
					: null
			});

			if (error && !error.message.includes('does not exist')) {
				console.error('Error saving translation:', error);
			}
		} catch (error) {
			// Table might not exist yet - that's okay
			console.warn('Could not save translation to database:', error);
		}
	}

	/**
	 * Generate AI translation using Gemini or OpenAI
	 * Context-aware translation that maintains technical accuracy
	 */
	private async generateAITranslation(
		product: Product,
		targetLanguage: SupportedLanguage
	): Promise<{
		translatedName?: string;
		translatedDescription?: string;
		translatedSpecs?: string;
		translatedFeatures?: string[];
	}> {
		// Try Gemini first (free tier), then OpenAI
		// NOTE: We avoid using fallback as it creates poor mixed-language translations
		try {
			return await this.translateWithGemini(product, targetLanguage);
		} catch (geminiError) {
			console.warn('Gemini translation failed, trying OpenAI:', geminiError);
			try {
				return await this.translateWithOpenAI(product, targetLanguage);
			} catch (openAIError) {
				console.error('Both AI translation services failed:', openAIError);
				// Don't use fallback - it creates poor quality mixed-language text
				// Instead, throw error so caller can handle gracefully
				throw new Error(
					'AI translation unavailable. Please configure GEMINI_API_KEY or OPENAI_API_KEY in .env file for proper translations.'
				);
			}
		}
	}

	/**
	 * Translate using Google Gemini
	 */
	private async translateWithGemini(
		product: Product,
		targetLanguage: SupportedLanguage
	): Promise<{
		translatedName?: string;
		translatedDescription?: string;
		translatedSpecs?: string;
		translatedFeatures?: string[];
	}> {
		const geminiApiKey = env.GEMINI_API_KEY;
		if (!geminiApiKey) {
			throw new Error('Gemini API key not configured');
		}

		const genAI = new GoogleGenerativeAI(geminiApiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

		const languageName = targetLanguage === 'bn' ? 'Bengali (Bangla)' : 'English';
		const languageCode = targetLanguage === 'bn' ? 'bn' : 'en';

		const prompt = `You are an expert translator specializing in technical product descriptions for e-commerce. Translate the following product information to ${languageName} (${languageCode}).

CRITICAL TRANSLATION REQUIREMENTS:
1. Translate the ENTIRE text naturally - do NOT mix languages or leave English words untranslated
2. For Bengali: Translate everything into proper Bengali script (Bangla) with correct grammar and natural flow
3. Keep ONLY brand names and model numbers in English (e.g., "Netac N600S" stays as "Netac N600S")
4. Technical terms: Translate common terms naturally (e.g., "SSD" can be "এসএসডি", "performance" → "পারফরমেন্স", "speed" → "গতি")
5. Write in natural, professional ${languageName} - the translation should read as if originally written in ${languageName}
6. Do NOT create mixed-language text like "high-মান" - translate completely to "${languageName === 'Bengali (Bangla)' ? 'উচ্চ মানের' : 'high-quality'}"

Product to translate:
- Name: ${product.name}
- Description: ${product.description || 'N/A'}
- Specifications: ${product.specifications || 'N/A'}

Return a JSON object with this exact structure:
{
  "translatedName": "Fully translated product name in ${languageName}",
  "translatedDescription": "Complete translation of description in ${languageName} - natural and professional",
  "translatedSpecs": "Complete translation of specifications in ${languageName}",
  "translatedFeatures": ["Fully translated feature 1", "Fully translated feature 2"]
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no additional text. The translation must be COMPLETE and NATURAL in ${languageName}.`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();

		// Parse JSON from response
		let parsed;
		try {
			// Remove markdown code blocks if present
			const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
			parsed = JSON.parse(cleaned);
		} catch (parseError) {
			throw new Error(`Failed to parse Gemini response: ${text}`);
		}

		return {
			translatedName: parsed.translatedName,
			translatedDescription: parsed.translatedDescription,
			translatedSpecs: parsed.translatedSpecs,
			translatedFeatures: parsed.translatedFeatures || []
		};
	}

	/**
	 * Translate using OpenAI
	 */
	private async translateWithOpenAI(
		product: Product,
		targetLanguage: SupportedLanguage
	): Promise<{
		translatedName?: string;
		translatedDescription?: string;
		translatedSpecs?: string;
		translatedFeatures?: string[];
	}> {
		const openAIApiKey = env.OPENAI_API_KEY;
		if (!openAIApiKey) {
			throw new Error('OpenAI API key not configured');
		}

		const openai = new OpenAI({ apiKey: openAIApiKey });
		const languageName = targetLanguage === 'bn' ? 'Bengali (Bangla)' : 'English';

		const prompt = `You are an expert translator specializing in technical product descriptions for e-commerce. Translate the following product information to ${languageName}.

CRITICAL TRANSLATION REQUIREMENTS:
1. Translate the ENTIRE text naturally - do NOT mix languages or leave English words untranslated
2. For Bengali: Translate everything into proper Bengali script (Bangla) with correct grammar and natural flow
3. Keep ONLY brand names and model numbers in English (e.g., "Netac N600S" stays as "Netac N600S")
4. Technical terms: Translate common terms naturally (e.g., "SSD" → "এসএসডি", "performance" → "পারফরমেন্স", "speed" → "গতি")
5. Write in natural, professional ${languageName} - the translation should read as if originally written in ${languageName}
6. Do NOT create mixed-language text - translate completely

Product to translate:
- Name: ${product.name}
- Description: ${product.description || 'N/A'}
- Specifications: ${product.specifications || 'N/A'}

Return a JSON object with this exact structure:
{
  "translatedName": "Fully translated product name in ${languageName}",
  "translatedDescription": "Complete translation of description in ${languageName} - natural and professional",
  "translatedSpecs": "Complete translation of specifications in ${languageName}",
  "translatedFeatures": ["Fully translated feature 1", "Fully translated feature 2"]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting. The translation must be COMPLETE and NATURAL in ${languageName}.`;

		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.3,
			response_format: { type: 'json_object' }
		});

		const content = completion.choices[0]?.message?.content;
		if (!content) {
			throw new Error('OpenAI returned empty response');
		}

		const parsed = JSON.parse(content);

		return {
			translatedName: parsed.translatedName,
			translatedDescription: parsed.translatedDescription,
			translatedSpecs: parsed.translatedSpecs,
			translatedFeatures: parsed.translatedFeatures || []
		};
	}

	/**
	 * Fallback translation using rule-based approach
	 * NOTE: This is a basic fallback. For best results, configure GEMINI_API_KEY or OPENAI_API_KEY
	 */
	private translateWithFallback(
		product: Product,
		targetLanguage: SupportedLanguage
	): {
		translatedName?: string;
		translatedDescription?: string;
		translatedSpecs?: string;
		translatedFeatures?: string[];
	} {
		if (targetLanguage !== 'bn') {
			return {};
		}

		// This fallback is limited - it only does keyword replacement
		// For proper translation, API keys must be configured
		console.warn(
			'Using fallback translation. For better quality, set GEMINI_API_KEY or OPENAI_API_KEY in .env'
		);

		// Common tech terms translation dictionary
		const translations: Record<string, string> = {
			processor: 'প্রসেসর',
			graphics: 'গ্রাফিক্স',
			memory: 'মেমরি',
			storage: 'স্টোরেজ',
			keyboard: 'কীবোর্ড',
			mouse: 'মাউস',
			monitor: 'মনিটর',
			laptop: 'ল্যাপটপ',
			desktop: 'ডেস্কটপ',
			gaming: 'গেমিং',
			performance: 'পারফরমেন্স',
			speed: 'গতি',
			quality: 'মান',
			warranty: 'ওয়ারেন্টি',
			price: 'দাম',
			graphics: 'গ্রাফিক্স কার্ড',
			ram: 'র‍্যাম',
			ssd: 'এসএসডি',
			hdd: 'এইচডিডি',
			high: 'উচ্চ',
			product: 'প্রোডাক্ট',
			designed: 'নকশা করা',
			exceptional: 'অসাধারণ',
			for: 'জন্য',
			and: 'এবং',
			with: 'সাথে',
			the: 'এই',
			a: 'একটি',
			an: 'একটি'
		};

		const translateText = (text: string): string => {
			// This is a very basic fallback - just keyword replacement
			// It will create mixed language text, which is why API keys are recommended
			let translated = text;
			Object.entries(translations).forEach(([en, bn]) => {
				const regex = new RegExp(`\\b${en}\\b`, 'gi');
				translated = translated.replace(regex, bn);
			});
			return translated;
		};

		return {
			translatedName: translateText(product.name),
			translatedDescription: product.description ? translateText(product.description) : undefined,
			translatedSpecs: product.specifications ? translateText(product.specifications) : undefined,
			translatedFeatures: []
		};
	}

	/**
	 * Get product in user's preferred language
	 * Checks cache first, then generates if needed
	 */
	async getProductInLanguage(
		productId: string,
		language: SupportedLanguage
	): Promise<TranslatedProduct> {
		const product = await productService.getProductById(productId);
		if (!product) {
			throw new Error('Product not found');
		}

		return this.translateProduct(product, language);
	}

	/**
	 * Translate multiple products efficiently
	 * Uses batch processing and caching
	 */
	async translateProducts(
		products: Product[],
		targetLanguage: SupportedLanguage
	): Promise<TranslatedProduct[]> {
		if (targetLanguage === 'en') {
			return products.map((p) => ({ product: p, language: 'en' }));
		}

		// Check cache for all products first
		const productIds = products.map((p) => p.id);
		const cachedTranslations = await this.getCachedTranslations(productIds, targetLanguage);

		// Translate products that aren't cached
		const results = await Promise.all(
			products.map(async (product) => {
				const cached = cachedTranslations.find((t) => t.product_id === product.id);
				if (cached) {
					return {
						product,
						language: targetLanguage,
						translatedName: cached.translated_name || undefined,
						translatedDescription: cached.translated_description || undefined,
						translatedSpecs: cached.translated_specifications || undefined,
						translatedFeatures: cached.translated_features
							? JSON.parse(cached.translated_features)
							: undefined
					};
				}

				// Generate translation for uncached products
				return this.translateProduct(product, targetLanguage);
			})
		);

		return results;
	}

	/**
	 * Get multiple cached translations
	 */
	private async getCachedTranslations(
		productIds: string[],
		language: SupportedLanguage
	): Promise<StoredTranslation[]> {
		try {
			const { data, error } = await supabase
				.from('product_translations')
				.select('*')
				.in('product_id', productIds)
				.eq('language', language);

			if (error) {
				if (error.code === '42P01' || error.message.includes('does not exist')) {
					return [];
				}
				return [];
			}

			return data || [];
		} catch {
			return [];
		}
	}

	/**
	 * Detect user's preferred language from browser/request
	 */
	detectLanguage(acceptLanguage?: string): SupportedLanguage {
		if (!acceptLanguage) return 'en';

		if (acceptLanguage.includes('bn') || acceptLanguage.includes('ben')) {
			return 'bn';
		}

		return 'en';
	}

	/**
	 * Clear translation cache for a product (useful when product is updated)
	 */
	async clearTranslationCache(productId: string, language?: SupportedLanguage): Promise<void> {
		try {
			let query = supabase.from('product_translations').delete().eq('product_id', productId);

			if (language) {
				query = query.eq('language', language);
			}

			await query;
		} catch (error) {
			// Table might not exist
			console.warn('Could not clear translation cache:', error);
		}
	}
}

export const multiLanguageService = new MultiLanguageService();

