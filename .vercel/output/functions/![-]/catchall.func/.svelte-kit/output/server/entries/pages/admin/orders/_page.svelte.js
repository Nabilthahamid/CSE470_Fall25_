import { c as create_ssr_component, e as escape, b as add_attribute, f as each } from "../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
function getRiskBadgeClass(riskLevel) {
  switch (riskLevel) {
    case "high":
      return "bg-red-100 text-red-700 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  let selectedOrderId = "";
  let trackingNumber = "";
  let statusNotes = "";
  let showStatusModal = false;
  let searchInput = data.searchQuery || "";
  data.filters?.startDate || "";
  data.filters?.endDate || "";
  function closeStatusModal() {
    showStatusModal = false;
    selectedOrderId = "";
    trackingNumber = "";
    statusNotes = "";
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  {
    if (form?.success) {
      closeStatusModal();
      setTimeout(
        () => {
          window.location.reload();
        },
        1e3
      );
    }
  }
  return `  ${$$result.head += `<!-- HEAD_svelte-193avuz_START -->${$$result.title = `<title>Order Management - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-193avuz_END -->`, ""} <div class="max-w-7xl mx-auto"><div class="flex justify-between items-center mb-8"><h1 class="text-3xl font-bold text-gray-900" data-svelte-h="svelte-oc0201">Order Management</h1> <button type="button" class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold" data-svelte-h="svelte-1ww94vz"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
			Export CSV</button></div>  <div class="bg-white rounded-lg shadow-md p-4 mb-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold text-gray-900" data-svelte-h="svelte-sz817x">Search &amp; Filter Orders</h2> <button type="button" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg> ${escape("Show Filters")}</button></div>  <div class="mb-4"><label for="orderSearch" class="block mb-2 font-medium text-sm text-gray-700" data-svelte-h="svelte-1x98gns">Search</label> <div class="flex gap-2"><input type="text" id="orderSearch" placeholder="Search by Order ID, Customer Name, Email, or Tracking Number..." class="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"${add_attribute("value", searchInput, 0)}> <button type="button" class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700" data-svelte-h="svelte-2exfc7">Search</button> <button type="button" class="bg-gray-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700" data-svelte-h="svelte-79c0c3">Clear</button></div></div>  ${``}</div>  <div class="bg-white rounded-lg shadow-md p-4 mb-6"><div class="flex flex-wrap gap-2"><button type="button" class="${"px-4 py-2 rounded-lg font-semibold transition-colors " + escape(
    data.currentFilter === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    true
  )}">All Orders</button> <button type="button" class="${"px-4 py-2 rounded-lg font-semibold transition-colors " + escape(
    data.currentFilter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    true
  )}">Pending</button> <button type="button" class="${"px-4 py-2 rounded-lg font-semibold transition-colors " + escape(
    data.currentFilter === "processing" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    true
  )}">Processing</button> <button type="button" class="${"px-4 py-2 rounded-lg font-semibold transition-colors " + escape(
    data.currentFilter === "shipped" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    true
  )}">Shipped</button> <button type="button" class="${"px-4 py-2 rounded-lg font-semibold transition-colors " + escape(
    data.currentFilter === "delivered" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    true
  )}">Delivered</button> <button type="button" class="${"px-4 py-2 rounded-lg font-semibold transition-colors " + escape(
    data.currentFilter === "cancelled" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    true
  )}">Cancelled</button></div></div>  ${form?.error ? `<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p class="text-red-800">${escape(form.error)}</p></div>` : ``}  ${form?.success ? `<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"><p class="text-green-800">${escape(form.message)}</p></div>` : ``}  <div class="mb-4 text-sm text-gray-600">Showing ${escape(data.orders.length)} ${escape(data.orders.length === 1 ? "order" : "orders")} ${data.searchQuery || data.filters?.startDate || data.filters?.endDate ? `(matching filters)` : ``}</div>  ${data.orders && data.orders.length > 0 ? `<div class="space-y-4">${each(data.orders, (order) => {
    return `<div class="bg-white rounded-lg shadow-md overflow-hidden"> <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><div class="flex items-center gap-3 mb-2 flex-wrap"><h3 class="text-lg font-bold text-gray-900">Order #${escape(order.id.slice(0, 8))}</h3> <span class="${"px-3 py-1 rounded-full text-sm font-semibold border-2 " + escape(getStatusColor(order.status), true)}">${escape(order.status.charAt(0).toUpperCase() + order.status.slice(1))}</span> ${data.orderRiskScores && data.orderRiskScores[order.id] ? (() => {
      let riskScore = data.orderRiskScores[order.id];
      return ` <span class="${"px-3 py-1 rounded-full text-xs font-semibold border " + escape(getRiskBadgeClass(riskScore.riskLevel), true)}" title="${"Risk Score: " + escape(Math.round(riskScore.riskScore * 100), true) + "%"}">⚠️ ${escape(riskScore.riskLevel.toUpperCase())} RISK
										</span>`;
    })() : ``}</div> <p class="text-sm text-gray-600">Placed on ${escape(formatDate(order.created_at))}</p> <p class="text-sm text-gray-600">Customer: ${escape(order.customer_name)} (${escape(order.customer_email)})</p> ${data.orderRiskScores && data.orderRiskScores[order.id] ? (() => {
      let riskScore = data.orderRiskScores[order.id];
      return ` ${riskScore.factors && riskScore.factors.length > 0 ? `<div class="mt-2 text-xs text-gray-500"><span class="font-semibold" data-svelte-h="svelte-104x0h1">Risk factors:</span> ${escape(riskScore.factors.join(", "))} </div>` : ``}`;
    })() : ``}</div> <div class="text-right"><p class="text-2xl font-bold text-indigo-600">Tk ${escape(order.total_amount.toFixed(2))}</p> ${order.tracking_number ? `<p class="text-sm text-gray-600 mt-1">Tracking: ${escape(order.tracking_number)}</p>` : ``}</div> </div></div>  <div class="p-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> <div><h4 class="font-semibold text-gray-900 mb-3" data-svelte-h="svelte-64br1i">Order Items</h4> <div class="space-y-2">${each(order.items || [], (item) => {
      return `<div class="flex justify-between text-sm py-2 border-b border-gray-100"><span class="text-gray-700">${escape(item.product_name)} (×${escape(item.quantity)})</span> <span class="font-semibold text-gray-900">Tk ${escape(item.total_price.toFixed(2))}</span> </div>`;
    })} </div></div>  <div><h4 class="font-semibold text-gray-900 mb-3" data-svelte-h="svelte-19h5s8m">Shipping Information</h4> <div class="text-sm space-y-1 text-gray-700">${order.customer_phone ? `<p><span class="font-semibold" data-svelte-h="svelte-y4f3kq">Phone:</span> ${escape(order.customer_phone)}</p>` : ``} ${order.customer_address ? `<p><span class="font-semibold" data-svelte-h="svelte-1dytog6">Address:</span> ${escape(order.customer_address)}</p>` : ``} ${order.shipping_method ? `<p><span class="font-semibold" data-svelte-h="svelte-1u7bwsv">Method:</span> ${escape(order.shipping_method)}</p>` : ``} ${order.payment_method ? `<p><span class="font-semibold" data-svelte-h="svelte-1ego9p8">Payment:</span> ${escape(order.payment_method)}</p>` : ``}</div> </div></div>  <div class="flex gap-3 pt-4 border-t border-gray-200"><button type="button" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm" data-svelte-h="svelte-2zpqsl">Update Status</button> <a href="${"/orders/" + escape(order.id, true)}" target="_blank" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm">View Details</a> </div></div> </div>`;
  })}</div>` : `<div class="bg-white rounded-lg shadow-md p-12 text-center" data-svelte-h="svelte-1xxbvuu"><svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3> <p class="text-gray-600">No orders match the current filter.</p></div>`}</div>  ${showStatusModal ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="status-modal-title" tabindex="-1"><div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4" role="document"><form method="POST" action="?/updateStatus" class="p-6"><h2 id="status-modal-title" class="text-2xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-7d93ih">Update Order Status</h2> <input type="hidden" name="order_id"${add_attribute("value", selectedOrderId, 0)}> <div class="mb-4"><label for="status" class="block mb-2 font-medium text-gray-900" data-svelte-h="svelte-rjhrwo">Status</label> <select id="status" name="status" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"><option value="pending" data-svelte-h="svelte-mygx0s">Pending</option><option value="processing" data-svelte-h="svelte-xdki36">Processing</option><option value="shipped" data-svelte-h="svelte-1k1f4js">Shipped</option><option value="delivered" data-svelte-h="svelte-462xjy">Delivered</option><option value="cancelled" data-svelte-h="svelte-u8k0fw">Cancelled</option><option value="completed" data-svelte-h="svelte-1s7i1yc">Completed</option></select></div> <div class="mb-4"><label for="tracking_number" class="block mb-2 font-medium text-gray-900" data-svelte-h="svelte-1icj07x">Tracking Number (Optional)</label> <input type="text" id="tracking_number" name="tracking_number" placeholder="Enter tracking number" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"${add_attribute("value", trackingNumber, 0)}></div> <div class="mb-6"><label for="notes" class="block mb-2 font-medium text-gray-900" data-svelte-h="svelte-p9uhlj">Notes (Optional)</label> <textarea id="notes" name="notes" rows="3" placeholder="Add any notes about this status change..." class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500">${escape(statusNotes || "")}</textarea></div> <div class="flex gap-3"><button type="submit" class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold" data-svelte-h="svelte-18govfl">Update Status</button> <button type="button" class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold" data-svelte-h="svelte-nneqn7">Cancel</button></div></form></div></div>` : ``}`;
});
export {
  Page as default
};
