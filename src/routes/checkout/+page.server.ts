import type { PageServerLoad, Actions } from "./$types";
import { getCartFromCookies, clearCart } from "$lib/server/utils/cartCookie";
import { calculateCartTotals } from "$lib/server/services/cartService";
import {
  createOrder,
  createOrderItems,
  getOrderWithItems,
} from "$lib/server/models/orders";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const cartItems = getCartFromCookies(cookies);

  if (cartItems.length === 0) {
    throw redirect(302, "/cart");
  }

  const cart = await calculateCartTotals(cartItems);

  return {
    cart,
    user: locals.user,
  };
};

export const actions: Actions = {
  placeOrder: async ({ request, cookies, locals }) => {
    const data = await request.formData();

    // Get cart items
    const cartItems = getCartFromCookies(cookies);
    if (cartItems.length === 0) {
      return fail(400, { error: "Cart is empty" });
    }

    const cart = await calculateCartTotals(cartItems);

    // Get form data
    const firstName = data.get("firstName")?.toString();
    const lastName = data.get("lastName")?.toString();
    const email = data.get("email")?.toString();
    const phone = data.get("phone")?.toString();
    const address = data.get("address")?.toString();
    const city = data.get("city")?.toString();
    const district = data.get("district")?.toString();
    const postcode = data.get("postcode")?.toString();
    const shippingMethod =
      data.get("shippingMethod")?.toString() || "inside_dhaka";
    const paymentMethod =
      data.get("paymentMethod")?.toString() || "cash_on_delivery";
    const orderNotes = data.get("orderNotes")?.toString();

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !district
    ) {
      return fail(400, { error: "Please fill in all required fields" });
    }

    // Calculate shipping cost
    const shippingCosts: Record<string, number> = {
      inside_dhaka: 70,
      local_pickup: 0,
      outside_dhaka: 100,
    };
    const shippingCost = shippingCosts[shippingMethod] || 0;
    const total = cart.subtotal + shippingCost;

    // Get user ID (use guest user or require login)
    const userId = locals.user?.id;
    if (!userId) {
      return fail(401, { error: "Please login to place an order" });
    }

    try {
      // Create order
      const order = await createOrder({
        userId,
        status: "pending",
        total: total.toString(),
      });

      // Create order items
      const orderItems = cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price || "0",
      }));

      await createOrderItems(order.id, orderItems);

      // Verify order was saved correctly by fetching it from database
      const verifiedOrder = await getOrderWithItems(order.id);

      if (!verifiedOrder) {
        console.error(
          "Order verification failed: Order not found after creation"
        );
        return fail(500, {
          error: "Order could not be verified. Please contact support.",
        });
      }

      // Verify all order items were saved
      if (verifiedOrder.orderItems.length !== cartItems.length) {
        console.error(
          `Order verification failed: Expected ${cartItems.length} items, got ${verifiedOrder.orderItems.length}`
        );
        return fail(500, {
          error: "Order items could not be verified. Please contact support.",
        });
      }

      // Verify order total matches
      const verifiedTotal = parseFloat(verifiedOrder.total);
      if (Math.abs(verifiedTotal - total) > 0.01) {
        console.error(
          `Order verification failed: Total mismatch. Expected ${total}, got ${verifiedTotal}`
        );
        return fail(500, {
          error: "Order total could not be verified. Please contact support.",
        });
      }

      // Clear cart only after successful verification
      clearCart(cookies);

      // Redirect to order confirmation
      throw redirect(303, `/order/${order.id}/success`);
    } catch (error: any) {
      if (error.status === 303) {
        throw error; // Re-throw redirects
      }
      console.error("Error placing order:", error);
      return fail(500, { error: "Failed to place order. Please try again." });
    }
  },
};
