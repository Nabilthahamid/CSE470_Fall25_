import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from "../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { params = {} } = $$props;
  let selectedProducts = /* @__PURE__ */ new Set();
  let selectAll = false;
  let priceValue = 0;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1kgjybg_START -->${$$result.title = `<title>Bulk Operations - Inventory Management</title>`, ""}<!-- HEAD_svelte-1kgjybg_END -->`, ""} <div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-gpgabk">Bulk Operations</h1>  <div class="mb-6 border-b border-gray-200"><div class="flex gap-4"><button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-indigo-600 text-indigo-600",
    true
  )}">Bulk Price Update</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Bulk Stock Update</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Bulk Category Assignment</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Bulk Delete</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Import Products</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Export Products</button></div></div>  <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200"><div class="flex items-center justify-between mb-4"><h2 class="text-xl font-bold text-gray-900" data-svelte-h="svelte-igiebn">Select Products</h2> <div class="flex items-center gap-4"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="select-all" class="w-4 h-4"${add_attribute("checked", selectAll, 1)}> <span class="text-sm font-medium">Select All (${escape(data.products.length)})</span></label> <span class="text-sm text-gray-600">${escape(selectedProducts.size)} selected</span></div></div> <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg"><table class="w-full"><thead class="bg-gray-50 sticky top-0" data-svelte-h="svelte-s73mng"><tr><th class="p-3 text-left text-sm font-semibold text-gray-700">Select</th> <th class="p-3 text-left text-sm font-semibold text-gray-700">Product</th> <th class="p-3 text-right text-sm font-semibold text-gray-700">Price</th> <th class="p-3 text-right text-sm font-semibold text-gray-700">Stock</th></tr></thead> <tbody>${each(data.products, (product) => {
    return `<tr class="border-b border-gray-100 hover:bg-gray-50"><td class="p-3"><input type="checkbox" ${selectedProducts.has(product.id) ? "checked" : ""} class="w-4 h-4"></td> <td class="p-3 font-medium text-gray-900">${escape(product.name)}</td> <td class="p-3 text-right text-gray-700">Tk ${escape(product.price.toFixed(2))}</td> <td class="p-3 text-right text-gray-700">${escape(product.stock)}</td> </tr>`;
  })}</tbody></table></div></div>  ${`<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1yo0xdr">Bulk Price Update</h2> <div class="space-y-4"><div><label for="price-update-type" class="block mb-2 font-medium" data-svelte-h="svelte-1kktfty">Update Type</label> <select id="price-update-type" class="w-full p-3 border-2 border-gray-300 rounded-lg"><option value="percentage" data-svelte-h="svelte-bheytq">Percentage Change (%)</option><option value="fixed" data-svelte-h="svelte-1hnorxq">Fixed Amount (Tk)</option></select></div> <div><label for="price-value" class="block mb-2 font-medium">${escape(
    "Percentage"
  )} (${escape("%")})</label> <input id="price-value" type="number"${add_attribute("step", "1", 0)} class="w-full p-3 border-2 border-gray-300 rounded-lg"${add_attribute("value", priceValue, 0)}></div> <button ${selectedProducts.size === 0 ? "disabled" : ""} class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">Update Prices</button></div></div>`}  ${``}  ${``}  ${``}  ${``}  ${``}</div>`;
});
export {
  Page as default
};
