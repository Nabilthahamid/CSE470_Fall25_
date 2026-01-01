import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { pcBuildService } from "../../../../../chunks/PCBuildService.js";
import { a as requireAuth } from "../../../../../chunks/auth.js";
const POST = async ({ request, locals }) => {
  try {
    requireAuth(locals.user);
    const { build, optimizationGoal } = await request.json();
    if (!build || !Array.isArray(build)) {
      return json({ error: "Build components are required" }, { status: 400 });
    }
    const [products, categories] = await Promise.all([
      productService.getAllProducts(),
      pcBuildService.getAllCategories()
    ]);
    const optimization = await aiService.optimizeBuild(
      build,
      products,
      categories.map((c) => ({ id: c.id, name: c.name })),
      optimizationGoal || "value"
    );
    return json(optimization);
  } catch (error) {
    console.error("AI Build Optimization error:", error);
    return json(
      { error: error.message || "Failed to optimize build" },
      { status: 500 }
    );
  }
};
export {
  POST
};
