import { json } from "@sveltejs/kit";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { aiService } from "../../../../../chunks/AIService.js";
import { productService } from "../../../../../chunks/ProductService.js";
const POST = async ({ request, locals }) => {
  requireAdmin(locals.user);
  try {
    const { productId } = await request.json();
    if (!productId) {
      return json({ error: "Product ID is required" }, { status: 400 });
    }
    const product = await productService.getProductById(productId);
    const content = await aiService.generateMarketingContent({
      name: product.name,
      price: product.price,
      category: product.component_category_name || void 0,
      stock: product.stock
    });
    return json({ content, error: null });
  } catch (error) {
    console.error("Error generating marketing content:", error);
    return json(
      { content: null, error: error.message || "Failed to generate marketing content" },
      { status: 500 }
    );
  }
};
export {
  POST
};
