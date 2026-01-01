import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from "../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
function getStatusIcon(status) {
  switch (status) {
    case "pending":
      return "⏳";
    case "processing":
      return "⚙️";
    case "shipped":
      return "📦";
    case "delivered":
      return "✅";
    case "cancelled":
      return "❌";
    case "completed":
      return "✓";
    default:
      return "📋";
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
  let { params = {} } = $$props;
  let searchOrderId = "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-lxem1q_START -->${$$result.title = `<title>My Orders - TinyTech</title>`, ""}<!-- HEAD_svelte-lxem1q_END -->`, ""} <div class="max-w-7xl mx-auto p-8"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-1eyya87">My Orders</h1>  <div class="bg-white rounded-lg shadow-md p-6 mb-8"><h2 class="text-xl font-semibold text-gray-900 mb-4" data-svelte-h="svelte-fvehj1">Track Your Order</h2> <div class="flex gap-3"><input type="text" placeholder="Enter Order ID" class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"${add_attribute("value", searchOrderId, 0)}> <button type="button" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold" data-svelte-h="svelte-7ud537">Track Order</button></div></div>  ${data.error ? `<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p class="text-red-800">${escape(data.error)}</p></div>` : ``} ${data.orders && data.orders.length > 0 ? `<div class="space-y-6">${each(data.orders, (order) => {
    return `<div class="bg-white rounded-lg shadow-md overflow-hidden"> <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><div class="flex items-center gap-3 mb-2"><h3 class="text-lg font-bold text-gray-900">Order #${escape(order.id.slice(0, 8))}</h3> <span class="${"px-3 py-1 rounded-full text-sm font-semibold " + escape(getStatusColor(order.status), true)}">${escape(getStatusIcon(order.status))} ${escape(order.status.charAt(0).toUpperCase() + order.status.slice(1))} </span></div> <p class="text-sm text-gray-600">Placed on ${escape(formatDate(order.created_at))}</p></div> <div class="text-right"><p class="text-2xl font-bold text-indigo-600">Tk ${escape(order.total_amount.toFixed(2))}</p> ${order.tracking_number ? `<p class="text-sm text-gray-600 mt-1">Tracking: ${escape(order.tracking_number)}</p>` : ``}</div> </div></div>  <div class="p-6"><h4 class="font-semibold text-gray-900 mb-4" data-svelte-h="svelte-au5o99">Order Items</h4> <div class="space-y-3">${each(order.items || [], (item) => {
      return `<div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"><div class="flex-1"><p class="font-medium text-gray-900">${escape(item.product_name)}</p> <p class="text-sm text-gray-600">Quantity: ${escape(item.quantity)} × Tk ${escape(item.unit_price.toFixed(2))}</p></div> <p class="font-semibold text-gray-900">Tk ${escape(item.total_price.toFixed(2))}</p> </div>`;
    })}</div>  <div class="mt-6 pt-6 border-t border-gray-200"><h4 class="font-semibold text-gray-900 mb-3" data-svelte-h="svelte-19h5s8m">Shipping Information</h4> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div><p class="text-gray-600" data-svelte-h="svelte-l7k7yw">Name:</p> <p class="font-medium text-gray-900">${escape(order.customer_name)}</p></div> <div><p class="text-gray-600" data-svelte-h="svelte-on7ef1">Email:</p> <p class="font-medium text-gray-900">${escape(order.customer_email)}</p></div> ${order.customer_phone ? `<div><p class="text-gray-600" data-svelte-h="svelte-pamd6p">Phone:</p> <p class="font-medium text-gray-900">${escape(order.customer_phone)}</p> </div>` : ``} ${order.customer_address ? `<div><p class="text-gray-600" data-svelte-h="svelte-w38zyx">Address:</p> <p class="font-medium text-gray-900">${escape(order.customer_address)}</p> </div>` : ``} </div></div>  ${order.status_history && order.status_history.length > 0 ? `<div class="mt-6 pt-6 border-t border-gray-200"><h4 class="font-semibold text-gray-900 mb-4" data-svelte-h="svelte-pxgktg">Order Status Timeline</h4> <div class="space-y-4">${each(order.status_history, (history, index) => {
      return `<div class="flex gap-4"><div class="flex flex-col items-center"><div class="${"w-3 h-3 rounded-full " + escape(
        index === order.status_history.length - 1 ? "bg-indigo-600" : "bg-gray-300",
        true
      )}"></div> ${index < order.status_history.length - 1 ? `<div class="w-0.5 h-8 bg-gray-300"></div>` : ``}</div> <div class="flex-1 pb-4"><div class="flex items-center gap-2 mb-1"><span class="${"px-2 py-1 rounded text-xs font-semibold " + escape(getStatusColor(history.status), true)}">${escape(getStatusIcon(history.status))} ${escape(history.status.charAt(0).toUpperCase() + history.status.slice(1))}</span> <span class="text-xs text-gray-500">${escape(formatDate(history.created_at))}</span></div> ${history.notes ? `<p class="text-sm text-gray-600">${escape(history.notes)}</p>` : ``}</div> </div>`;
    })}</div> </div>` : ``}  <div class="mt-6 pt-6 border-t border-gray-200 flex gap-3"><a href="${"/orders/" + escape(order.id, true)}" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm">View Details</a> </div></div> </div>`;
  })}</div>` : `<div class="bg-white rounded-lg shadow-md p-12 text-center" data-svelte-h="svelte-1tva8aq"><svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3> <p class="text-gray-600 mb-6">You haven&#39;t placed any orders yet.</p> <a href="/products" class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Start Shopping</a></div>`}</div>`;
});
export {
  Page as default
};
