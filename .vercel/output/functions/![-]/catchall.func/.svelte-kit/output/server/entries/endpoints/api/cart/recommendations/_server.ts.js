import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { productService } from "../../../../../chunks/ProductService.js";
const POST = async ({ request }) => {
  try {
    const { cartItems } = await request.json();
    if (!cartItems || !Array.isArray(cartItems)) {
      return json({ error: "Cart items array is required" }, { status: 400 });
    }
    const validCartItems = cartItems.filter((item) => item.product && item.product_id);
    if (validCartItems.length === 0) {
      return json({
        recommendations: [],
        summary: "No valid cart items found."
      });
    }
    const allProducts = await productService.getAllProducts();
    const recommendations = await aiService.recommendCartProducts(validCartItems, allProducts);
    return json(recommendations);
  } catch (error) {
    console.error("Cart recommendations error:", error);
    return json(
      { error: error.message || "Failed to get recommendations" },
      { status: 500 }
    );
  }
};
export {
  POST
};
