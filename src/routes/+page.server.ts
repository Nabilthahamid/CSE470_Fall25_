import { getAllProducts } from "$lib/server/models/products";
import type { PageServerLoad } from "./$types";
import type { Product } from "$lib/server/models/products";

export const load: PageServerLoad = async () => {
  // Homepage is publicly accessible - anyone can view products
  // Load products
  const products = await getAllProducts();

  // Group products by category
  const productsByCategory: Record<string, Product[]> = {
    keycaps: [],
    switch: [],
    keyboard: [],
    mouse: [],
    mousepad: [],
  };

  products.forEach((product) => {
    const category = (product.category || "").toLowerCase().trim();

    // Map category variations to standard keys
    const categoryMap: Record<string, string> = {
      mouse_pad: "mousepad",
      "mouse pad": "mousepad",
      mousepad: "mousepad",
      keycaps: "keycaps",
      keycap: "keycaps",
      switch: "switch",
      switches: "switch",
      keyboard: "keyboard",
      keyboards: "keyboard",
      mouse: "mouse",
      mice: "mouse",
    };

    const normalizedCategory = categoryMap[category] || category;

    if (normalizedCategory in productsByCategory) {
      productsByCategory[normalizedCategory].push(product);
    } else if (category) {
      // If category doesn't match predefined ones, add it dynamically
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(product);
    }
  });

  return {
    products,
    productsByCategory,
    databaseAvailable:
      products.length > 0 || process.env.DATABASE_URL !== undefined,
  };
};
