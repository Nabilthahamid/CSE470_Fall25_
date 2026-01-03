// MODEL: Sale Model (Pure MVC - Data + Business Logic + Data Access)
import { supabase } from '$lib/config/supabase';
import type { Sale, CreateSaleDTO, SaleFilters, ProfitLossReport, ProductProfitLoss } from './Sale';
import { ProductModel } from './ProductModel';

export class SaleModel {
	// Data properties
	id: string;
	product_id: string;
	user_id?: string | null;
	order_id?: string | null;
	quantity: number;
	sale_price: number;
	cost_price: number;
	total_amount: number;
	profit: number;
	created_at?: string;
	updated_at?: string;
	product_name?: string;
	user_name?: string;

	constructor(data: Sale) {
		this.id = data.id;
		this.product_id = data.product_id;
		this.user_id = data.user_id ?? null;
		this.order_id = data.order_id ?? null;
		this.quantity = data.quantity;
		this.sale_price = data.sale_price;
		this.cost_price = data.cost_price;
		this.total_amount = data.total_amount;
		this.profit = data.profit;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
		this.product_name = data.product_name;
		this.user_name = data.user_name;
	}

	// DATA ACCESS: Get all sales (static method)
	static async getAll(
		filters?: SaleFilters,
		excludeCancelled: boolean = true
	): Promise<SaleModel[]> {
		let query = supabase
			.from('sales')
			.select(
				`
				*,
				products!inner(name),
				users(name)
			`
			)
			.order('created_at', { ascending: false });

		if (filters?.productId) {
			query = query.eq('product_id', filters.productId);
		}

		if (filters?.userId) {
			query = query.eq('user_id', filters.userId);
		}

		if (filters?.startDate) {
			query = query.gte('created_at', filters.startDate);
		}

		if (filters?.endDate) {
			query = query.lte('created_at', filters.endDate);
		}

		const { data, error } = await query;

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return [];
			}
			throw new Error(`Failed to fetch sales: ${error.message}`);
		}

		let sales = (data || []).map(
			(sale: any) =>
				new SaleModel({
					...sale,
					product_name: sale.products?.name,
					user_name: sale.users?.name
				})
		);

		// BUSINESS LOGIC: Filter out sales from cancelled orders
		if (excludeCancelled && sales.some((s) => s.order_id)) {
			try {
				const { data: orders } = await supabase
					.from('orders')
					.select('id, status')
					.in(
						'id',
						sales.filter((s) => s.order_id).map((s) => s.order_id!)
					);

				const cancelledOrderIds = new Set(
					(orders || []).filter((o: any) => o.status === 'cancelled').map((o: any) => o.id)
				);

				sales = sales.filter((sale) => !sale.order_id || !cancelledOrderIds.has(sale.order_id));
			} catch (error) {
				console.warn('Error filtering cancelled orders from sales:', error);
			}
		}

		return sales;
	}

	// DATA ACCESS: Get sale by ID (static method)
	static async getById(id: string): Promise<SaleModel | null> {
		if (!id) throw new Error('Sale ID is required');

		const { data, error } = await supabase
			.from('sales')
			.select(
				`
				*,
				products!inner(name),
				users(name)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null;
			throw new Error(`Failed to fetch sale: ${error.message}`);
		}

		return new SaleModel({
			...data,
			product_name: (data as any).products?.name,
			user_name: (data as any).users?.name
		});
	}

	// DATA ACCESS: Create sale (static method)
	static async create(input: CreateSaleDTO): Promise<SaleModel> {
		// BUSINESS LOGIC: Validate
		if (!input.product_id) throw new Error('Product ID is required');
		if (!input.quantity || input.quantity < 1) {
			throw new Error('Quantity must be at least 1');
		}

		// BUSINESS LOGIC: Get product details
		const product = await ProductModel.getById(input.product_id);

		// BUSINESS LOGIC: Check stock (unless skipping)
		if (!input.skipStockCheck && !product.isInStock(input.quantity)) {
			throw new Error(`Insufficient stock. Available: ${product.stock}`);
		}

		// BUSINESS LOGIC: Calculate sale details
		const costPrice = product.cost_price || 0;
		const salePrice = product.price;
		const totalAmount = salePrice * input.quantity;
		const totalCost = costPrice * input.quantity;
		const profit = totalAmount - totalCost;

		// DATA ACCESS: Create sale
		const { data, error } = await supabase
			.from('sales')
			.insert({
				product_id: input.product_id,
				user_id: input.user_id || null,
				order_id: input.order_id || null,
				quantity: input.quantity,
				sale_price: salePrice,
				cost_price: costPrice,
				total_amount: totalAmount,
				profit: profit
			})
			.select()
			.single();

		if (error) throw new Error(`Failed to create sale: ${error.message}`);

		return new SaleModel(data as Sale);
	}

	// DATA ACCESS: Delete sale (instance method)
	async delete(): Promise<void> {
		const { error } = await supabase.from('sales').delete().eq('id', this.id);
		if (error) throw new Error(`Failed to delete sale: ${error.message}`);
	}

	// DATA ACCESS: Delete sales by order ID (static method)
	static async deleteByOrderId(orderId: string): Promise<void> {
		if (!orderId) throw new Error('Order ID is required');
		const { error } = await supabase.from('sales').delete().eq('order_id', orderId);
		if (error) throw new Error(`Failed to delete sales by order ID: ${error.message}`);
	}

	// DATA ACCESS: Get sales by order ID (static method)
	static async getByOrderId(orderId: string): Promise<SaleModel[]> {
		if (!orderId) throw new Error('Order ID is required');

		const { data, error } = await supabase
			.from('sales')
			.select(
				`
				*,
				products!inner(name),
				users(name)
			`
			)
			.eq('order_id', orderId)
			.order('created_at', { ascending: false });

		if (error) {
			if (error.code === '42P01' || error.message.includes('does not exist')) {
				return [];
			}
			throw new Error(`Failed to fetch sales by order ID: ${error.message}`);
		}

		return (data || []).map(
			(sale: any) =>
				new SaleModel({
					...sale,
					product_name: sale.products?.name,
					user_name: sale.users?.name
				})
		);
	}

	// DATA ACCESS: Get sales by product (static method)
	static async getByProduct(productId: string): Promise<SaleModel[]> {
		if (!productId) throw new Error('Product ID is required');
		return this.getAll({ productId }, true);
	}

	// DATA ACCESS: Get sales by date range (static method)
	static async getByDateRange(startDate: string, endDate: string): Promise<SaleModel[]> {
		if (!startDate || !endDate) throw new Error('Start date and end date are required');
		return this.getAll({ startDate, endDate }, true);
	}

	// BUSINESS LOGIC: Get profit/loss report (static method)
	static async getProfitLossReport(filters?: SaleFilters): Promise<ProfitLossReport> {
		const sales = await this.getAll(filters, true);

		const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
		const totalCost = sales.reduce((sum, sale) => sum + sale.cost_price * sale.quantity, 0);
		const totalProfit = sales.filter((s) => s.profit > 0).reduce((sum, s) => sum + s.profit, 0);
		const totalLoss = Math.abs(
			sales.filter((s) => s.profit < 0).reduce((sum, s) => sum + s.profit, 0)
		);
		const netProfit = totalSales - totalCost;

		// Product breakdown
		const productMap = new Map<string, ProductProfitLoss>();
		for (const sale of sales) {
			const key = sale.product_id;
			if (!productMap.has(key)) {
				productMap.set(key, {
					product_id: sale.product_id,
					product_name: sale.product_name || 'Unknown',
					totalSold: 0,
					totalRevenue: 0,
					totalCost: 0,
					profit: 0,
					loss: 0,
					netProfit: 0
				});
			}

			const breakdown = productMap.get(key)!;
			breakdown.totalSold += sale.quantity;
			breakdown.totalRevenue += sale.total_amount;
			breakdown.totalCost += sale.cost_price * sale.quantity;
			if (sale.profit > 0) {
				breakdown.profit += sale.profit;
			} else {
				breakdown.loss += Math.abs(sale.profit);
			}
			breakdown.netProfit = breakdown.totalRevenue - breakdown.totalCost;
		}

		return {
			totalSales,
			totalCost,
			totalProfit,
			totalLoss,
			netProfit,
			sales: sales.map((s) => s.toJSON()),
			productBreakdown: Array.from(productMap.values())
		};
	}

	// BUSINESS LOGIC: Export sales report as CSV (static method)
	static async exportSalesReport(filters?: SaleFilters, excludeCancelled: boolean = true): Promise<string> {
		const sales = await this.getAll(filters, excludeCancelled);

		// CSV header
		const headers = [
			'ID',
			'Product Name',
			'Customer',
			'Quantity',
			'Sale Price',
			'Cost Price',
			'Total Amount',
			'Profit/Loss',
			'Date'
		];

		// CSV rows
		const rows = sales.map((sale) => [
			sale.id,
			sale.product_name || 'N/A',
			sale.user_name || 'Guest',
			sale.quantity.toString(),
			sale.sale_price.toFixed(2),
			sale.cost_price.toFixed(2),
			sale.total_amount.toFixed(2),
			sale.profit.toFixed(2),
			sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'
		]);

		// Combine header and rows
		const csvContent = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(','))
			.join('\n');

		return csvContent;
	}

	// Convert to plain object (for compatibility)
	toJSON(): Sale {
		return {
			id: this.id,
			product_id: this.product_id,
			user_id: this.user_id,
			order_id: this.order_id,
			quantity: this.quantity,
			sale_price: this.sale_price,
			cost_price: this.cost_price,
			total_amount: this.total_amount,
			profit: this.profit,
			created_at: this.created_at,
			updated_at: this.updated_at,
			product_name: this.product_name,
			user_name: this.user_name
		};
	}
}
