import { error } from "@sveltejs/kit";
import "../../../chunks/supabase.js";
import { h as handleError } from "../../../chunks/errors.js";
const load = async () => {
  try {
    return {
      error: null
    };
  } catch (err) {
    const { message, statusCode } = handleError(err);
    throw error(statusCode, message);
  }
};
export {
  load
};
