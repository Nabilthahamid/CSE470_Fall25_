import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { removeFromCart } from "$lib/server/utils/cartCookie";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return json({ error: "Invalid product ID" }, { status: 400 });
    }

    const items = removeFromCart(cookies, productId);

    return json({ success: true, items });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return json({ error: "Failed to remove item from cart" }, { status: 500 });
  }
};
