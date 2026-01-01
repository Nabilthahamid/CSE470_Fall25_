import { c as create_ssr_component } from "../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { params = {} } = $$props;
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  <form method="POST" data-svelte-h="svelte-1uc0jr7"><button type="submit">Logging out...</button></form>`;
});
export {
  Page as default
};
