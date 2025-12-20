import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import {
  getUserOrdersWithDetails,
  deleteOrder,
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
  deleteOrder: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to delete an order" });
    }

    const formData = await request.formData();
    const orderId = formData.get("orderId")?.toString();

    if (!orderId) {
      return fail(400, { error: "Order ID is required" });
    }

    try {
      await deleteOrder(orderId, locals.user.id);
      return { success: true, message: "Order deleted successfully", orderId };
    } catch (error: any) {
      console.error("Error deleting order:", error);
      return fail(400, {
        error: error.message || "Failed to delete order. Please try again.",
        orderId,
      });
    }
  },
};
