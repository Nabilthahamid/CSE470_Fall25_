import { json } from "@sveltejs/kit";
import { aiService } from "../../../../chunks/AIService.js";
import { productService } from "../../../../chunks/ProductService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const POST = async ({ request }) => {
  try {
    const { productIds } = await request.json();
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return json({ error: "Product IDs are required" }, { status: 400 });
    }
    const allProducts = await productService.getAllProducts();
    const products = allProducts.filter((p) => productIds.includes(p.id));
    if (products.length === 0) {
      return json({ error: "No products found" }, { status: 404 });
    }
    const insights = await aiService.analyzeComparisonWithAI(products);
    return json({ insights, products });
  } catch (error) {
    const { message } = handleError(error);
    return json({ error: message }, { status: 500 });
  }
};
export {
  POST
};
