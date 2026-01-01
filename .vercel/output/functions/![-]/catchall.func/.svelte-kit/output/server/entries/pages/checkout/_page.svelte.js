import { c as create_ssr_component, e as escape, b as add_attribute, f as each } from "../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let shippingCost;
  let totalAmount;
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  let email = form?.customer_email || data.userProfile?.customer_email || data.user?.email || "";
  let firstName = "";
  let lastName = "";
  let country = data.userProfile?.customer_country || "Bangladesh";
  let address = data.userProfile?.customer_address || "";
  let city = data.userProfile?.customer_city || "";
  let postalCode = data.userProfile?.customer_postal_code || "";
  let phone = data.userProfile?.customer_phone || "";
  let shippingMethod = "inside_dhaka";
  function initializeFromProfile() {
    if (data.userProfile?.customer_name) {
      const nameParts = data.userProfile.customer_name.trim().split(" ");
      if (nameParts.length > 1) {
        lastName = nameParts.pop() || "";
        firstName = nameParts.join(" ");
      } else {
        lastName = nameParts[0] || "";
        firstName = "";
      }
    }
  }
  initializeFromProfile();
  const shippingMethods = [
    {
      value: "inside_dhaka",
      label: "Inside Dhaka",
      price: 70
    },
    {
      value: "gazipur_narayanganj_savar",
      label: "Gazipur / Narayanganj / Savar",
      price: 80
    },
    {
      value: "outside_dhaka",
      label: "Outside Dhaka",
      price: 100
    }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  shippingCost = shippingMethods.find((m) => m.value === shippingMethod)?.price || 0;
  totalAmount = data.total + shippingCost;
  return `  ${$$result.head += `<!-- HEAD_svelte-1aib2oh_START -->${$$result.title = `<title>Checkout - TinyTech</title>`, ""}<!-- HEAD_svelte-1aib2oh_END -->`, ""} <div class="max-w-6xl mx-auto p-8"><h1 class="mb-8 text-3xl font-bold" data-svelte-h="svelte-jaaw59">Checkout</h1> ${form?.error ? `<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">${escape(form.error)}</div>` : ``} <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-2"><form method="POST"> <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6"><div class="flex justify-between items-center mb-6"><h2 class="text-xl font-semibold m-0" data-svelte-h="svelte-12kcm28">Contact</h2> <div class="flex items-center gap-4">${data.userProfile?.customer_name && data.userProfile?.customer_address && data.userProfile?.customer_phone && data.userProfile?.customer_city ? `<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold" data-svelte-h="svelte-36y8m4">✓ Profile Info Loaded</span>` : ``} ${data.user ? `<a href="/profile" class="text-blue-600 no-underline hover:underline text-sm" data-svelte-h="svelte-554zy6">Edit Profile</a>` : `<a href="/auth/login" class="text-blue-600 no-underline hover:underline text-sm" data-svelte-h="svelte-xw9i3m">Sign in</a>`}</div></div> <div class="mb-4"><label for="customer_email" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-1kl8e5z">Email or mobile phone number</label> <input type="text" id="customer_email" name="customer_email"${add_attribute("value", email, 0)} required class="w-full p-3 border-2 border-blue-500 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@example.com or +8801234567890"></div> <div class="flex items-center"><input type="checkbox" id="email_newsletter" name="email_newsletter" ${""} class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"> <label for="email_newsletter" class="ml-2 text-sm text-gray-700" data-svelte-h="svelte-1ev44di">Email me with news and offers</label></div></div>  <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6"><h2 class="text-xl font-semibold mb-6 m-0" data-svelte-h="svelte-pwguwo">Delivery</h2> <div class="mb-4"><label for="country" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-1namuwg">Country/Region</label> <select id="country" name="customer_country"${add_attribute("value", country, 0)} class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Bangladesh" data-svelte-h="svelte-16c7nni">Bangladesh</option><option value="India" data-svelte-h="svelte-e7gfis">India</option><option value="Pakistan" data-svelte-h="svelte-hndgwe">Pakistan</option><option value="Other" data-svelte-h="svelte-1tac7i">Other</option></select></div> <div class="grid grid-cols-2 gap-4 mb-4"><div><label for="first_name" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-yppddd">First name <span class="text-gray-500">(optional)</span></label> <input type="text" id="first_name" name="first_name"${add_attribute("value", firstName, 0)} class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"></div> <div><label for="last_name" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-1k6f57m">Last name</label> <input type="text" id="last_name" name="last_name"${add_attribute("value", lastName, 0)} required class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"> <input type="hidden" name="customer_name"${add_attribute("value", firstName ? `${firstName} ${lastName}`.trim() : lastName, 0)}></div></div> <div class="mb-4"><label for="address" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-xdqrml">Address</label> <input type="text" id="address" name="customer_address"${add_attribute("value", address, 0)} required class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Street address, apartment, suite, etc."></div> <div class="grid grid-cols-2 gap-4 mb-4"><div><label for="city" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-2qvm51">City</label> <input type="text" id="city" name="customer_city"${add_attribute("value", city, 0)} required class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"></div> <div><label for="postal_code" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-1bt9ln5">Postal code <span class="text-gray-500">(optional)</span></label> <input type="text" id="postal_code" name="customer_postal_code"${add_attribute("value", postalCode, 0)} class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"></div></div> <div class="mb-4"><label for="phone" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-1jz2evq">Phone
							<span class="ml-1 text-gray-500 cursor-help" title="Required for delivery">ℹ️</span></label> <input type="tel" id="phone" name="customer_phone"${add_attribute("value", phone, 0)} required class="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+8801234567890"></div> <div class="flex items-center"><input type="checkbox" id="save_info" name="save_info" ${""} class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"> <label for="save_info" class="ml-2 text-sm text-gray-700" data-svelte-h="svelte-1w38inn">Save this information for next time</label></div></div>  <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6"><h2 class="text-xl font-semibold mb-6 m-0" data-svelte-h="svelte-1oc4ed7">Shipping method</h2> <div class="space-y-4">${each(shippingMethods, (method) => {
    return `<label class="${"flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors " + escape(
      shippingMethod === method.value ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
      true
    )}"><div class="flex items-center"><input type="radio" name="shipping_method"${add_attribute("value", method.value, 0)} ${shippingMethod === method.value ? "checked" : ""} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"> <span class="ml-3 text-base font-medium">${escape(method.label)}</span></div> <span class="text-base font-semibold">৳${escape(method.price.toFixed(2))}</span> </label>`;
  })}</div></div>  <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6"><h2 class="text-xl font-semibold mb-2 m-0" data-svelte-h="svelte-wexdhq">Payment</h2> <p class="text-sm text-gray-600 mb-6 m-0" data-svelte-h="svelte-2i7noo">All transactions are secure and encrypted.</p> <div class="space-y-4"><label class="${"flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors " + escape(
    "border-blue-500 bg-blue-50",
    true
  )}"><input type="radio" name="payment_method" value="cod" ${"checked"} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"> <div class="ml-3 flex-1" data-svelte-h="svelte-1gs5jmt"><div class="font-medium text-base">Cash on Delivery (COD)</div> <div class="text-sm text-gray-600 mt-1">Pay with cash on delivery (You may be asked to pay delivery charge in advance.)</div></div></label> <label class="${"flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors " + escape(
    "border-gray-300 hover:border-gray-400",
    true
  )}"><input type="radio" name="payment_method" value="bank" ${""} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"> <span class="ml-3 text-base font-medium" data-svelte-h="svelte-11dkxea">Bank Deposit</span></label> <label class="${"flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors " + escape(
    "border-gray-300 hover:border-gray-400",
    true
  )}"><input type="radio" name="payment_method" value="mobile" ${""} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"> <span class="ml-3 text-base font-medium" data-svelte-h="svelte-6js96v">Bkash/Nagad</span></label></div></div>  <input type="hidden" name="shipping_cost"${add_attribute("value", shippingCost, 0)}> <input type="hidden" name="email_newsletter"${add_attribute("value", "false", 0)}> <button type="submit" class="w-full bg-green-600 text-white border-none px-6 py-4 rounded-lg cursor-pointer text-lg font-semibold transition-colors hover:bg-green-700" data-svelte-h="svelte-1rbdyp4">Complete Order</button></form></div>  <div class="lg:col-span-1"><div class="bg-white p-6 rounded-lg border border-gray-200 sticky top-8"><h2 class="text-xl font-semibold mb-4 m-0" data-svelte-h="svelte-1h9dvt6">Order Summary</h2> <div class="space-y-3 mb-4">${each(data.cartItems, (item) => {
    return `<div class="flex justify-between text-sm"><span>${escape(item.product?.name || "Unknown")} × ${escape(item.quantity)}</span> <span>৳${escape(((item.product?.price || 0) * item.quantity).toFixed(2))}</span> </div>`;
  })}</div> <div class="border-t border-gray-200 pt-4 space-y-2"><div class="flex justify-between text-sm"><span data-svelte-h="svelte-3vhy5m">Subtotal</span> <span>৳${escape(data.total.toFixed(2))}</span></div> <div class="flex justify-between text-sm"><span data-svelte-h="svelte-46xjjc">Shipping</span> <span>৳${escape(shippingCost.toFixed(2))}</span></div> <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200"><span data-svelte-h="svelte-2fqrek">Total</span> <span class="text-green-600">৳${escape(totalAmount.toFixed(2))}</span></div></div> <a href="/cart" class="block text-center mt-4 text-blue-600 no-underline hover:underline text-sm" data-svelte-h="svelte-1op86ps">← Back to Cart</a></div></div></div></div>`;
});
export {
  Page as default
};
