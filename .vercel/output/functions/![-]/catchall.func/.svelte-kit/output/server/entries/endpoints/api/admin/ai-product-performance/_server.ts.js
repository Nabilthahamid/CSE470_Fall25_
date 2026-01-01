import { json } from "@sveltejs/kit";
import { aiService } from "../../../../../chunks/AIService.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { s as saleService } from "../../../../../chunks/SaleService.js";
import { r as reviewService } from "../../../../../chunks/ReviewService.js";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
const GET = async ({ locals, url }) => {
  try {
    requireAdmin(locals.user);
    const productId = url.searchParams.get("productId");
    if (productId) {
      const product = await productService.getProductById(productId);
      if (!product) {
        return json({ error: "Product not found" }, { status: 404 });
      }
      const allSales = await saleService.getAllSales();
      const sales = allSales.filter((s) => s.product_id === productId);
      const reviews = await reviewService.getAllReviews({ productId });
      const analysis = await aiService.analyzeProductPerformance(
        productId,
        product,
        sales,
        reviews.map((r) => ({ rating: r.rating }))
      );
      return json(analysis);
    } else {
      const products = await productService.getAllProducts();
      const allSales = await saleService.getAllSales();
      const allReviews = await reviewService.getAllReviews({});
      const analyses = await Promise.all(
        products.map(async (product) => {
          const productSales = allSales.filter((s) => s.product_id === product.id);
          const productReviews = allReviews.filter((r) => r.product_id === product.id);
          return aiService.analyzeProductPerformance(
            product.id,
            product,
            productSales,
            productReviews.map((r) => ({ rating: r.rating }))
          );
        })
      );
      analyses.sort((a, b) => b.salesVelocity - a.salesVelocity);
      return json({ analyses });
    }
  } catch (error) {
    console.error("Product Performance Analysis error:", error);
    return json(
      { error: error.message || "Failed to analyze product performance" },
      { status: 500 }
    );
  }
};
export {
  GET
};
