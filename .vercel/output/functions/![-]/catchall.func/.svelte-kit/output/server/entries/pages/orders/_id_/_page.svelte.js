import { c as create_ssr_component, e as escape, f as each } from "../../../../chunks/ssr.js";
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
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { params } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1e18teu_START -->${$$result.title = `<title>Order #${escape(data.order.id.slice(0, 8))} - TinyTech</title>`, ""}<!-- HEAD_svelte-1e18teu_END -->`, ""} <div class="max-w-4xl mx-auto p-8"><div class="mb-6" data-svelte-h="svelte-pe6kp6"><a href="/orders" class="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">← Back to Orders</a></div> <div class="bg-white rounded-lg shadow-md overflow-hidden"> <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h1 class="text-2xl font-bold mb-2">Order #${escape(data.order.id.slice(0, 8))}</h1> <p class="text-indigo-100">Placed on ${escape(formatDate(data.order.created_at))}</p></div> <div class="text-right"><span class="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-semibold">${escape(data.order.status.charAt(0).toUpperCase() + data.order.status.slice(1))}</span> <p class="text-3xl font-bold mt-2">Tk ${escape(data.order.total_amount.toFixed(2))}</p></div></div></div> <div class="p-6"> <div class="mb-8"><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-igt0al">Order Items</h2> <div class="space-y-3">${each(data.order.items || [], (item) => {
    return `<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p class="font-semibold text-gray-900">${escape(item.product_name)}</p> <p class="text-sm text-gray-600">Quantity: ${escape(item.quantity)} × Tk ${escape(item.unit_price.toFixed(2))}</p></div> <p class="text-lg font-bold text-gray-900">Tk ${escape(item.total_price.toFixed(2))}</p> </div>`;
  })}</div></div>  ${data.order.status_history && data.order.status_history.length > 0 ? `<div class="mb-8"><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-hsfpbk">Order Status Timeline</h2> <div class="space-y-4">${each(data.order.status_history, (history, index) => {
    return `<div class="flex gap-4"><div class="flex flex-col items-center"><div class="${"w-4 h-4 rounded-full " + escape(
      index === data.order.status_history.length - 1 ? "bg-indigo-600 ring-4 ring-indigo-200" : "bg-gray-300",
      true
    )}"></div> ${index < data.order.status_history.length - 1 ? `<div class="w-0.5 h-12 bg-gray-300"></div>` : ``}</div> <div class="flex-1 pb-4"><div class="flex items-center gap-3 mb-2"><span class="${"px-3 py-1 rounded-lg text-sm font-semibold " + escape(getStatusColor(history.status), true)}">${escape(history.status.charAt(0).toUpperCase() + history.status.slice(1))}</span> <span class="text-sm text-gray-500">${escape(formatDate(history.created_at))}</span></div> ${history.notes ? `<p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">${escape(history.notes)}</p>` : ``}</div> </div>`;
  })}</div></div>` : ``}  <div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1okogz1">Shipping Information</h2> <div class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm"><p><span class="font-semibold text-gray-700" data-svelte-h="svelte-l1vlrg">Name:</span> ${escape(data.order.customer_name)}</p> <p><span class="font-semibold text-gray-700" data-svelte-h="svelte-ahkuwj">Email:</span> ${escape(data.order.customer_email)}</p> ${data.order.customer_phone ? `<p><span class="font-semibold text-gray-700" data-svelte-h="svelte-1t6oimv">Phone:</span> ${escape(data.order.customer_phone)}</p>` : ``} ${data.order.customer_address ? `<p><span class="font-semibold text-gray-700" data-svelte-h="svelte-moyq4r">Address:</span> ${escape(data.order.customer_address)}</p>` : ``} ${data.order.tracking_number ? `<p><span class="font-semibold text-gray-700" data-svelte-h="svelte-9ynfo5">Tracking Number:</span> <span class="font-mono text-indigo-600">${escape(data.order.tracking_number)}</span></p>` : ``}</div></div> <div><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-6opxhl">Order Summary</h2> <div class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-700" data-svelte-h="svelte-1hn9maa">Subtotal:</span> <span class="font-semibold">Tk ${escape((data.order.total_amount - (data.order.shipping_cost || 0)).toFixed(2))}</span></div> ${data.order.shipping_cost ? `<div class="flex justify-between"><span class="text-gray-700" data-svelte-h="svelte-v5sj4g">Shipping:</span> <span class="font-semibold">Tk ${escape(data.order.shipping_cost.toFixed(2))}</span></div>` : ``} <div class="flex justify-between pt-2 border-t border-gray-300"><span class="font-bold text-gray-900" data-svelte-h="svelte-mof1z9">Total:</span> <span class="font-bold text-indigo-600">Tk ${escape(data.order.total_amount.toFixed(2))}</span></div> ${data.order.shipping_date ? `<p class="text-xs text-gray-500 mt-2">Shipped: ${escape(formatDate(data.order.shipping_date))}</p>` : ``} ${data.order.delivery_date ? `<p class="text-xs text-gray-500">Delivered: ${escape(formatDate(data.order.delivery_date))}</p>` : ``}</div></div></div></div></div></div>`;
});
export {
  Page as default
};
