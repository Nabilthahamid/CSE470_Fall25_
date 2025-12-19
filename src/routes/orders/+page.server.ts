import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import {
  getUserOrdersWithDetails,
  updateOrderStatus,
} from "$lib/server/services/orderService";

/**
 * Controller - User Orders Page
 * Shows all orders for the logged-in user
 */
export const load: PageServerLoad = async ({ locals }) => {
  // Ensure user is authenticated
  if (!locals.user) {
    throw redirect(302, "/auth");
  }

  try {
    const orders = await getUserOrdersWithDetails(locals.user.id);

    console.log(`Loaded ${orders.length} orders for user ${locals.user.id}`);
    console.log(
      `Order statuses in response:`,
      orders.map((o) => ({ id: o.id.substring(0, 8), status: o.status }))
    );

    return {
      orders,
      user: locals.user,
      role: locals.role,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load orders";
    throw new Error(message);
  }
};

/**
 * Server Actions - User Orders Page
 */
export const actions: Actions = {
  cancelOrder: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to cancel an order" });
    }

    const formData = await request.formData();
    const orderId = formData.get("orderId")?.toString();

    console.log(
      "Cancel order request - Order ID:",
      orderId,
      "User ID:",
      locals.user.id
    );

    if (!orderId) {
      return fail(400, { error: "Order ID is required" });
    }

    try {
      // First, verify the order belongs to the user and is in pending status
      const orders = await getUserOrdersWithDetails(locals.user.id);
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        console.error("Order not found or doesn't belong to user");
        return fail(404, { error: "Order not found" });
      }

      console.log("Order found - Status:", order.status);

      if (order.status !== "pending") {
        return fail(400, {
          error: `Cannot cancel order. Order status is: ${order.status}. Only pending orders can be cancelled.`,
        });
      }

      // Cancel the order
      console.log("Updating order status to cancelled...");
      const updatedOrder = await updateOrderStatus(orderId, "cancelled");
      console.log("Order cancelled successfully. Updated order:", updatedOrder);

      // Return success - SvelteKit will treat this as a successful action
      // When you return a plain object (not fail()), result.type will be 'success'
      return {
        success: true,
        message: "Order cancelled successfully",
        orderId: orderId,
        status: updatedOrder.status,
      };
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      return fail(500, {
        error: error.message || "Failed to cancel order. Please try again.",
      });
    }
  },
};
