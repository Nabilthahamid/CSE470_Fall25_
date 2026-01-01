import { json } from "@sveltejs/kit";
import { r as requireAdmin } from "../../../../../chunks/auth.js";
import { productService } from "../../../../../chunks/ProductService.js";
import { o as orderService } from "../../../../../chunks/OrderService.js";
import { userService } from "../../../../../chunks/UserService.js";
import { h as handleError } from "../../../../../chunks/errors.js";
const GET = async ({ url, locals }) => {
  requireAdmin(locals.user);
  try {
    const query = url.searchParams.get("q") || "";
    if (!query.trim()) {
      return json({ products: [], orders: [], users: [] });
    }
    const searchTerm = query.trim().toLowerCase();
    let products = [];
    try {
      const allProducts = await productService.getAllProducts();
      products = allProducts.filter(
        (p) => p.name.toLowerCase().includes(searchTerm) || p.description?.toLowerCase().includes(searchTerm) || p.brand?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Product search error:", error);
    }
    let orders = [];
    try {
      const allOrders = await orderService.getAllOrders();
      orders = allOrders.filter(
        (o) => o.id.toLowerCase().includes(searchTerm) || o.customer_name?.toLowerCase().includes(searchTerm) || o.customer_email?.toLowerCase().includes(searchTerm) || o.status?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Order search error:", error);
    }
    let users = [];
    try {
      const allUsers = await userService.getAllUsers();
      users = allUsers.filter(
        (u) => u.name?.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("User search error:", error);
    }
    return json({
      products: products.slice(0, 5),
      orders: orders.slice(0, 5),
      users: users.slice(0, 5)
    });
  } catch (error) {
    const { message } = handleError(error);
    return json({ error: message }, { status: 500 });
  }
};
export {
  GET
};
