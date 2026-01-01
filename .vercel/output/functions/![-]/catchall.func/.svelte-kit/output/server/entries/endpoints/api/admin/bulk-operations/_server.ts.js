import { json } from "@sveltejs/kit";
import { productService } from "../../../../../chunks/ProductService.js";
import { s as supabase } from "../../../../../chunks/supabase.js";
import { h as handleError } from "../../../../../chunks/errors.js";
function getAdminUser(locals) {
  if (!locals.user || locals.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return locals.user;
}
const POST = async ({ request, locals }) => {
  try {
    getAdminUser(locals);
  } catch (error) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { operation, data: operationData } = body;
    switch (operation) {
      case "bulk_price_update": {
        const { productIds, updateType, value } = operationData;
        const products = await Promise.all(
          productIds.map(async (id) => {
            const product = await productService.getProductById(id);
            let newPrice = product.price;
            if (updateType === "percentage") {
              newPrice = product.price * (1 + value / 100);
            } else if (updateType === "fixed") {
              newPrice = product.price + value;
            }
            return productService.updateProduct(id, { price: Math.max(0, newPrice) });
          })
        );
        return json({ success: true, updated: products.length });
      }
      case "bulk_stock_update": {
        const { productIds, updateType, value } = operationData;
        const products = await Promise.all(
          productIds.map(async (id) => {
            const product = await productService.getProductById(id);
            let newStock = product.stock;
            if (updateType === "set") {
              newStock = value;
            } else if (updateType === "add") {
              newStock = product.stock + value;
            } else if (updateType === "subtract") {
              newStock = product.stock - value;
            }
            return productService.updateProduct(id, { stock: Math.max(0, newStock) });
          })
        );
        return json({ success: true, updated: products.length });
      }
      case "bulk_category_assign": {
        const { productIds, categoryId } = operationData;
        const { error } = await supabase.from("products").update({ component_category_id: categoryId || null }).in("id", productIds);
        if (error) throw new Error(`Failed to update categories: ${error.message}`);
        return json({ success: true, updated: productIds.length });
      }
      case "bulk_delete": {
        const { productIds } = operationData;
        await Promise.all(productIds.map((id) => productService.deleteProduct(id)));
        return json({ success: true, deleted: productIds.length });
      }
      case "export_products": {
        const products = await productService.getAllProducts();
        const csv = convertToCSV(products);
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="products-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`
          }
        });
      }
      case "import_products": {
        const { csvData } = operationData;
        const products = parseCSV(csvData);
        const results = await importProducts(products);
        return json({ success: true, imported: results.success, failed: results.failed });
      }
      default:
        return json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch (error) {
    const { message } = handleError(error);
    return json({ error: message }, { status: 500 });
  }
};
function convertToCSV(products) {
  const headers = [
    "id",
    "name",
    "description",
    "price",
    "cost_price",
    "stock",
    "brand",
    "component_category_id",
    "image_url",
    "specifications"
  ];
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.description?.replace(/"/g, '""') || "",
    p.price,
    p.cost_price || "",
    p.stock,
    p.brand || "",
    p.component_category_id || "",
    p.image_url || "",
    p.specifications?.replace(/"/g, '""') || ""
  ]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
  ];
  return csvRows.join("\n");
}
function parseCSV(csvData) {
  const lines = csvData.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    const product = {};
    headers.forEach((header, index) => {
      const value = values[index]?.replace(/^"|"$/g, "") || "";
      if (header === "price" || header === "cost_price") {
        product[header] = parseFloat(value) || 0;
      } else if (header === "stock") {
        product[header] = parseInt(value) || 0;
      } else {
        product[header] = value;
      }
    });
    if (product.name) {
      products.push(product);
    }
  }
  return products;
}
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}
async function importProducts(products) {
  let success = 0;
  let failed = 0;
  for (const product of products) {
    try {
      if (product.id) {
        await productService.updateProduct(product.id, {
          name: product.name,
          description: product.description,
          price: product.price,
          cost_price: product.cost_price,
          stock: product.stock,
          brand: product.brand || null,
          component_category_id: product.component_category_id || null,
          image_url: product.image_url || null,
          specifications: product.specifications || null
        });
      } else {
        await productService.createProduct({
          name: product.name,
          description: product.description || "",
          price: product.price,
          cost_price: product.cost_price,
          stock: product.stock,
          brand: product.brand || null,
          component_category_id: product.component_category_id || null,
          image_url: product.image_url || null,
          specifications: product.specifications || null
        });
      }
      success++;
    } catch (error) {
      console.error(`Failed to import product ${product.name}:`, error);
      failed++;
    }
  }
  return { success, failed };
}
export {
  POST
};
