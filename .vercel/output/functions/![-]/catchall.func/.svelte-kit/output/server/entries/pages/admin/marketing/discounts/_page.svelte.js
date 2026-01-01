import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from "../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function getStatusColor(discount) {
  if (!discount.is_active) return "bg-gray-100 text-gray-800";
  const now = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  if (discount.start_date && discount.start_date > now) return "bg-yellow-100 text-yellow-800";
  if (discount.end_date && discount.end_date < now) return "bg-red-100 text-red-800";
  return "bg-green-100 text-green-800";
}
function getStatusText(discount) {
  if (!discount.is_active) return "Inactive";
  const now = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  if (discount.start_date && discount.start_date > now) return "Scheduled";
  if (discount.end_date && discount.end_date < now) return "Expired";
  return "Active";
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  let activeTab = data.activeTab || "discounts";
  let startDate = data.startDate || "";
  let endDate = data.endDate || "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1vc4z3a_START -->${$$result.title = `<title>Discount Management - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-1vc4z3a_END -->`, ""} <div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-38c5y8">Discount &amp; Coupon Management</h1>  <div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6"><div class="flex flex-wrap items-end gap-4"><div><label class="block mb-2 text-sm font-medium" data-svelte-h="svelte-157ki2f">Start Date</label> <input type="date" class="p-2 border-2 border-gray-300 rounded-lg"${add_attribute("value", startDate, 0)}></div> <div><label class="block mb-2 text-sm font-medium" data-svelte-h="svelte-q7yseg">End Date</label> <input type="date" class="p-2 border-2 border-gray-300 rounded-lg"${add_attribute("value", endDate, 0)}></div> <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-ujg2hx">Apply Filter</button> <button class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700" data-svelte-h="svelte-1c0nows">Clear</button></div></div>  <div class="mb-6 border-b border-gray-200"><div class="flex gap-4"><button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    activeTab === "discounts" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Discounts</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    activeTab === "analytics" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Analytics</button></div></div> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">${escape(form.error)}</div>` : ``} ${form?.success ? `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" data-svelte-h="svelte-1cm0856">Operation successful!</div>` : ``}  ${activeTab === "discounts" ? `<div class="space-y-6"><div class="flex justify-between items-center"><h2 class="text-2xl font-bold text-gray-900" data-svelte-h="svelte-1umrzjq">Discount Codes</h2> <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-vfa24q">+ Create Discount</button></div> ${``}  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h3 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-pvr3nk">All Discounts</h3> <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50" data-svelte-h="svelte-8z1r7m"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead> <tbody class="divide-y divide-gray-200">${data.discounts.length ? each(data.discounts, (discount) => {
    return `<tr><td class="px-6 py-4 font-mono font-semibold text-gray-900">${escape(discount.code)}</td> <td class="px-6 py-4 text-gray-600">${escape(discount.name)}</td> <td class="px-6 py-4 text-gray-600 capitalize">${escape(discount.discount_type.replace("_", " "))}</td> <td class="px-6 py-4 text-gray-600">${escape(discount.discount_type === "percentage" ? `${discount.discount_value}%` : discount.discount_type === "free_shipping" ? "Free Shipping" : `Tk ${discount.discount_value.toFixed(2)}`)}</td> <td class="px-6 py-4 text-gray-600">${escape(discount.used_count)} / ${escape(discount.usage_limit_total || "∞")}</td> <td class="px-6 py-4"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(getStatusColor(discount), true)}">${escape(getStatusText(discount))} </span></td> <td class="px-6 py-4"><div class="flex gap-2"><button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" data-svelte-h="svelte-eksdmk">Edit</button> <form method="POST" action="?/delete" class="inline"><input type="hidden" name="id"${add_attribute("value", discount.id, 0)}> <button type="submit" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" data-svelte-h="svelte-r8qx1w">Delete
												</button></form> </div></td> </tr>`;
  }) : `<tr data-svelte-h="svelte-ji0sse"><td colspan="7" class="px-6 py-8 text-center text-gray-500">No discounts found. Create your first discount!</td> </tr>`}</tbody></table></div></div></div>` : ``}  ${activeTab === "analytics" ? `<div class="space-y-6"> <div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-8ev304">Total Discounts</h3> <p class="text-3xl font-bold text-gray-900">${escape(data.analytics.totalDiscounts)}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-1l2fbya">Active Discounts</h3> <p class="text-3xl font-bold text-indigo-600">${escape(data.analytics.activeDiscounts)}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-18v2vbb">Total Usage</h3> <p class="text-3xl font-bold text-green-600">${escape(data.analytics.totalUsage)}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-1hx6yp2">Revenue Impact</h3> <p class="text-3xl font-bold text-red-600">Tk ${escape(data.analytics.revenueImpact.toFixed(2))}</p></div></div>  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-2xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1crzu4u">Discounts by Type</h2> <div class="space-y-3">${data.analytics.byType.length ? each(data.analytics.byType, (item) => {
    return `<div><div class="flex justify-between items-center mb-1"><span class="text-gray-700 font-medium capitalize">${escape(item.type.replace("_", " "))}</span> <span class="text-gray-900 font-semibold">${escape(item.count)} discounts • Tk ${escape(item.totalAmount.toFixed(2))}</span></div> <div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="${"width: " + escape(
      data.analytics.totalDiscountAmount > 0 ? item.totalAmount / data.analytics.totalDiscountAmount * 100 : 0,
      true
    ) + "%"}"></div></div> </div>`;
  }) : `<p class="text-gray-500 text-center py-4" data-svelte-h="svelte-1d4js9p">No discount type data</p>`}</div></div>  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-2xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1bfkz3i">Top Discounts</h2> <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50" data-svelte-h="svelte-dqzm2r"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th></tr></thead> <tbody class="divide-y divide-gray-200">${data.analytics.topDiscounts.length ? each(data.analytics.topDiscounts, (discount) => {
    return `<tr><td class="px-6 py-4 font-mono font-semibold text-gray-900">${escape(discount.code)}</td> <td class="px-6 py-4 text-gray-600">${escape(discount.usage)} times</td> <td class="px-6 py-4 font-semibold text-gray-900">Tk ${escape(discount.totalAmount.toFixed(2))}</td> </tr>`;
  }) : `<tr data-svelte-h="svelte-q9i1dy"><td colspan="3" class="px-6 py-8 text-center text-gray-500">No usage data</td> </tr>`}</tbody></table></div></div></div>` : ``}</div>`;
});
export {
  Page as default
};
