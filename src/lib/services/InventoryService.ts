// SERVICE: Inventory tracking and analytics
import { supabase } from '$lib/config/supabase';
import { productService } from './ProductService';
import { saleService } from './SaleService';

export interface StockMovement {
	id?: string;
	product_id: string;
	product_name?: string;
	change_type: 'sale' | 'adjustment' | 'return' | 'purchase' | 'initial';
	quantity_change: number;
	previous_stock: number;
	new_stock: number;
	notes?: string;
	created_at?: string;
	created_by?: string;
}

export interface InventoryValuation {
	totalCostValue: number;
	totalRetailValue: number;
	totalProducts: number;
	byCategory: Array<{
		category: string;
		costValue: number;
		retailValue: number;
		productCount: number;
	}>;
}

export interface ABCProduct {
	product_id: string;
	product_name: string;
	category: 'A' | 'B' | 'C';
	totalValue: number;
	percentage: number;
}

export interface DeadStockProduct {
	product_id: string;
	product_name: string;
	daysSinceLastSale: number;
	currentStock: number;
	lastSaleDate?: string;
}

export interface StockAgingProduct {
	product_id: string;
	product_name: string;
	daysInStock: number;
	currentStock: number;
	created_at?: string;
}

export class InventoryService {
	/**
	 * Get stock movement history for a product or all products
	 */
	async getStockMovementHistory(productId?: string, limit = 100): Promise<StockMovement[]> {
		// Since we don't have a stock_movements table, we'll simulate it from sales
		const sales = await saleService.getAllSales(productId ? { productId } : {});
		
		// Get all products to map IDs to names
		const products = await productService.getAllProducts();
		const productMap = new Map(products.map(p => [p.id, p.name]));

		// Create movement history from sales
		const movements: StockMovement[] = [];
		
		// Group sales by product and date
		const salesByProduct = new Map<string, any[]>();
		sales.forEach(sale => {
			if (!salesByProduct.has(sale.product_id)) {
				salesByProduct.set(sale.product_id, []);
			}
			salesByProduct.get(sale.product_id)!.push(sale);
		});

		// For each product, create movements
		for (const [productId, productSales] of salesByProduct.entries()) {
			let currentStock = products.find(p => p.id === productId)?.stock || 0;
			
			// Sort sales by date (newest first)
			productSales.sort((a, b) => {
				const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
				const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
				return dateB - dateA;
			});

			// Create movements (working backwards from current stock)
			for (const sale of productSales.slice(0, limit)) {
				const newStock = currentStock;
				currentStock += sale.quantity; // Add back what was sold
				
				movements.push({
					product_id: productId,
					product_name: productMap.get(productId),
					change_type: 'sale',
					quantity_change: -sale.quantity,
					previous_stock: currentStock,
					new_stock: newStock,
					created_at: sale.created_at,
					notes: `Sale of ${sale.quantity} units`
				});
			}
		}

		return movements.sort((a, b) => {
			const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
			const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
			return dateB - dateA;
		}).slice(0, limit);
	}

	/**
	 * Calculate inventory valuation
	 */
	async getInventoryValuation(): Promise<InventoryValuation> {
		const products = await productService.getAllProducts();
		
		let totalCostValue = 0;
		let totalRetailValue = 0;

		// Group by category
		const categoryMap = new Map<string, { costValue: number; retailValue: number; count: number }>();

		products.forEach(product => {
			const costValue = (product.cost_price || 0) * product.stock;
			const retailValue = product.price * product.stock;
			
			totalCostValue += costValue;
			totalRetailValue += retailValue;

			const category = product.component_category_name || 'Uncategorized';
			if (!categoryMap.has(category)) {
				categoryMap.set(category, { costValue: 0, retailValue: 0, count: 0 });
			}
			const cat = categoryMap.get(category)!;
			cat.costValue += costValue;
			cat.retailValue += retailValue;
			cat.count += 1;
		});

		return {
			totalCostValue,
			totalRetailValue,
			totalProducts: products.length,
			byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
				category,
				...data,
				productCount: data.count
			}))
		};
	}

	/**
	 * Perform ABC Analysis
	 * A = Top 80% of value
	 * B = Next 15% of value
	 * C = Remaining 5% of value
	 */
	async getABCAnalysis(): Promise<ABCProduct[]> {
		const products = await productService.getAllProducts();
		const sales = await saleService.getAllSales();

		// Calculate total value per product
		const productValues = new Map<string, { name: string; value: number }>();
		
		products.forEach(product => {
			const productSales = sales.filter(s => s.product_id === product.id);
			const revenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);
			productValues.set(product.id, {
				name: product.name,
				value: revenue
			});
		});

		// Sort by value descending
		const sorted = Array.from(productValues.entries())
			.map(([id, data]) => ({ product_id: id, product_name: data.name, value: data.value }))
			.sort((a, b) => b.value - a.value);

		// Calculate cumulative percentage
		const totalValue = sorted.reduce((sum, p) => sum + p.value, 0);
		let cumulativeValue = 0;

		return sorted.map((product, index) => {
			cumulativeValue += product.value;
			const percentage = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;
			
			let category: 'A' | 'B' | 'C';
			if (percentage <= 80) {
				category = 'A';
			} else if (percentage <= 95) {
				category = 'B';
			} else {
				category = 'C';
			}

			return {
				product_id: product.product_id,
				product_name: product.product_name,
				category,
				totalValue: product.value,
				percentage: totalValue > 0 ? (product.value / totalValue) * 100 : 0
			};
		});
	}

	/**
	 * Detect dead stock (products with no sales for X days)
	 */
	async getDeadStock(daysThreshold = 90): Promise<DeadStockProduct[]> {
		const products = await productService.getAllProducts();
		const sales = await saleService.getAllSales();

		const now = new Date();
		const thresholdDate = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);

		// Get last sale date for each product
		const lastSaleDates = new Map<string, Date>();
		sales.forEach(sale => {
			if (!sale.created_at) return;
			const saleDate = new Date(sale.created_at);
			const current = lastSaleDates.get(sale.product_id);
			if (!current || saleDate > current) {
				lastSaleDates.set(sale.product_id, saleDate);
			}
		});

		const deadStock: DeadStockProduct[] = [];

		products.forEach(product => {
			const lastSale = lastSaleDates.get(product.id);
			const daysSinceLastSale = lastSale
				? Math.floor((now.getTime() - lastSale.getTime()) / (1000 * 60 * 60 * 24))
				: Infinity;

			if (daysSinceLastSale >= daysThreshold && product.stock > 0) {
				deadStock.push({
					product_id: product.id,
					product_name: product.name,
					daysSinceLastSale: daysSinceLastSale === Infinity ? 999 : daysSinceLastSale,
					currentStock: product.stock,
					lastSaleDate: lastSale?.toISOString()
				});
			}
		});

		return deadStock.sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);
	}

	/**
	 * Get stock aging report
	 */
	async getStockAgingReport(): Promise<StockAgingProduct[]> {
		const products = await productService.getAllProducts();
		const now = new Date();

		return products
			.filter(p => p.stock > 0 && p.created_at)
			.map(product => {
				const createdDate = new Date(product.created_at!);
				const daysInStock = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
				
				return {
					product_id: product.id,
					product_name: product.name,
					daysInStock,
					currentStock: product.stock,
					created_at: product.created_at
				};
			})
			.sort((a, b) => b.daysInStock - a.daysInStock);
	}
}

export const inventoryService = new InventoryService();

