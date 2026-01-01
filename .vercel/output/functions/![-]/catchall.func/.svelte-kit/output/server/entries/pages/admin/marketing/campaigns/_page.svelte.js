import { c as create_ssr_component, e as escape, f as each, b as add_attribute } from "../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function getStatusColor(campaign) {
  if (!campaign.is_active) return "bg-gray-100 text-gray-800";
  const now = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  if (campaign.start_date > now) return "bg-yellow-100 text-yellow-800";
  if (campaign.end_date < now) return "bg-red-100 text-red-800";
  return "bg-green-100 text-green-800";
}
function getStatusText(campaign) {
  if (!campaign.is_active) return "Inactive";
  const now = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  if (campaign.start_date > now) return "Scheduled";
  if (campaign.end_date < now) return "Ended";
  return "Active";
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1ry66bl_START -->${$$result.title = `<title>Promotional Campaigns - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-1ry66bl_END -->`, ""} <div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-16o2ruz">Promotional Campaigns</h1> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">${escape(form.error)}</div>` : ``} ${form?.success ? `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" data-svelte-h="svelte-1cm0856">Operation successful!</div>` : ``} <div class="flex justify-between items-center mb-6"><p class="text-gray-600" data-svelte-h="svelte-1em6wsd">Manage flash sales, limited-time offers, and promotional campaigns</p> <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-wahj8f">+ Create Campaign</button></div> ${``}  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-s0bj4l">All Campaigns</h2> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${data.campaigns.length ? each(data.campaigns, (campaign) => {
    return `<div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">${campaign.image_url ? `<img${add_attribute("src", campaign.image_url, 0)}${add_attribute("alt", campaign.name, 0)} class="w-full h-32 object-cover rounded mb-3">` : ``} <h3 class="text-lg font-bold text-gray-900 mb-2">${escape(campaign.name)}</h3> <p class="text-sm text-gray-600 mb-3">${escape(campaign.description || "No description")}</p> <div class="space-y-1 mb-3 text-sm"><p class="text-gray-600"><strong data-svelte-h="svelte-1y9dw9w">Type:</strong> <span class="capitalize">${escape(campaign.campaign_type.replace("_", " "))}</span></p> <p class="text-gray-600"><strong data-svelte-h="svelte-1scx3na">Start:</strong> ${escape(new Date(campaign.start_date).toLocaleString())}</p> <p class="text-gray-600"><strong data-svelte-h="svelte-5fohs9">End:</strong> ${escape(new Date(campaign.end_date).toLocaleString())}</p></div> <div class="flex items-center justify-between"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(getStatusColor(campaign), true)}">${escape(getStatusText(campaign))}</span> <div class="flex gap-2"><button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" data-svelte-h="svelte-aau80e">Edit</button> <form method="POST" action="?/delete" class="inline"><input type="hidden" name="id"${add_attribute("value", campaign.id, 0)}> <button type="submit" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" data-svelte-h="svelte-xfr7jj">Delete
								</button></form> </div></div> </div>`;
  }) : `<div class="col-span-full text-center py-12 text-gray-500" data-svelte-h="svelte-wod7ke">No campaigns found. Create your first campaign!
				</div>`}</div></div></div>`;
});
export {
  Page as default
};
