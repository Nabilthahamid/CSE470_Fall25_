import { calculateFinancialMetrics, getDailyFinancialData, getTopSellingProducts } from "$lib/server/services/financialService";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  // Get date range from query params or default to last 30 days
  const dateRange = url.searchParams.get("range") || "30";
  const endDate = new Date();
  const startDate = new Date();
  
  switch (dateRange) {
    case "7":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "365":
      startDate.setDate(startDate.getDate() - 365);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Calculate overall metrics for the date range
  const metrics = await calculateFinancialMetrics(startDate, endDate);
  
  // Get daily breakdown
  const dailyData = await getDailyFinancialData(startDate, endDate);
  
  // Get top selling products
  const topProducts = await getTopSellingProducts(10, startDate, endDate);

  // Calculate today's metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayMetrics = await calculateFinancialMetrics(today, todayEnd);

  // Calculate yesterday's metrics for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);
  const yesterdayMetrics = await calculateFinancialMetrics(yesterday, yesterdayEnd);

  return {
    metrics,
    dailyData,
    topProducts,
    todayMetrics,
    yesterdayMetrics,
    dateRange,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};
