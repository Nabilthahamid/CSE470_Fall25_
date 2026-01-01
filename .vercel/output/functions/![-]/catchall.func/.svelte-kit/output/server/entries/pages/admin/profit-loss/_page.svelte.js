import { c as create_ssr_component, e as escape, b as add_attribute, f as each } from "../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/supabase.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  let startDate = "";
  let endDate = "";
  let productId = "";
  function downloadCSV() {
    const csv = form?.csvContent || "";
    const filename = form?.filename || "profit-loss-report.csv";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  {
    if (form?.csvContent) {
      downloadCSV();
    }
  }
  return `  ${$$result.head += `<!-- HEAD_svelte-1kjj9gy_START -->${$$result.title = `<title>Profit/Loss Report - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-1kjj9gy_END -->`, ""} <div class="max-w-7xl mx-auto"><div class="flex justify-between items-center mb-8"><h1 class="m-0 text-3xl font-bold" data-svelte-h="svelte-1mpxmrt">Profit/Loss Report</h1> <div class="flex gap-4"><button class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700">${escape("Show Filters")}</button> <form method="POST" action="?/export"><input type="hidden" name="startDate"${add_attribute("value", startDate, 0)}> <input type="hidden" name="endDate"${add_attribute("value", endDate, 0)}> <input type="hidden" name="productId"${add_attribute("value", productId, 0)}> <button type="submit" class="bg-green-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-green-700" data-svelte-h="svelte-1qzmbcg">Download CSV Report</button></form></div></div> ${data.error ? `<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">${escape(data.error)}</div>` : ``} ${form?.error ? `<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">${escape(form.error)}</div>` : ``} ${``}  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"><div class="bg-white/5 p-6 rounded-lg border border-white/10"><h3 class="text-gray-400 text-sm mb-2" data-svelte-h="svelte-16zlhab">Total Sales</h3> <p class="text-3xl font-bold">$${escape(data.report.totalSales.toFixed(2))}</p></div> <div class="bg-white/5 p-6 rounded-lg border border-white/10"><h3 class="text-gray-400 text-sm mb-2" data-svelte-h="svelte-jempqe">Total Cost</h3> <p class="text-3xl font-bold">$${escape(data.report.totalCost.toFixed(2))}</p></div> <div class="bg-green-500/10 p-6 rounded-lg border border-green-500/30"><h3 class="text-green-400 text-sm mb-2" data-svelte-h="svelte-1idaq4x">Total Profit</h3> <p class="text-3xl font-bold text-green-400">$${escape(data.report.totalProfit.toFixed(2))}</p></div> <div class="bg-red-500/10 p-6 rounded-lg border border-red-500/30"><h3 class="text-red-400 text-sm mb-2" data-svelte-h="svelte-s3cjw8">Total Loss</h3> <p class="text-3xl font-bold text-red-400">$${escape(data.report.totalLoss.toFixed(2))}</p></div> <div class="${"p-6 rounded-lg border " + escape(
    data.report.netProfit >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30",
    true
  )}"><h3 class="text-gray-400 text-sm mb-2" data-svelte-h="svelte-ofvm3u">Net Profit</h3> <p class="${"text-3xl font-bold " + escape(
    data.report.netProfit >= 0 ? "text-green-400" : "text-red-400",
    true
  )}">$${escape(data.report.netProfit.toFixed(2))}</p></div></div>  <div class="mb-8"><h2 class="mb-4 text-2xl font-semibold" data-svelte-h="svelte-1txyywy">Product Breakdown</h2> <div class="bg-white/5 rounded-lg border border-white/10 overflow-x-auto"><table class="w-full border-collapse"><thead data-svelte-h="svelte-1xsudyk"><tr class="border-b border-white/10"><th class="p-4 text-left">Product</th> <th class="p-4 text-right">Quantity Sold</th> <th class="p-4 text-right">Revenue</th> <th class="p-4 text-right">Cost</th> <th class="p-4 text-right">Profit</th> <th class="p-4 text-right">Loss</th> <th class="p-4 text-right">Net Profit</th></tr></thead> <tbody>${each(data.report.productBreakdown, (item) => {
    return `<tr class="border-b border-white/5 hover:bg-white/5"><td class="p-4">${escape(item.product_name)}</td> <td class="p-4 text-right">${escape(item.totalSold)}</td> <td class="p-4 text-right">$${escape(item.totalRevenue.toFixed(2))}</td> <td class="p-4 text-right">$${escape(item.totalCost.toFixed(2))}</td> <td class="p-4 text-right text-green-400">$${escape(item.profit.toFixed(2))}</td> <td class="p-4 text-right text-red-400">$${escape(item.loss.toFixed(2))}</td> <td class="${"p-4 text-right " + escape(item.netProfit >= 0 ? "text-green-400" : "text-red-400", true)}">$${escape(item.netProfit.toFixed(2))}</td> </tr>`;
  })}</tbody></table> ${data.report.productBreakdown.length === 0 ? `<div class="p-8 text-center text-gray-400" data-svelte-h="svelte-16w2zyf">No sales data available</div>` : ``}</div></div>  <div><h2 class="mb-4 text-2xl font-semibold" data-svelte-h="svelte-oofuzt">Recent Sales</h2> <div class="bg-white/5 rounded-lg border border-white/10 overflow-x-auto"><table class="w-full border-collapse"><thead data-svelte-h="svelte-2bnumb"><tr class="border-b border-white/10"><th class="p-4 text-left">Date</th> <th class="p-4 text-left">Product</th> <th class="p-4 text-left">Customer</th> <th class="p-4 text-right">Quantity</th> <th class="p-4 text-right">Sale Price</th> <th class="p-4 text-right">Total Amount</th> <th class="p-4 text-right">Profit/Loss</th></tr></thead> <tbody>${each(data.report.sales.slice(0, 50), (sale) => {
    return `<tr class="border-b border-white/5 hover:bg-white/5"><td class="p-4">${sale.created_at ? `${escape(new Date(sale.created_at).toLocaleDateString())}` : ``}</td> <td class="p-4">${escape(sale.product_name || "N/A")}</td> <td class="p-4">${escape(sale.user_name || "Guest")}</td> <td class="p-4 text-right">${escape(sale.quantity)}</td> <td class="p-4 text-right">$${escape(sale.sale_price.toFixed(2))}</td> <td class="p-4 text-right">$${escape(sale.total_amount.toFixed(2))}</td> <td class="${"p-4 text-right " + escape(sale.profit >= 0 ? "text-green-400" : "text-red-400", true)}">$${escape(sale.profit.toFixed(2))}</td> </tr>`;
  })}</tbody></table> ${data.report.sales.length === 0 ? `<div class="p-8 text-center text-gray-400" data-svelte-h="svelte-16w2zyf">No sales data available</div>` : ``}</div></div></div>`;
});
export {
  Page as default
};
