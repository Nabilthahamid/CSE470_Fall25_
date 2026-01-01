import { c as create_ssr_component, e as escape, f as each, b as add_attribute } from "../../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/state.svelte.js";
import "../../../../../../chunks/supabase.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1qgi49m_START -->${$$result.title = `<title>Product Variants - ${escape(data.product?.name || "Product")}</title>`, ""}<!-- HEAD_svelte-1qgi49m_END -->`, ""} <div class="max-w-7xl mx-auto"><a href="/admin/products" class="inline-block mb-6 text-indigo-400 no-underline hover:underline" data-svelte-h="svelte-16pt8qq">← Back to Products</a> <h1 class="text-3xl font-bold text-gray-900 mb-2" data-svelte-h="svelte-1nslafh">Product Variants</h1> <p class="text-gray-600 mb-8">Manage variants for: <strong>${escape(data.product?.name)}</strong></p> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">${escape(form.error)}</div>` : ``} ${form?.success ? `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" data-svelte-h="svelte-1cm0856">Operation successful!</div>` : ``} <div class="flex gap-4 mb-6"><button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-nkra4x">+ Add Variant</button> <button class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700" data-svelte-h="svelte-1cjxsp">+ Bulk Create Variants</button></div>  ${``}  ${``}  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1kzym98">All Variants</h2> <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50" data-svelte-h="svelte-2icupk"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attributes</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead> <tbody class="divide-y divide-gray-200">${data.variants.length ? each(data.variants, (variant) => {
    return `<tr><td class="px-6 py-4 font-medium text-gray-900">${escape(variant.name)}</td> <td class="px-6 py-4 text-gray-600 font-mono text-sm">${escape(variant.sku || "N/A")}</td> <td class="px-6 py-4 text-gray-600 text-sm">${escape(Object.entries(variant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(", "))}</td> <td class="px-6 py-4 text-gray-600">${escape(variant.price ? `Tk ${variant.price.toFixed(2)}` : "Use product price")}</td> <td class="px-6 py-4 text-gray-600">${escape(variant.stock)}</td> <td class="px-6 py-4"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(
      variant.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
      true
    )}">${escape(variant.is_active ? "Active" : "Inactive")} </span></td> <td class="px-6 py-4"><div class="flex gap-2"><button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" data-svelte-h="svelte-1ntjyhs">Edit</button> <form method="POST" action="?/deleteVariant" class="inline"><input type="hidden" name="id"${add_attribute("value", variant.id, 0)}> <button type="submit" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" data-svelte-h="svelte-oufe2q">Delete
										</button></form> </div></td> </tr>`;
  }) : `<tr data-svelte-h="svelte-xp56sc"><td colspan="7" class="px-6 py-8 text-center text-gray-500">No variants found. Create your first variant!</td> </tr>`}</tbody></table></div></div></div>`;
});
export {
  Page as default
};
