import { userService } from "../../../../chunks/UserService.js";
import { h as handleError } from "../../../../chunks/errors.js";
import { error } from "@sveltejs/kit";
const load = async ({ params }) => {
  try {
    const user = await userService.getUserById(params.id);
    return {
      user
    };
  } catch (err) {
    const { message, statusCode } = handleError(err);
    throw error(statusCode, message);
  }
};
export {
  load
};
