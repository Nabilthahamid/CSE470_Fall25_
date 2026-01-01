// API: PC Builder Budget Planner
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pcBuildService } from '$lib/services/PCBuildService';
import { productService } from '$lib/services/ProductService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { budget, useCase = 'gaming' } = await request.json();

		if (!budget || budget <= 0) {
			return json({ error: 'Valid budget is required' }, { status: 400 });
		}

		// Get all categories and products
		const categories = await pcBuildService.getAllCategories();
		const allProducts = await productService.getAllProducts();

		// Budget allocation based on use case
		const allocations: Record<string, Record<string, number>> = {
			gaming: {
				GPU: 0.35,
				CPU: 0.20,
				Motherboard: 0.12,
				RAM: 0.10,
				Storage: 0.08,
				PSU: 0.08,
				Case: 0.05,
				Cooling: 0.02
			},
			work: {
				CPU: 0.30,
				RAM: 0.20,
				Storage: 0.15,
				Motherboard: 0.12,
				GPU: 0.10,
				PSU: 0.08,
				Case: 0.03,
				Cooling: 0.02
			},
			'content-creation': {
				CPU: 0.30,
				GPU: 0.25,
				RAM: 0.18,
				Storage: 0.12,
				Motherboard: 0.08,
				PSU: 0.05,
				Case: 0.02
			}
		};

		const allocation = allocations[useCase] || allocations.gaming;

		// Generate budget plan
		const budgetPlan = Object.entries(allocation).map(([categoryName, percentage]) => {
			const categoryBudget = budget * percentage;
			const category = categories.find(c => 
				c.display_name.toLowerCase().includes(categoryName.toLowerCase()) ||
				c.name.toLowerCase().includes(categoryName.toLowerCase())
			);

			if (!category) {
				return {
					categoryName,
					budget: categoryBudget,
					percentage: percentage * 100,
					suggestions: []
				};
			}

			// Find products in this category within budget
			const categoryProducts = allProducts
				.filter(p => p.component_category_id === category.id && p.price <= categoryBudget * 1.2)
				.sort((a, b) => {
					// Prefer products closer to budget
					const aDiff = Math.abs(a.price - categoryBudget);
					const bDiff = Math.abs(b.price - categoryBudget);
					return aDiff - bDiff;
				})
				.slice(0, 3);

			return {
				categoryName,
				categoryId: category.id,
				budget: categoryBudget,
				percentage: percentage * 100,
				suggestions: categoryProducts.map(p => ({
					productId: p.id,
					productName: p.name,
					price: p.price,
					reason: p.price <= categoryBudget 
						? 'Within budget' 
						: 'Slightly over budget but good value'
				}))
			};
		});

		const totalAllocated = budgetPlan.reduce((sum, item) => sum + item.budget, 0);
		const remaining = budget - totalAllocated;

		return json({
			budgetPlan,
			totalBudget: budget,
			totalAllocated,
			remaining,
			useCase,
			recommendations: [
				`For ${useCase}, prioritize ${Object.entries(allocation).sort((a, b) => b[1] - a[1])[0][0]}`,
				remaining > 0 ? `You have Tk ${remaining.toFixed(2)} remaining - consider upgrading key components` : 'Budget fully allocated',
				'Consider future upgrades when planning your build'
			]
		});
	} catch (error: any) {
		console.error('Budget planner error:', error);
		return json({ error: error.message || 'Failed to generate budget plan' }, { status: 500 });
	}
};

