// API: Enhanced Cart Insights
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cartService } from '$lib/services/CartService';
import { productService } from '$lib/services/ProductService';
import { pcBuildService } from '$lib/services/PCBuildService';
import { enhancedAIService } from '$lib/services/EnhancedAIService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const userId = locals.user?.id;
		if (!userId) {
			return json({ error: 'User must be logged in' }, { status: 401 });
		}

		const cartItems = await cartService.getCartItems(userId);
		
		if (cartItems.length === 0) {
			return json({
				insights: [],
				warnings: [],
				suggestions: [],
				totalSavings: 0,
				missingComponents: []
			});
		}

		const insights: string[] = [];
		const warnings: string[] = [];
		const suggestions: string[] = [];
		let totalSavings = 0;
		const missingComponents: string[] = [];

		// Get all products
		const allProducts = await productService.getAllProducts();
		const cartProducts = cartItems.map(item => item.product).filter(Boolean);

		// Check for PC build components
		const categories = await pcBuildService.getAllCategories();
		const requiredCategories = categories.filter(c => c.is_required);
		const cartCategoryIds = new Set(
			cartProducts
				.map(p => p?.component_category_id)
				.filter(Boolean) as string[]
		);

		// Check for missing required components
		requiredCategories.forEach(category => {
			if (!cartCategoryIds.has(category.id)) {
				missingComponents.push(category.display_name);
			}
		});

		// Check compatibility (basic check)
		const hasCPU = cartProducts.some(p => {
			const cat = categories.find(c => c.id === p?.component_category_id);
			return cat?.name.toLowerCase().includes('cpu');
		});
		const hasMotherboard = cartProducts.some(p => {
			const cat = categories.find(c => c.id === p?.component_category_id);
			return cat?.name.toLowerCase().includes('motherboard');
		});

		if (hasCPU && !hasMotherboard) {
			warnings.push('CPU selected but no motherboard - ensure compatibility');
		}

		// Stock warnings
		cartItems.forEach(item => {
			if (item.product && item.product.stock < item.quantity) {
				warnings.push(`${item.product.name} has limited stock (${item.product.stock} available, you need ${item.quantity})`);
			}
		});

		// Calculate savings
		cartItems.forEach(item => {
			if (item.product && item.product.cost_price && item.product.cost_price < item.product.price) {
				const savings = (item.product.price - item.product.cost_price) * item.quantity;
				totalSavings += savings;
			}
		});

		if (totalSavings > 0) {
			insights.push(`You're saving Tk ${totalSavings.toFixed(2)} on your current cart!`);
		}

		// Suggest complementary products
		if (cartProducts.length > 0) {
			const firstProduct = cartProducts[0];
			if (firstProduct) {
				const similar = enhancedAIService.findSimilarProducts(firstProduct, allProducts);
				const complementary = similar
					.filter(sp => !cartProducts.some(cp => cp?.id === sp.product.id))
					.slice(0, 3);
				
				if (complementary.length > 0) {
					suggestions.push(`Consider adding: ${complementary.map(c => c.product.name).join(', ')}`);
				}
			}
		}

		// Complete build suggestions
		if (missingComponents.length > 0) {
			suggestions.push(`Complete your build by adding: ${missingComponents.join(', ')}`);
		}

		return json({
			insights,
			warnings,
			suggestions,
			totalSavings,
			missingComponents,
			isPCBuild: missingComponents.length > 0 || cartCategoryIds.size > 0
		});
	} catch (error: any) {
		console.error('Cart insights error:', error);
		return json({ error: error.message || 'Failed to generate cart insights' }, { status: 500 });
	}
};

