import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { addToCart } from "$lib/server/utils/cartCookie";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity <= 0) {
      return json({ error: "Invalid product ID or quantity" }, { status: 400 });
    }

    const items = addToCart(cookies, productId, quantity);

    return json({ success: true, items });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return json({ error: "Failed to add item to cart" }, { status: 500 });
  }
};
