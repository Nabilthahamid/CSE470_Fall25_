import { o as orderService } from "../../../../chunks/OrderService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ url }) => {
  const orderId = url.searchParams.get("order_id");
  if (!orderId) {
    return {
      order: null,
      error: "Order ID not provided"
    };
  }
  try {
    const order = await orderService.getOrderById(orderId);
    return {
      order,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      order: null,
      error: message
    };
  }
};
export {
  load
};
