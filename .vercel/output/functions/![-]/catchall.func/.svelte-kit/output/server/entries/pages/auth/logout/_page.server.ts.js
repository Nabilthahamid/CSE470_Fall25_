import { redirect } from "@sveltejs/kit";
const actions = {
  default: async ({ cookies }) => {
    cookies.delete("session_token", { path: "/" });
    throw redirect(302, "/auth/login");
  }
};
export {
  actions
};
