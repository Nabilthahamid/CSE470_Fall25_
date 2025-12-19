import type { PageServerLoad, Actions } from "./$types";
import {
  getCartFromCookies,
  updateCartItem,
  removeFromCart,
} from "$lib/server/utils/cartCookie";
import { calculateCartTotals } from "$lib/server/services/cartService";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies }) => {
  const cartItems = getCartFromCookies(cookies);
  const cart = await calculateCartTotals(cartItems);

  return {
    cart,
  };
};

export const actions: Actions = {
  updateQuantity: async ({ request, cookies }) => {
    const data = await request.formData();
    const productId = data.get("productId")?.toString();
    const quantity = data.get("quantity")?.toString();

    if (!productId || !quantity) {
      return fail(400, { error: "Product ID and quantity are required" });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return fail(400, { error: "Invalid quantity" });
    }

    updateCartItem(cookies, productId, qty);
    return { success: true };
  },

  removeItem: async ({ request, cookies }) => {
    const data = await request.formData();
    const productId = data.get("productId")?.toString();

    if (!productId) {
      return fail(400, { error: "Product ID is required" });
    }

    removeFromCart(cookies, productId);
    return { success: true };
  },
};
