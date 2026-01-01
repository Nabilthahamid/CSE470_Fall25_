import { userService } from "../../../chunks/UserService.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async () => {
  try {
    const users = await userService.getAllUsers();
    return {
      users,
      error: null
    };
  } catch (error) {
    const { message } = handleError(error);
    return {
      users: [],
      error: message
    };
  }
};
export {
  load
};
