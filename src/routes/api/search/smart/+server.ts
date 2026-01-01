// API: Smart search with AI intent understanding
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { productService } from '$lib/services/ProductService';
import { aiService } from '$lib/services/AIService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query } = await request.json();

		if (!query || typeof query !== 'string' || query.trim().length === 0) {
			return json({ error: 'Search query is required' }, { status: 400 });
		}

		// Get all products for semantic search
		const allProducts = await productService.getAllProducts();

		// Extract intent and keywords from query
		const lowerQuery = query.toLowerCase();

		// Intent detection
		let intent: 'product_search' | 'price_range' | 'use_case' | 'specification' = 'product_search';
		let filters: any = {};

		// Price range detection
		const priceMatch = lowerQuery.match(/(?:under|below|less than|max|maximum)\s*(\d+)/i);
		if (priceMatch) {
			intent = 'price_range';
			filters.maxPrice = parseFloat(priceMatch[1]);
		}

		const priceRangeMatch = lowerQuery.match(/(\d+)\s*(?:to|-|and)\s*(\d+)/i);
		if (priceRangeMatch) {
			intent = 'price_range';
			filters.minPrice = parseFloat(priceRangeMatch[1]);
			filters.maxPrice = parseFloat(priceRangeMatch[2]);
		}

		// Use case detection
		if (lowerQuery.includes('gaming') || lowerQuery.includes('game')) {
			intent = 'use_case';
			filters.useCase = 'gaming';
		} else if (lowerQuery.includes('work') || lowerQuery.includes('office') || lowerQuery.includes('productivity')) {
			intent = 'use_case';
			filters.useCase = 'work';
		} else if (lowerQuery.includes('editing') || lowerQuery.includes('video') || lowerQuery.includes('content')) {
			intent = 'use_case';
			filters.useCase = 'content-creation';
		}

		// Perform search
		let results = await productService.searchProducts(query);

		// Apply filters
		if (filters.maxPrice) {
			results = results.filter(p => p.price <= filters.maxPrice);
		}
		if (filters.minPrice) {
			results = results.filter(p => p.price >= filters.minPrice);
		}

		// Use case filtering (keyword-based)
		if (filters.useCase) {
			const useCaseKeywords: Record<string, string[]> = {
				gaming: ['gaming', 'gpu', 'graphics', 'rgb', 'performance', 'fps', 'rtx', 'gtx'],
				work: ['office', 'productivity', 'business', 'professional', 'workstation', 'efficient'],
				'content-creation': ['editing', 'video', 'rendering', 'creative', 'workstation', 'color']
			};

			const keywords = useCaseKeywords[filters.useCase] || [];
			results = results.filter(p => {
				const text = `${p.name} ${p.description} ${p.specifications || ''}`.toLowerCase();
				return keywords.some(kw => text.includes(kw));
			});
		}

		// Rank results by relevance
		const rankedResults = results.map(product => {
			let relevanceScore = 0;
			const productText = `${product.name} ${product.description} ${product.specifications || ''}`.toLowerCase();
			const queryWords = query.toLowerCase().split(/\s+/);

			// Exact name match
			if (product.name.toLowerCase().includes(query.toLowerCase())) {
				relevanceScore += 10;
			}

			// Word matches
			queryWords.forEach(word => {
				if (productText.includes(word)) {
					relevanceScore += 2;
				}
			});

			// Stock availability boost
			if (product.stock > 0) {
				relevanceScore += 1;
			}

			return { product, relevanceScore };
		}).sort((a, b) => b.relevanceScore - a.relevanceScore)
		.map(item => item.product);

		// Suggest related searches
		const relatedSearches: string[] = [];
		if (results.length > 0) {
			const firstProduct = results[0];
			if (firstProduct.brand) {
				relatedSearches.push(`${firstProduct.brand} ${query.split(' ')[0]}`);
			}
			if (firstProduct.component_category_id) {
				relatedSearches.push(`Best ${query.split(' ')[0]} under ${Math.round(firstProduct.price * 1.2)}`);
			}
		}

		return json({
			results: rankedResults.slice(0, 20),
			intent,
			filters,
			relatedSearches: relatedSearches.slice(0, 3),
			totalResults: rankedResults.length
		});
	} catch (error: any) {
		console.error('Smart search error:', error);
		return json({ error: error.message || 'Failed to perform search' }, { status: 500 });
	}
};

