import { r as requireAdmin } from "../../../../chunks/auth.js";
import { userService } from "../../../../chunks/UserService.js";
import { o as orderService } from "../../../../chunks/OrderService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ locals, url }) => {
  requireAdmin(locals.user);
  try {
    const searchQuery = url.searchParams.get("search") || "";
    const roleFilter = url.searchParams.get("role") || "all";
    let users = await userService.getAllUsers();
    if (roleFilter !== "all") {
      users = users.filter((user) => user.role === roleFilter);
    }
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      users = users.filter(
        (user) => user.email.toLowerCase().includes(searchLower) || user.name?.toLowerCase().includes(searchLower) || user.customer_name?.toLowerCase().includes(searchLower)
      );
    }
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const orders = await orderService.getAllOrders({ userId: user.id });
          const totalOrders = orders.length;
          const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          return {
            ...user,
            totalOrders,
            totalSpent,
            lastOrderDate: orders.length > 0 && orders[0].created_at ? orders.sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            })[0].created_at : null
          };
        } catch (error) {
          console.error(`Error fetching orders for user ${user.id}:`, error);
          return {
            ...user,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null
          };
        }
      })
    );
    return {
      users: usersWithStats,
      searchQuery,
      filters: {
        role: roleFilter
      },
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      users: [],
      searchQuery: "",
      filters: {
        role: "all"
      },
      error: message
    };
  }
};
export {
  load
};
