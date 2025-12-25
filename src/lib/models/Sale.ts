// MODEL: Sale data structure and types
export interface Sale {
	id: string;
	product_id: string;
	user_id?: string | null;
	quantity: number;
	sale_price: number;
	cost_price: number;
	total_amount: number;
	profit: number;
	created_at?: string;
	updated_at?: string;
	// Joined data
	product_name?: string;
	user_name?: string;
}

export interface CreateSaleDTO {
	product_id: string;
	user_id?: string | null;
	quantity: number;
	skipStockCheck?: boolean; // Set to true when stock was already updated (e.g., from order)
}

export interface SaleRepository {
	getAll(filters?: SaleFilters): Promise<Sale[]>;
	getById(id: string): Promise<Sale | null>;
	create(data: CreateSaleDTO): Promise<Sale>;
	delete(id: string): Promise<void>;
	getSalesByProduct(productId: string): Promise<Sale[]>;
	getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]>;
	getProfitLossReport(filters?: SaleFilters): Promise<ProfitLossReport>;
}

export interface SaleFilters {
	productId?: string;
	userId?: string;
	startDate?: string;
	endDate?: string;
}

export interface ProfitLossReport {
	totalSales: number;
	totalCost: number;
	totalProfit: number;
	totalLoss: number;
	netProfit: number;
	sales: Sale[];
	productBreakdown: ProductProfitLoss[];
}

export interface ProductProfitLoss {
	product_id: string;
	product_name: string;
	totalSold: number;
	totalRevenue: number;
	totalCost: number;
	profit: number;
	loss: number;
	netProfit: number;
}

