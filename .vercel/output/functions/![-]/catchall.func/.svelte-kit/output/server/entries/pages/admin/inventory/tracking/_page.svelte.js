import { c as create_ssr_component, e as escape, b as add_attribute, f as each } from "../../../../../chunks/ssr.js";
import "chart.js/auto";
function formatCurrency(value) {
  return `Tk ${value.toFixed(2)}`;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { params = {} } = $$props;
  data.daysThreshold || 90;
  let valuationCanvas;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1f4tgek_START -->${$$result.title = `<title>Inventory Tracking - Advanced Analytics</title>`, ""}<!-- HEAD_svelte-1f4tgek_END -->`, ""} <div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-1o1gb1j">Inventory Tracking &amp; Analytics</h1>  <div class="mb-6 border-b border-gray-200"><div class="flex gap-4"><button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-indigo-600 text-indigo-600",
    true
  )}">Inventory Valuation</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Stock Movement History</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">ABC Analysis</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Dead Stock Detection</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Stock Aging Report</button></div></div>  ${`<div class="space-y-6"> <div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white"><h3 class="text-sm font-semibold text-blue-100 uppercase tracking-wide mb-2" data-svelte-h="svelte-uhn493">Total Cost Value</h3> <p class="text-3xl font-bold">${escape(formatCurrency(data.valuation.totalCostValue))}</p></div> <div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white"><h3 class="text-sm font-semibold text-green-100 uppercase tracking-wide mb-2" data-svelte-h="svelte-17ltdbc">Total Retail Value</h3> <p class="text-3xl font-bold">${escape(formatCurrency(data.valuation.totalRetailValue))}</p></div> <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white"><h3 class="text-sm font-semibold text-purple-100 uppercase tracking-wide mb-2" data-svelte-h="svelte-yyue5p">Total Products</h3> <p class="text-3xl font-bold">${escape(data.valuation.totalProducts)}</p></div></div>  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-2xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-fnodpv">Valuation by Category</h2> <div class="h-96"><canvas${add_attribute("this", valuationCanvas, 0)}></canvas></div></div>  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-2xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1temssk">Category Breakdown</h2> <div class="overflow-x-auto"><table class="w-full border-collapse"><thead data-svelte-h="svelte-hnurw0"><tr class="border-b-2 border-gray-200"><th class="text-left p-4 font-semibold text-gray-700">Category</th> <th class="text-right p-4 font-semibold text-gray-700">Cost Value</th> <th class="text-right p-4 font-semibold text-gray-700">Retail Value</th> <th class="text-right p-4 font-semibold text-gray-700">Products</th></tr></thead> <tbody>${each(data.valuation.byCategory, (category) => {
    return `<tr class="border-b border-gray-100 hover:bg-gray-50"><td class="p-4 font-medium text-gray-900">${escape(category.category)}</td> <td class="p-4 text-right text-gray-700">${escape(formatCurrency(category.costValue))}</td> <td class="p-4 text-right text-gray-700">${escape(formatCurrency(category.retailValue))}</td> <td class="p-4 text-right text-gray-700">${escape(category.productCount)}</td> </tr>`;
  })}</tbody></table></div></div></div>`}  ${``}  ${``}  ${``}  ${``}</div>`;
});
export {
  Page as default
};
