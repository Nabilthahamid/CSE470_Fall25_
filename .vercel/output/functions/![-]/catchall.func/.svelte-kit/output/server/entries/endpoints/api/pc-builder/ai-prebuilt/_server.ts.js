import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { pcBuildService } from "../../../../../chunks/PCBuildService.js";
import { a as requireAuth } from "../../../../../chunks/auth.js";
const POST = async ({ request, locals }) => {
  try {
    requireAuth(locals.user);
    const { useCase, budget } = await request.json();
    if (!useCase || !budget) {
      return json({ error: "Use case and budget are required" }, { status: 400 });
    }
    const [products, categories] = await Promise.all([
      productService.getAllProducts(),
      pcBuildService.getAllCategories()
    ]);
    const builds = await aiService.generatePrebuiltBuilds(
      useCase,
      parseFloat(budget),
      products,
      categories.map((c) => ({ id: c.id, name: c.name, is_required: c.is_required }))
    );
    return json({ builds });
  } catch (error) {
    console.error("AI Pre-built Builds error:", error);
    return json(
      { error: error.message || "Failed to generate pre-built builds" },
      { status: 500 }
    );
  }
};
export {
  POST
};
