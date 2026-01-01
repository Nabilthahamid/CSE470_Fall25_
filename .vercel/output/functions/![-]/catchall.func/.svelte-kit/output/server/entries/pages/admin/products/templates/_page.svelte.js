import { c as create_ssr_component, e as escape, f as each, b as add_attribute } from "../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1i33yg_START -->${$$result.title = `<title>Product Templates - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-1i33yg_END -->`, ""} <div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-1933hi2">Product Templates</h1> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">${escape(form.error)}</div>` : ``} ${form?.success ? `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" data-svelte-h="svelte-1cm0856">Operation successful!</div>` : ``} <div class="flex justify-between items-center mb-6"><p class="text-gray-600" data-svelte-h="svelte-11g3n69">Save product templates for quick creation</p> <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-f0ahod">+ Create Template</button></div>  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${data.templates.length ? each(data.templates, (template) => {
    return `<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h3 class="text-xl font-bold text-gray-900 mb-2">${escape(template.name)}</h3> ${template.description ? `<p class="text-gray-600 mb-4">${escape(template.description)}</p>` : ``} <div class="space-y-2 mb-4"><p class="text-sm text-gray-600"><strong data-svelte-h="svelte-1x95slo">Base Price:</strong> Tk ${escape(template.base_price.toFixed(2))}</p> <p class="text-sm text-gray-600"><strong data-svelte-h="svelte-138um1b">Default Stock:</strong> ${escape(template.default_stock)}</p> ${template.brand ? `<p class="text-sm text-gray-600"><strong data-svelte-h="svelte-1riwml5">Brand:</strong> ${escape(template.brand)}</p>` : ``} ${template.tags && template.tags.length > 0 ? `<div class="flex flex-wrap gap-1">${each(template.tags, (tag) => {
      return `<span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">${escape(tag)}</span>`;
    })} </div>` : ``}</div> <div class="flex gap-2"><button class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm" data-svelte-h="svelte-1ylik7f">Create Product</button> <form method="POST" action="?/delete" class="inline"><input type="hidden" name="id"${add_attribute("value", template.id, 0)}> <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm" data-svelte-h="svelte-2dpsw7">Delete</button> </form></div> </div>`;
  }) : `<div class="col-span-full text-center py-12 text-gray-500" data-svelte-h="svelte-1grw5h0">No templates found. Create your first template!
			</div>`}</div>  ${``}</div>`;
});
export {
  Page as default
};
