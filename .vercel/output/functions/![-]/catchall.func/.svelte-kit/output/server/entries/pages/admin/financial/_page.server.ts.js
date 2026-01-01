import { r as requireAdmin } from "../../../../chunks/auth.js";
import { s as supabase } from "../../../../chunks/supabase.js";
import { s as saleService } from "../../../../chunks/SaleService.js";
import { o as orderService } from "../../../../chunks/OrderService.js";
import { h as handleError } from "../../../../chunks/errors.js";
class FinancialService {
  // Expenses
  async getAllExpenses(startDate, endDate) {
    try {
      let query = supabase.from("expenses").select("*").order("date", { ascending: false });
      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch expenses: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  async createExpense(expense) {
    const { data, error } = await supabase.from("expenses").insert({ ...expense, created_at: (/* @__PURE__ */ new Date()).toISOString() }).select().single();
    if (error) throw new Error(`Failed to create expense: ${error.message}`);
    return data;
  }
  async updateExpense(id, expense) {
    const { data, error } = await supabase.from("expenses").update({ ...expense, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(`Failed to update expense: ${error.message}`);
    return data;
  }
  async deleteExpense(id) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete expense: ${error.message}`);
  }
  // Payment Transactions
  async getAllTransactions(filters) {
    try {
      let query = supabase.from("payment_transactions").select("*").order("created_at", { ascending: false });
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.paymentMethod) {
        query = query.eq("payment_method", filters.paymentMethod);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "42P01") return [];
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      return [];
    }
  }
  async getFailedTransactions() {
    return this.getAllTransactions({ status: "failed" });
  }
  async getPaymentMethodAnalytics() {
    const transactions = await this.getAllTransactions();
    const methodMap = /* @__PURE__ */ new Map();
    transactions.forEach((t) => {
      if (t.status === "completed") {
        const existing = methodMap.get(t.payment_method) || { count: 0, total: 0 };
        methodMap.set(t.payment_method, {
          count: existing.count + 1,
          total: existing.total + t.amount
        });
      }
    });
    return Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      ...data
    }));
  }
  // Financial Statements
  async generateFinancialStatement(startDate, endDate) {
    const [sales, expenses, orders] = await Promise.all([
      saleService.getAllSales({ startDate, endDate }),
      this.getAllExpenses(startDate, endDate),
      orderService.getAllOrders({ startDate, endDate })
    ]);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const taxRate = 0.15;
    const taxAmount = totalRevenue * taxRate;
    const revenueByCategory = /* @__PURE__ */ new Map();
    sales.forEach((sale) => {
      const category = sale.product_name || "Other";
      revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + sale.total_amount);
    });
    const expensesByCategory = /* @__PURE__ */ new Map();
    expenses.forEach((expense) => {
      expensesByCategory.set(
        expense.category,
        (expensesByCategory.get(expense.category) || 0) + expense.amount
      );
    });
    return {
      period: `${startDate} to ${endDate}`,
      start_date: startDate,
      end_date: endDate,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      tax_amount: taxAmount,
      revenue_by_category: Array.from(revenueByCategory.entries()).map(([category, amount]) => ({
        category,
        amount
      })),
      expenses_by_category: Array.from(expensesByCategory.entries()).map(([category, amount]) => ({
        category,
        amount
      }))
    };
  }
  // Revenue vs Expenses tracking
  async getRevenueVsExpenses(startDate, endDate) {
    const sales = await saleService.getAllSales({ startDate, endDate });
    const expenses = await this.getAllExpenses(startDate, endDate);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const net = totalRevenue - totalExpenses;
    const monthlyData = /* @__PURE__ */ new Map();
    sales.forEach((sale) => {
      if (!sale.created_at) return;
      const date = new Date(sale.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyData.get(monthKey) || { revenue: 0, expenses: 0 };
      monthlyData.set(monthKey, { ...existing, revenue: existing.revenue + sale.total_amount });
    });
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyData.get(monthKey) || { revenue: 0, expenses: 0 };
      monthlyData.set(monthKey, { ...existing, expenses: existing.expenses + expense.amount });
    });
    const byMonth = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data,
      net: data.revenue - data.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));
    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      net,
      byMonth
    };
  }
}
const financialService = new FinancialService();
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const activeTab = url.searchParams.get("tab") || "overview";
    const [expenses, transactions, paymentAnalytics, revenueVsExpenses] = await Promise.all([
      financialService.getAllExpenses(startDate, endDate),
      financialService.getAllTransactions({ startDate, endDate }),
      financialService.getPaymentMethodAnalytics(),
      financialService.getRevenueVsExpenses(startDate, endDate)
    ]);
    const failedTransactions = await financialService.getFailedTransactions();
    let financialStatement = null;
    if (startDate && endDate) {
      financialStatement = await financialService.generateFinancialStatement(startDate, endDate);
    }
    return {
      activeTab,
      expenses,
      transactions,
      failedTransactions,
      paymentAnalytics,
      revenueVsExpenses,
      financialStatement,
      startDate: startDate || "",
      endDate: endDate || "",
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      activeTab: "overview",
      expenses: [],
      transactions: [],
      failedTransactions: [],
      paymentAnalytics: [],
      revenueVsExpenses: { revenue: 0, expenses: 0, net: 0, byMonth: [] },
      financialStatement: null,
      startDate: "",
      endDate: "",
      error: message
    };
  }
};
const actions = {
  createExpense: async ({ request }) => {
    const formData = await request.formData();
    const expense = {
      category: formData.get("category")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      amount: parseFloat(formData.get("amount")?.toString() || "0"),
      date: formData.get("date")?.toString() || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      payment_method: formData.get("payment_method")?.toString() || null,
      receipt_url: formData.get("receipt_url")?.toString() || null,
      notes: formData.get("notes")?.toString() || null
    };
    try {
      await financialService.createExpense(expense);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  updateExpense: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    const expense = {};
    if (formData.get("category")) expense.category = formData.get("category")?.toString();
    if (formData.get("description")) expense.description = formData.get("description")?.toString();
    if (formData.get("amount")) expense.amount = parseFloat(formData.get("amount")?.toString() || "0");
    if (formData.get("date")) expense.date = formData.get("date")?.toString();
    if (formData.get("payment_method")) expense.payment_method = formData.get("payment_method")?.toString() || null;
    if (formData.get("receipt_url")) expense.receipt_url = formData.get("receipt_url")?.toString() || null;
    if (formData.get("notes")) expense.notes = formData.get("notes")?.toString() || null;
    try {
      await financialService.updateExpense(id, expense);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  deleteExpense: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString() || "";
    try {
      await financialService.deleteExpense(id);
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  }
};
export {
  actions,
  load
};
