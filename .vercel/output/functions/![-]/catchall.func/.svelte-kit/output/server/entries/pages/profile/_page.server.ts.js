import { a as requireAuth } from "../../../chunks/auth.js";
import { userService } from "../../../chunks/UserService.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async ({ locals }) => {
  requireAuth(locals.user);
  try {
    const user = await userService.getUserById(locals.user.id);
    return {
      user,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      user: locals.user,
      error: message
    };
  }
};
const actions = {
  update: async ({ request, locals }) => {
    requireAuth(locals.user);
    const formData = await request.formData();
    const customer_name = formData.get("customer_name")?.toString() || "";
    const customer_address = formData.get("customer_address")?.toString() || "";
    const customer_phone = formData.get("customer_phone")?.toString() || "";
    const customer_city = formData.get("customer_city")?.toString() || "";
    const customer_postal_code = formData.get("customer_postal_code")?.toString() || "";
    const customer_country = formData.get("customer_country")?.toString() || "Bangladesh";
    try {
      await userService.updateUser(locals.user.id, {
        customer_name: customer_name || void 0,
        customer_address: customer_address || void 0,
        customer_phone: customer_phone || void 0,
        customer_city: customer_city || void 0,
        customer_postal_code: customer_postal_code || void 0,
        customer_country: customer_country || void 0
      });
      return {
        success: true,
        message: "Profile updated successfully!"
      };
    } catch (error) {
      const { message } = handleError(error);
      return {
        error: message
      };
    }
  }
};
export {
  actions,
  load
};
