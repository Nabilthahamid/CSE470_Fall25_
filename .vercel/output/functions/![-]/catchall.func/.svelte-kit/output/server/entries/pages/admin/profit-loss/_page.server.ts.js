import { r as requireAdmin } from "../../../../chunks/auth.js";
import { s as saleService } from "../../../../chunks/SaleService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const productId = url.searchParams.get("productId") || void 0;
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (productId) filters.productId = productId;
    const report = await saleService.getProfitLossReport(filters);
    return {
      report,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      report: {
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        sales: [],
        productBreakdown: []
      },
      error: message
    };
  }
};
const actions = {
  export: async ({ url }) => {
    const startDate = url.searchParams.get("startDate") || void 0;
    const endDate = url.searchParams.get("endDate") || void 0;
    const productId = url.searchParams.get("productId") || void 0;
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (productId) filters.productId = productId;
    try {
      const csvContent = await saleService.exportSalesReport(filters);
      return {
        csvContent,
        filename: `profit-loss-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`
      };
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
