import { c as create_ssr_component, e as escape } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { params } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-ey47af_START -->${$$result.title = `<title>${escape(data.user.name)} - TinyTech</title>`, ""}<!-- HEAD_svelte-ey47af_END -->`, ""} <div class="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen"><a href="/users" class="inline-block mb-8 text-indigo-600 no-underline hover:underline font-medium" data-svelte-h="svelte-1oksk3j">← Back to Users</a> <div class="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200"><h1 class="mb-6 text-4xl font-bold text-gray-900">${escape(data.user.name)}</h1> <div class="space-y-4"><div class="py-3 border-b border-gray-200"><strong class="inline-block min-w-[120px] text-gray-700 font-semibold" data-svelte-h="svelte-1rbvs6o">Email:</strong> <span class="text-gray-900 text-lg">${escape(data.user.email)}</span></div> <div class="py-3 border-b border-gray-200"><strong class="inline-block min-w-[120px] text-gray-700 font-semibold" data-svelte-h="svelte-6pntox">ID:</strong> <span class="text-gray-600 text-sm font-mono">${escape(data.user.id)}</span></div> ${data.user.created_at ? `<div class="py-3 border-b border-gray-200"><strong class="inline-block min-w-[120px] text-gray-700 font-semibold" data-svelte-h="svelte-nmnu0s">Created:</strong> <span class="text-gray-900">${escape(new Date(data.user.created_at).toLocaleString())}</span></div>` : ``} ${data.user.updated_at ? `<div class="py-3 border-b border-gray-200"><strong class="inline-block min-w-[120px] text-gray-700 font-semibold" data-svelte-h="svelte-1oel5g7">Updated:</strong> <span class="text-gray-900">${escape(new Date(data.user.updated_at).toLocaleString())}</span></div>` : ``}</div></div></div>`;
});
export {
  Page as default
};
