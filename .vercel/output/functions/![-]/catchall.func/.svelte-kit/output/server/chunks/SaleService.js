import { s as supabase } from "./supabase.js";
import { productService } from "./ProductService.js";
class SaleRepositoryImpl {
  async getAll(filters) {
    let query = supabase.from("sales").select(
      `
				*,
				products!inner(name),
				users(name)
			`
    ).order("created_at", { ascending: false });
    if (filters?.productId) {
      query = query.eq("product_id", filters.productId);
    }
    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
    const { data, error } = await query;
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return [];
      }
      throw new Error(`Failed to fetch sales: ${error.message}`);
    }
    return (data || []).map((sale) => ({
      ...sale,
      product_name: sale.products?.name,
      user_name: sale.users?.name
    }));
  }
  async getById(id) {
    const { data, error } = await supabase.from("sales").select(
      `
				*,
				products!inner(name),
				users(name)
			`
    ).eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch sale: ${error.message}`);
    }
    return {
      ...data,
      product_name: data.products?.name,
      user_name: data.users?.name
    };
  }
  async create(input) {
    const product = await productService.getProductById(input.product_id);
    if (!input.skipStockCheck && product.stock < input.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }
    const costPrice = product.cost_price || 0;
    const salePrice = product.price;
    const totalAmount = salePrice * input.quantity;
    const totalCost = costPrice * input.quantity;
    const profit = totalAmount - totalCost;
    const { data, error } = await supabase.from("sales").insert({
      product_id: input.product_id,
      user_id: input.user_id || null,
      quantity: input.quantity,
      sale_price: salePrice,
      cost_price: costPrice,
      total_amount: totalAmount,
      profit
    }).select().single();
    if (error) throw new Error(`Failed to create sale: ${error.message}`);
    return data;
  }
  async delete(id) {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete sale: ${error.message}`);
  }
  async getSalesByProduct(productId) {
    return this.getAll({ productId });
  }
  async getSalesByDateRange(startDate, endDate) {
    return this.getAll({ startDate, endDate });
  }
  async getProfitLossReport(filters) {
    const sales = await this.getAll(filters);
    const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalCost = sales.reduce((sum, sale) => sum + sale.cost_price * sale.quantity, 0);
    const totalProfit = sales.filter((s) => s.profit > 0).reduce((sum, s) => sum + s.profit, 0);
    const totalLoss = Math.abs(
      sales.filter((s) => s.profit < 0).reduce((sum, s) => sum + s.profit, 0)
    );
    const netProfit = totalSales - totalCost;
    const productMap = /* @__PURE__ */ new Map();
    for (const sale of sales) {
      const key = sale.product_id;
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_id: sale.product_id,
          product_name: sale.product_name || "Unknown",
          totalSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          profit: 0,
          loss: 0,
          netProfit: 0
        });
      }
      const breakdown = productMap.get(key);
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
      sales,
      productBreakdown: Array.from(productMap.values())
    };
  }
}
class SaleService {
  repository;
  constructor(repository) {
    this.repository = repository || new SaleRepositoryImpl();
  }
  async getAllSales(filters) {
    return await this.repository.getAll(filters);
  }
  async getSaleById(id) {
    if (!id) throw new Error("Sale ID is required");
    const sale = await this.repository.getById(id);
    if (!sale) throw new Error("Sale not found");
    return sale;
  }
  async createSale(input) {
    if (!input.product_id) throw new Error("Product ID is required");
    if (!input.quantity || input.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }
    return await this.repository.create(input);
  }
  async deleteSale(id) {
    if (!id) throw new Error("Sale ID is required");
    await this.repository.delete(id);
  }
  async getSalesByProduct(productId) {
    return await this.repository.getSalesByProduct(productId);
  }
  async getSalesByDateRange(startDate, endDate) {
    return await this.repository.getSalesByDateRange(startDate, endDate);
  }
  async getProfitLossReport(filters) {
    return await this.repository.getProfitLossReport(filters);
  }
  async exportSalesReport(filters) {
    const sales = await this.repository.getAll(filters);
    const headers = [
      "ID",
      "Product Name",
      "Customer",
      "Quantity",
      "Sale Price",
      "Cost Price",
      "Total Amount",
      "Profit/Loss",
      "Date"
    ];
    const rows = sales.map((sale) => [
      sale.id,
      sale.product_name || "N/A",
      sale.user_name || "Guest",
      sale.quantity.toString(),
      sale.sale_price.toFixed(2),
      sale.cost_price.toFixed(2),
      sale.total_amount.toFixed(2),
      sale.profit.toFixed(2),
      sale.created_at ? new Date(sale.created_at).toLocaleDateString() : "N/A"
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    return csvContent;
  }
}
const saleService = new SaleService();
export {
  saleService as s
};
