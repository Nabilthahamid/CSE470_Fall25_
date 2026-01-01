import { a as requireAuth } from "../../../chunks/auth.js";
import { o as orderService } from "../../../chunks/OrderService.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async ({ locals }) => {
  requireAuth(locals.user);
  try {
    const userId = locals.user.id;
    const orders = await orderService.getOrdersByUser(userId);
    return {
      orders,
      user: locals.user
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      orders: [],
      user: locals.user,
      error: message
    };
  }
};
export {
  load
};
