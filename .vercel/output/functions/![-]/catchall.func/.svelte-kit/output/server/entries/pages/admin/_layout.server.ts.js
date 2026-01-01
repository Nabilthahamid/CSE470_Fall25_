import { r as requireAdmin } from "../../../chunks/auth.js";
const load = async ({ locals }) => {
  requireAdmin(locals.user);
  return {
    user: locals.user
  };
};
export {
  load
};
