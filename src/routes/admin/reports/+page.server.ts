import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { AuthService } from "$lib/server/services/authService";
import {
  calculateProductProfitLoss,
  calculateProfitLossByDateRange,
} from "$lib/server/services/profitLossService";

export const load: PageServerLoad = async ({ cookies, url }) => {
  // Get session token from cookies
  const accessToken = cookies.get("sb-access-token");
  if (!accessToken) {
    throw redirect(302, "/auth?tab=login");
  }

  // Verify user and get role
  const user = await AuthService.getSessionFromToken(accessToken);
  if (!user) {
    throw redirect(302, "/auth?tab=login");
  }

  const role = await AuthService.getUserRole(user.id);
  if (role !== "admin") {
    throw redirect(302, "/");
  }

  // Get date range from query params if provided
  const startDateParam = url.searchParams.get("startDate");
  const endDateParam = url.searchParams.get("endDate");

  // Get order statuses from query params (can be multiple)
  const statusParam = url.searchParams.get("statuses");
  const statuses = statusParam
    ? statusParam.split(",").filter((s) => s.trim())
    : undefined;

  let profitLossData;
  if (startDateParam || endDateParam) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      // Parse date string (YYYY-MM-DD format from date input)
      // Create date at start of day in UTC to avoid timezone issues
      const [year, month, day] = startDateParam.split("-").map(Number);
      startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }

    if (endDateParam) {
      // Parse date string (YYYY-MM-DD format from date input)
      // Create date at end of day in UTC to include the entire day
      const [year, month, day] = endDateParam.split("-").map(Number);
      endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    }

    profitLossData = await calculateProfitLossByDateRange(
      startDate,
      endDate,
      statuses
    );
  } else {
    profitLossData = await calculateProductProfitLoss(statuses);
  }

  return {
    user: {
      id: user.id,
      email: user.email || "",
    },
    role,
    profitLossData,
  };
};
