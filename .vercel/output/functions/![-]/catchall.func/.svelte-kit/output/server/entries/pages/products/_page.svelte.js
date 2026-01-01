import { c as create_ssr_component, e as escape, b as add_attribute, f as each } from "../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function calculateDiscount(product) {
  const originalPrice = product.price;
  let discountPercent = 0;
  if (product.cost_price && product.cost_price < originalPrice) {
    discountPercent = Math.round((originalPrice - product.cost_price * 1.1) / originalPrice * 100);
    discountPercent = Math.max(5, Math.min(15, discountPercent));
  } else {
    const hash = product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    discountPercent = 5 + hash % 11;
  }
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  return {
    discountPercent,
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100
  };
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { params = {} } = $$props;
  let searchInput = data.searchQuery || "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  {
    {
      if (data.searchQuery !== searchInput) {
        searchInput = data.searchQuery || "";
      }
    }
  }
  return `  ${$$result.head += `<!-- HEAD_svelte-1vv89ot_START -->${$$result.title = `<title>Products - TinyTech</title>`, ""}<!-- HEAD_svelte-1vv89ot_END -->`, ""} <div class="bg-gray-50 min-h-screen py-8"> ${``} <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-12"><h1 class="text-4xl md:text-5xl mb-4 font-bold text-gray-900">${data.category ? `${escape(data.category.display_name)}` : `Our Products`}</h1> <p class="text-gray-600 text-lg">${data.category ? `Products in ${escape(data.category.display_name)} category` : `Discover amazing products at great prices`}</p> ${data.category ? `<div class="mt-4" data-svelte-h="svelte-39mdsw"><a href="/products" class="inline-block text-indigo-600 hover:text-indigo-700 underline text-sm font-medium">← View All Products</a></div>` : ``}</div>  <div class="mb-8"><form class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"><div class="flex-1 relative"><input type="text" placeholder="🔍 Search products by name or description..." class="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-base"${add_attribute("value", searchInput, 0)}> ${searchInput ? `<button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold" aria-label="Clear search" data-svelte-h="svelte-1tel4yo">×</button>` : ``}</div> <button type="submit" class="bg-indigo-600 text-white border-none px-6 py-4 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700 font-semibold" data-svelte-h="svelte-1hqgmzt">Search</button></form> ${data.searchQuery ? `<div class="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold"><span data-svelte-h="svelte-1pe8bl8">🔍</span> <span>Found ${escape(data.products.length)} ${escape(data.products.length === 1 ? "result" : "results")} for &quot;${escape(data.searchQuery)}&quot;</span></div>` : ``}</div>  ${data.success ? `<div class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 shadow-lg"><div class="flex items-center gap-2"><span data-svelte-h="svelte-o8q9lz">✅</span> <span>${escape(data.success)}</span></div></div>` : ``} ${data.error ? `<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 shadow-lg"><div class="flex items-center gap-2"><span data-svelte-h="svelte-1528nq">❌</span> <span>${escape(data.error)}</span></div></div>` : ``}  ${data.products.length === 0 ? `<div class="text-center p-12 bg-white rounded-lg"><div class="text-6xl mb-4" data-svelte-h="svelte-o7z9f5">🔍</div> <h3 class="text-2xl font-bold text-gray-800 mb-2">${escape(data.searchQuery ? "No products found" : "No products available")}</h3> <p class="text-gray-600">${escape(data.searchQuery ? `We couldn't find any products matching "${data.searchQuery}". Try a different search term.` : "Check back soon for new products!")}</p></div>` : `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">${each(data.products, (product) => {
    let discount = calculateDiscount(product);
    return ` <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"> <div class="h-64 relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">${product.image_url ? `<img${add_attribute("src", product.image_url, 0)}${add_attribute("alt", product.name, 0)} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` : `<div class="w-full h-full bg-gray-200 flex items-center justify-center" data-svelte-h="svelte-l14fk4"><span class="text-gray-400 text-sm">No image</span> </div>`}  ${discount.discountPercent > 0 ? `<div class="absolute bottom-3 left-3 z-10"><span class="inline-flex items-center justify-center bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">${escape(discount.discountPercent)}% OFF</span> </div>` : ``}  <div class="absolute top-3 right-3 z-10">${product.stock > 0 ? `<span class="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm" data-svelte-h="svelte-173kcm2"><span class="text-sm">✓</span> <span>In Stock</span> </span>` : `<span class="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm" data-svelte-h="svelte-1k4la7e"><span class="text-sm">✕</span> <span>Out of Stock</span> </span>`} </div></div>  <div class="p-6 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50"><h3 class="m-0 mb-2 text-lg font-bold text-gray-900 line-clamp-2 h-14 group-hover:text-indigo-600 transition-colors">${escape(product.name)}</h3> ${product.brand ? `<p class="text-xs text-indigo-600 font-bold mb-2 uppercase tracking-wide">${escape(product.brand)}</p>` : ``}  <div class="mb-4 flex-shrink-0 pb-4 border-b border-gray-200">${discount.discountPercent > 0 ? `<div class="flex items-baseline gap-2 mb-1"><p class="text-2xl font-extrabold text-gray-900">Tk ${escape(discount.discountedPrice.toFixed(2))}</p> <p class="text-lg font-semibold text-gray-400 line-through">Tk ${escape(discount.originalPrice.toFixed(2))}</p> </div>` : `<p class="text-2xl font-extrabold text-gray-900 mb-1">Tk ${escape(product.price.toFixed(2))} </p>`} ${product.stock > 0 ? `<p class="text-xs text-gray-500 font-medium">${escape(product.stock)} ${escape(product.stock === 1 ? "item" : "items")} available
									</p>` : ``}</div>  <div class="flex flex-col gap-3 mt-auto">${product.stock > 0 ? `<form method="POST" action="/cart/add" class="w-full"><input type="hidden" name="product_id"${add_attribute("value", product.id, 0)}> <input type="hidden" name="quantity" value="1"> <button type="submit" class="w-full bg-white border-2 border-blue-600 text-blue-600 px-4 py-3 rounded-lg cursor-pointer text-sm font-bold hover:bg-blue-50 hover:shadow-md transition-all duration-300" data-svelte-h="svelte-xa0y2o">Add to cart</button> </form>` : `<button disabled class="w-full bg-gray-200 text-gray-500 border-2 border-gray-300 px-4 py-3 rounded-lg cursor-not-allowed text-sm font-semibold" data-svelte-h="svelte-ftj7h8">Out of Stock
									</button>`} <a href="${"/products/" + escape(product.id, true)}" class="w-full flex items-center justify-center px-4 py-2 rounded-lg no-underline text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">View Details →</a> </div></div> </div>`;
  })}</div>`}</div></div>`;
});
export {
  Page as default
};
