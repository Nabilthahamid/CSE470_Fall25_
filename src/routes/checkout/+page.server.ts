import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createOrder } from "$lib/server/services/orderService";
import type { PageServerLoad } from "./$types";

/**
 * Server Load Function - Checkout Page
 * Redirects unauthenticated users to login
 */
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/auth?tab=login&redirect=/checkout");
  }

  return {
    user: locals.user,
  };
};

/**
 * Server Actions - Checkout Page
 */
export const actions: Actions = {
  placeOrder: async ({ request, locals, cookies }) => {
    if (!locals.user) {
      return fail(401, { error: "You must be logged in to place an order" });
    }

    const formData = await request.formData();

    // Get cart items from form data
    const cartItemsJson = formData.get("cartItems")?.toString();
    if (!cartItemsJson) {
      return fail(400, { error: "Cart is empty" });
    }

    let cartItems;
    try {
      cartItems = JSON.parse(cartItemsJson);
    } catch (error) {
      return fail(400, { error: "Invalid cart data" });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return fail(400, { error: "Cart is empty" });
    }

    // Get billing details
    const firstName = formData.get("firstName")?.toString() || "";
    const lastName = formData.get("lastName")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const country = formData.get("country")?.toString() || "";
    const streetAddress = formData.get("streetAddress")?.toString() || "";
    const apartment = formData.get("apartment")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const district = formData.get("district")?.toString() || "";
    const postcode = formData.get("postcode")?.toString() || "";
    const shippingMethod =
      formData.get("shippingMethod")?.toString() || "inside_dhaka";
    const paymentMethod =
      formData.get("paymentMethod")?.toString() || "cash_on_delivery";
    const orderNotes = formData.get("orderNotes")?.toString() || "";

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !country ||
      !streetAddress ||
      !city ||
      !district
    ) {
      return fail(400, { error: "Please fill in all required fields" });
    }

    // Calculate shipping cost
    const shippingCosts: Record<string, number> = {
      inside_dhaka: 70.0,
      local_pickup: 0,
      outside_dhaka: 100.0,
    };
    const shippingCost = shippingCosts[shippingMethod] || 0;

    // Prepare order items
    const orderItems = cartItems.map((item: any) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_purchase: item.product.price,
    }));

    // Calculate total (subtotal + shipping)
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    );
    const totalAmount = subtotal + shippingCost;

    // Create order with shipping cost
    let order;
    try {
      order = await createOrder(locals.user.id, orderItems, shippingCost);
    } catch (error: any) {
      console.error("Error creating order:", error);
      return fail(500, {
        error: error.message || "Failed to place order. Please try again.",
      });
    }

    // Clear cart after successful order
    // Note: Cart clearing will be handled client-side after redirect

    // Redirect to order confirmation (don't catch redirects - let them propagate)
    throw redirect(302, `/orders?orderId=${order.id}&success=true`);
  },
};
