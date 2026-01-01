import { c as create_ssr_component } from "../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "../../../chunks/supabase.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { params = {} } = $$props;
  let products = [];
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-katzys_START -->${$$result.title = `<title>Compare Products - TinyTech</title>`, ""}<!-- HEAD_svelte-katzys_END -->`, ""} <div class="max-w-7xl mx-auto p-4 md:p-8"><div class="flex justify-between items-center mb-8"><h1 class="text-3xl md:text-4xl font-bold text-gray-900" data-svelte-h="svelte-2ezp7y">Compare Products</h1> ${products.length > 0 ? `<button class="bg-red-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold hover:bg-red-700 transition-colors" data-svelte-h="svelte-4xfghd">Clear All</button>` : ``}</div> ${`<div class="text-center py-12" data-svelte-h="svelte-1ed17uo"><p class="text-gray-600">Loading products...</p></div>`}</div>`;
});
export {
  Page as default
};
