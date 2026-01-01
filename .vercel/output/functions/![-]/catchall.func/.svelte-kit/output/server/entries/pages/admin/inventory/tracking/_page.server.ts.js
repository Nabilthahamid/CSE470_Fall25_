import { r as requireAdmin } from "../../../../../chunks/auth.js";
import "../../../../../chunks/supabase.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { s as saleService } from "../../../../../chunks/SaleService.js";
import { h as handleError } from "../../../../../chunks/errors.js";
class InventoryService {
  /**
   * Get stock movement history for a product or all products
   */
  async getStockMovementHistory(productId, limit = 100) {
    const sales = await saleService.getAllSales(productId ? { productId } : {});
    const products = await productService.getAllProducts();
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    const movements = [];
    const salesByProduct = /* @__PURE__ */ new Map();
    sales.forEach((sale) => {
      if (!salesByProduct.has(sale.product_id)) {
        salesByProduct.set(sale.product_id, []);
      }
      salesByProduct.get(sale.product_id).push(sale);
    });
    for (const [productId2, productSales] of salesByProduct.entries()) {
      let currentStock = products.find((p) => p.id === productId2)?.stock || 0;
      productSales.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      for (const sale of productSales.slice(0, limit)) {
        const newStock = currentStock;
        currentStock += sale.quantity;
        movements.push({
          product_id: productId2,
          product_name: productMap.get(productId2),
          change_type: "sale",
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
  async getInventoryValuation() {
    const products = await productService.getAllProducts();
    let totalCostValue = 0;
    let totalRetailValue = 0;
    const categoryMap = /* @__PURE__ */ new Map();
    products.forEach((product) => {
      const costValue = (product.cost_price || 0) * product.stock;
      const retailValue = product.price * product.stock;
      totalCostValue += costValue;
      totalRetailValue += retailValue;
      const category = product.component_category_name || "Uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { costValue: 0, retailValue: 0, count: 0 });
      }
      const cat = categoryMap.get(category);
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
  async getABCAnalysis() {
    const products = await productService.getAllProducts();
    const sales = await saleService.getAllSales();
    const productValues = /* @__PURE__ */ new Map();
    products.forEach((product) => {
      const productSales = sales.filter((s) => s.product_id === product.id);
      const revenue = productSales.reduce((sum, s) => sum + s.total_amount, 0);
      productValues.set(product.id, {
        name: product.name,
        value: revenue
      });
    });
    const sorted = Array.from(productValues.entries()).map(([id, data]) => ({ product_id: id, product_name: data.name, value: data.value })).sort((a, b) => b.value - a.value);
    const totalValue = sorted.reduce((sum, p) => sum + p.value, 0);
    let cumulativeValue = 0;
    return sorted.map((product, index) => {
      cumulativeValue += product.value;
      const percentage = totalValue > 0 ? cumulativeValue / totalValue * 100 : 0;
      let category;
      if (percentage <= 80) {
        category = "A";
      } else if (percentage <= 95) {
        category = "B";
      } else {
        category = "C";
      }
      return {
        product_id: product.product_id,
        product_name: product.product_name,
        category,
        totalValue: product.value,
        percentage: totalValue > 0 ? product.value / totalValue * 100 : 0
      };
    });
  }
  /**
   * Detect dead stock (products with no sales for X days)
   */
  async getDeadStock(daysThreshold = 90) {
    const products = await productService.getAllProducts();
    const sales = await saleService.getAllSales();
    const now = /* @__PURE__ */ new Date();
    new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1e3);
    const lastSaleDates = /* @__PURE__ */ new Map();
    sales.forEach((sale) => {
      if (!sale.created_at) return;
      const saleDate = new Date(sale.created_at);
      const current = lastSaleDates.get(sale.product_id);
      if (!current || saleDate > current) {
        lastSaleDates.set(sale.product_id, saleDate);
      }
    });
    const deadStock = [];
    products.forEach((product) => {
      const lastSale = lastSaleDates.get(product.id);
      const daysSinceLastSale = lastSale ? Math.floor((now.getTime() - lastSale.getTime()) / (1e3 * 60 * 60 * 24)) : Infinity;
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
  async getStockAgingReport() {
    const products = await productService.getAllProducts();
    const now = /* @__PURE__ */ new Date();
    return products.filter((p) => p.stock > 0 && p.created_at).map((product) => {
      const createdDate = new Date(product.created_at);
      const daysInStock = Math.floor((now.getTime() - createdDate.getTime()) / (1e3 * 60 * 60 * 24));
      return {
        product_id: product.id,
        product_name: product.name,
        daysInStock,
        currentStock: product.stock,
        created_at: product.created_at
      };
    }).sort((a, b) => b.daysInStock - a.daysInStock);
  }
}
const inventoryService = new InventoryService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const productId = url.searchParams.get("productId") || void 0;
    const daysThreshold = parseInt(url.searchParams.get("daysThreshold") || "90");
    const [movementHistory, valuation, abcAnalysis, deadStock, stockAging] = await Promise.all([
      inventoryService.getStockMovementHistory(productId),
      inventoryService.getInventoryValuation(),
      inventoryService.getABCAnalysis(),
      inventoryService.getDeadStock(daysThreshold),
      inventoryService.getStockAgingReport()
    ]);
    return {
      movementHistory,
      valuation,
      abcAnalysis,
      deadStock,
      stockAging,
      daysThreshold,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      movementHistory: [],
      valuation: {
        totalCostValue: 0,
        totalRetailValue: 0,
        totalProducts: 0,
        byCategory: []
      },
      abcAnalysis: [],
      deadStock: [],
      stockAging: [],
      daysThreshold: 90,
      error: message
    };
  }
};
export {
  load
};
