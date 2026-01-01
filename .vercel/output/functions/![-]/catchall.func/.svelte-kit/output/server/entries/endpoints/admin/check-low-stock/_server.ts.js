import { json } from "@sveltejs/kit";
import { r as requireAdmin } from "../../../../chunks/auth.js";
import { n as notificationService } from "../../../../chunks/NotificationService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const POST = async ({ locals }) => {
  requireAdmin(locals.user);
  try {
    await notificationService.checkLowStockAndNotify();
    return json({ success: true, message: "Low stock check completed" });
  } catch (error) {
    const { message } = handleError(error);
    return json({ success: false, error: message }, { status: 500 });
  }
};
export {
  POST
};
