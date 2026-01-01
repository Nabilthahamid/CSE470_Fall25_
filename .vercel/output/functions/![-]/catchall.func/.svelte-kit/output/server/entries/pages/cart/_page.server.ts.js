import { c as cartService } from "../../../chunks/CartService.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async ({ locals }) => {
  try {
    const userId = locals.user?.id || void 0;
    const cartItems = await cartService.getCartItems(userId);
    const total = await cartService.getCartTotal(userId);
    return {
      cartItems,
      total,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      cartItems: [],
      total: 0,
      error: message
    };
  }
};
const actions = {
  update: async ({ request, locals }) => {
    const formData = await request.formData();
    const itemId = formData.get("item_id")?.toString();
    const quantity = parseInt(formData.get("quantity")?.toString() || "1");
    if (!itemId) {
      return { error: "Item ID is required" };
    }
    try {
      await cartService.updateCartItem(itemId, { quantity });
      return { success: true };
    } catch (error) {
      const { message } = handleError(error);
      return { error: message };
    }
  },
  remove: async ({ request }) => {
    const formData = await request.formData();
    const itemId = formData.get("item_id")?.toString();
    if (!itemId) {
      return { error: "Item ID is required" };
    }
    try {
      await cartService.removeCartItem(itemId);
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
