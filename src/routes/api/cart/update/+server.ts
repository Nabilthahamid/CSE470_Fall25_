import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { updateCartItem } from "$lib/server/utils/cartCookie";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return json({ error: "Invalid product ID or quantity" }, { status: 400 });
    }

    const items = updateCartItem(cookies, productId, quantity);

    return json({ success: true, items });
  } catch (error) {
    console.error("Error updating cart:", error);
    return json({ error: "Failed to update cart" }, { status: 500 });
  }
};
