import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { pcBuildService } from "../../../../../chunks/PCBuildService.js";
import { a as requireAuth } from "../../../../../chunks/auth.js";
const POST = async ({ request, locals }) => {
  try {
    requireAuth(locals.user);
    const { budget, useCase, preferences } = await request.json();
    if (!budget || !useCase) {
      return json({ error: "Budget and use case are required" }, { status: 400 });
    }
    const [products, categories] = await Promise.all([
      productService.getAllProducts(),
      pcBuildService.getAllCategories()
    ]);
    const suggestion = await aiService.suggestPCBuild(
      { budget: parseFloat(budget), useCase, preferences },
      products,
      categories.map((c) => ({ id: c.id, name: c.name, is_required: c.is_required }))
    );
    return json(suggestion);
  } catch (error) {
    console.error("AI PC Builder error:", error);
    return json(
      { error: error.message || "Failed to generate PC build suggestions" },
      { status: 500 }
    );
  }
};
export {
  POST
};
