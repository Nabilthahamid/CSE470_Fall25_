import { c as create_ssr_component, e as escape } from "../../chunks/ssr.js";
const Error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { error = void 0 } = $$props;
  let { params = {} } = $$props;
  if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1wh4tiy_START -->${$$result.title = `<title>Error ${escape(error?.status || 500)}</title>`, ""}<!-- HEAD_svelte-1wh4tiy_END -->`, ""} <div class="max-w-3xl mx-auto p-8 text-center"><div class="bg-white/5 p-8 rounded-lg border border-white/10"><h1 class="text-4xl font-bold mb-4 text-red-400">Error ${escape(error?.status || 500)}</h1> <p class="text-xl mb-6 text-gray-300">${escape(error?.message || "An unexpected error occurred")}</p> <a href="/" class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700" data-svelte-h="svelte-1x7ahba">Go Home</a></div></div>`;
});
export {
  Error as default
};
