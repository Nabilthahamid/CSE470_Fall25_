// UTILITY: Inventory helper functions
import { ProductModel } from '$lib/models/ProductModel';
import { SaleModel } from '$lib/models/SaleModel';

/**
 * Get stock movement history
 */
export async function getStockMovementHistory(productId?: string): Promise<any[]> {
	// TODO: Implement if stock_movements table exists
	return [];
}

/**
 * Get inventory valuation
 */
export async function getInventoryValuation(): Promise<{
	totalCostValue: number;
	totalRetailValue: number;
	totalProducts: number;
	byCategory: Array<{ category: string; costValue: number; retailValue: number }>;
}> {
	try {
		const productsModels = await ProductModel.getAll();
		const products = productsModels.map(p => p.toJSON());

		let totalCostValue = 0;
		let totalRetailValue = 0;
		const categoryMap = new Map<string, { costValue: number; retailValue: number }>();

		products.forEach((product) => {
			const costValue = (product.cost_price || 0) * (product.stock || 0);
			const retailValue = product.price * (product.stock || 0);
			totalCostValue += costValue;
			totalRetailValue += retailValue;

			const category = product.component_category_name || 'Uncategorized';
			const existing = categoryMap.get(category) || { costValue: 0, retailValue: 0 };
			categoryMap.set(category, {
				costValue: existing.costValue + costValue,
				retailValue: existing.retailValue + retailValue
			});
		});

		return {
			totalCostValue,
			totalRetailValue,
			totalProducts: products.length,
			byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
				category,
				...data
			}))
		};
	} catch (error) {
		return {
			totalCostValue: 0,
			totalRetailValue: 0,
			totalProducts: 0,
			byCategory: []
		};
	}
}

/**
 * Get ABC analysis
 */
export async function getABCAnalysis(): Promise<any[]> {
	try {
		const salesModels = await SaleModel.getAll();
		const sales = salesModels.map(s => s.toJSON());

		// Group by product
		const productSales = new Map<string, number>();
		sales.forEach((sale) => {
			const existing = productSales.get(sale.product_id) || 0;
			productSales.set(sale.product_id, existing + sale.total_amount);
		});

		// Sort by sales value
		const sorted = Array.from(productSales.entries())
			.map(([productId, value]) => ({ productId, value }))
			.sort((a, b) => b.value - a.value);

		// Calculate cumulative percentage
		const total = sorted.reduce((sum, item) => sum + item.value, 0);
		let cumulative = 0;

		return sorted.map((item) => {
			cumulative += item.value;
			const percentage = (cumulative / total) * 100;
			let category = 'C';
			if (percentage <= 80) category = 'A';
			else if (percentage <= 95) category = 'B';

			return {
				productId: item.productId,
				value: item.value,
				percentage: (item.value / total) * 100,
				cumulativePercentage: percentage,
				category
			};
		});
	} catch (error) {
		return [];
	}
}

/**
 * Get dead stock
 */
export async function getDeadStock(daysThreshold: number = 90): Promise<any[]> {
	// TODO: Implement based on last sale date
	return [];
}

/**
 * Get stock aging report
 */
export async function getStockAgingReport(): Promise<any[]> {
	// TODO: Implement based on product creation date and stock levels
	return [];
}

