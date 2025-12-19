import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import {
  getAllOrdersWithDetails,
  updateOrderStatus,
} from "$lib/server/services/orderService";

/**
 * Controller - Admin Orders Management
 * Protected route - only accessible by admin users
 */
export const load: PageServerLoad = async ({ locals }) => {
  // Ensure user is admin
  if (!locals.user) {
    throw redirect(302, "/auth");
  }

  if (locals.role !== "admin") {
    throw redirect(302, "/");
  }

  // Load all orders with details
  try {
    const orders = await getAllOrdersWithDetails();
    return {
      orders,
      user: locals.user,
      role: locals.role,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load orders";
    throw fail(500, { error: message });
  }
};

export const actions: Actions = {
  /**
   * Update Order Status Action
   * Only admins can update order status
   */
  updateStatus: async ({ request, locals }) => {
    // Ensure user is admin
    if (!locals.user || locals.role !== "admin") {
      return fail(403, { error: "Unauthorized" });
    }

    const formData = await request.formData();
    const orderId = formData.get("orderId")?.toString();
    const status = formData.get("status")?.toString();

    if (!orderId || !status) {
      return fail(400, { error: "Order ID and status are required" });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return fail(400, { error: "Invalid status" });
    }

    try {
      await updateOrderStatus(
        orderId,
        status as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled"
      );
      return {
        success: true,
        message: "Order status updated successfully",
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update order status";
      return fail(500, { error: message });
    }
  },
};
