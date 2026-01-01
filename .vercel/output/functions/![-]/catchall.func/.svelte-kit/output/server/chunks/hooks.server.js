import { a as authService } from "./AuthService.js";
const handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get("session_token");
  if (sessionToken) {
    try {
      const user = await authService.getCurrentUser(sessionToken);
      event.locals.user = user;
    } catch (error) {
      event.cookies.delete("session_token", { path: "/" });
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }
  return resolve(event);
};
export {
  handle
};
