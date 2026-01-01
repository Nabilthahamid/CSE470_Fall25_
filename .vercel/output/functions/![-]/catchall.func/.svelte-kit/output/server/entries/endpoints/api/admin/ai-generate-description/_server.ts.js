import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
const POST = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized - Please login" }, { status: 401 });
  }
  if (locals.user.role !== "admin") {
    return json({ error: "Unauthorized - Admin access required" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, brand, specifications, price, component_category_name } = body;
    if (!name) {
      return json({ error: "Product name is required" }, { status: 400 });
    }
    const result = await aiService.generateProductDescription({
      name,
      brand: brand || null,
      specifications: specifications || null,
      price: price || void 0,
      component_category_name: component_category_name || null
    });
    return json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error generating product description:", error);
    return json(
      { error: error.message || "Failed to generate product description" },
      { status: 500 }
    );
  }
};
export {
  POST
};
