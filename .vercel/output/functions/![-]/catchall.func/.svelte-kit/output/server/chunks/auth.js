import { redirect } from "@sveltejs/kit";
function requireAuth(user) {
  if (!user) {
    throw redirect(302, "/auth/login");
  }
}
function requireAdmin(user) {
  requireAuth(user);
  if (user.role !== "admin") {
    throw redirect(302, "/");
  }
}
export {
  requireAuth as a,
  requireAdmin as r
};
