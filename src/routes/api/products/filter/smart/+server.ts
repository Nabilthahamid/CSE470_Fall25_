// API: Smart filters and sorting
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProductModel } from '$lib/models/ProductModel';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query, filters, sortBy } = await request.json();

		// Get all products
		const productsModels = await ProductModel.getAll();
		let products = productsModels.map(p => p.toJSON());

		// Apply smart filters based on query
		if (query) {
			const lowerQuery = query.toLowerCase();

			// Intent-based filtering
			if (lowerQuery.includes('best value') || lowerQuery.includes('value')) {
				// Filter and sort by value (price/performance)
				products = products
					.map(p => ({
						product: p,
						valueScore: p.stock > 0 ? p.price / (p.stock + 1) : p.price
					}))
					.sort((a, b) => a.valueScore - b.valueScore)
					.map(item => item.product);
			}

			if (lowerQuery.includes('popular') || lowerQuery.includes('trending')) {
				// Sort by stock (higher stock = more popular)
				products = products.sort((a, b) => b.stock - a.stock);
			}

			// Use case filtering
			if (lowerQuery.includes('gaming')) {
				products = products.filter(p => {
					const text = `${p.name} ${p.description}`.toLowerCase();
					return text.includes('gaming') || text.includes('gpu') || text.includes('graphics');
				});
			}

			if (lowerQuery.includes('work') || lowerQuery.includes('office')) {
				products = products.filter(p => {
					const text = `${p.name} ${p.description}`.toLowerCase();
					return text.includes('office') || text.includes('business') || text.includes('professional');
				});
			}
		}

		// Apply additional filters
		if (filters) {
			if (filters.minPrice) {
				products = products.filter(p => p.price >= filters.minPrice);
			}
			if (filters.maxPrice) {
				products = products.filter(p => p.price <= filters.maxPrice);
			}
			if (filters.categoryId) {
				products = products.filter(p => p.component_category_id === filters.categoryId);
			}
			if (filters.brand) {
				products = products.filter(p => p.brand?.toLowerCase().includes(filters.brand.toLowerCase()));
			}
			if (filters.inStock) {
				products = products.filter(p => p.stock > 0);
			}
		}

		// Smart sorting
		if (sortBy) {
			switch (sortBy) {
				case 'relevance':
					// Sort by relevance (would use AI embeddings in production)
					products = products.sort((a, b) => {
						// Simple relevance: stock availability + price
						const aScore = (a.stock > 0 ? 10 : 0) + (10000 / (a.price || 1));
						const bScore = (b.stock > 0 ? 10 : 0) + (10000 / (b.price || 1));
						return bScore - aScore;
					});
					break;
				case 'value':
					products = products.sort((a, b) => {
						const aValue = a.stock > 0 ? a.price / (a.stock + 1) : a.price;
						const bValue = b.stock > 0 ? b.price / (b.stock + 1) : b.price;
						return aValue - bValue;
					});
					break;
				case 'popularity':
					products = products.sort((a, b) => b.stock - a.stock);
					break;
				case 'price_low':
					products = products.sort((a, b) => a.price - b.price);
					break;
				case 'price_high':
					products = products.sort((a, b) => b.price - a.price);
					break;
			}
		}

		// Suggest filters
		const suggestedFilters = generateSuggestedFilters(products, query);

		return json({
			products: products.slice(0, 50), // Limit results
			total: products.length,
			suggestedFilters,
			sortOptions: ['relevance', 'value', 'popularity', 'price_low', 'price_high']
		});
	} catch (error: any) {
		console.error('Smart filter error:', error);
		return json({ error: error.message || 'Failed to filter products' }, { status: 500 });
	}
};

function generateSuggestedFilters(products: any[], query?: string): string[] {
	const suggestions: string[] = [];

	// Price range suggestions
	const prices = products.map(p => p.price).filter(p => p > 0);
	if (prices.length > 0) {
		const minPrice = Math.min(...prices);
		const maxPrice = Math.max(...prices);
		const midPrice = (minPrice + maxPrice) / 2;

		suggestions.push(`Under Tk ${Math.round(midPrice)}`);
		suggestions.push(`Tk ${Math.round(midPrice)} - Tk ${Math.round(maxPrice)}`);
	}

	// Brand suggestions
	const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].slice(0, 3);
	brands.forEach(brand => {
		suggestions.push(`Brand: ${brand}`);
	});

	// Stock suggestions
	const inStockCount = products.filter(p => p.stock > 0).length;
	if (inStockCount < products.length) {
		suggestions.push('In Stock Only');
	}

	return suggestions;
}

