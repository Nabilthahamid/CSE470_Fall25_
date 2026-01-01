import { a as requireAuth } from "../../../../chunks/auth.js";
import { o as orderService } from "../../../../chunks/OrderService.js";
import { h as handleError } from "../../../../chunks/errors.js";
import { error } from "@sveltejs/kit";
const load = async ({ params, locals }) => {
  requireAuth(locals.user);
  try {
    const order = await orderService.getOrderById(params.id);
    if (order.user_id && order.user_id !== locals.user.id && locals.user.role !== "admin") {
      throw error(403, "Access denied");
    }
    return {
      order,
      user: locals.user
    };
  } catch (err) {
    if (err.status === 403) throw err;
    const { message } = handleError(err);
    throw error(404, message || "Order not found");
  }
};
export {
  load
};
