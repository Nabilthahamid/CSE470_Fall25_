import { redirect } from "@sveltejs/kit";
import { a as authService } from "../../../../chunks/AuthService.js";
import { h as handleError } from "../../../../chunks/errors.js";
const load = async ({ locals }) => {
  if (locals.user) {
    const redirectPath = locals.user.role === "admin" ? "/admin" : "/";
    throw redirect(302, redirectPath);
  }
  return {};
};
const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = (formData.get("email")?.toString() || "").trim();
    const password = formData.get("password")?.toString() || "";
    if (!email || !password) {
      return {
        error: "Email and password are required",
        email
      };
    }
    try {
      const session = await authService.login({ email, password });
      cookies.set("session_token", session.access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7
        // 7 days
      });
      const redirectPath = session.user.role === "admin" ? "/admin" : "/";
      throw redirect(302, redirectPath);
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && error.status === 302) {
        throw error;
      }
      const { message } = handleError(error);
      return {
        error: message,
        email
      };
    }
  }
};
export {
  actions,
  load
};
