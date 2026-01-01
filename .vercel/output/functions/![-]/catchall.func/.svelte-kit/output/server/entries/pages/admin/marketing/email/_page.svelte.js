import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from "../../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function getStatusColor(status) {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "scheduled":
      return "bg-yellow-100 text-yellow-800";
    case "sending":
      return "bg-blue-100 text-blue-800";
    case "sent":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  let activeTab = data.activeTab || "newsletters";
  let startDate = data.startDate || "";
  let endDate = data.endDate || "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-1mhiteg_START -->${$$result.title = `<title>Email Marketing - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-1mhiteg_END -->`, ""} <div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8" data-svelte-h="svelte-1j1qtwy">Email Marketing</h1>  <div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6"><div class="flex flex-wrap items-end gap-4"><div><label for="email-start-date" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-8y2yab">Start Date</label> <input id="email-start-date" type="date" class="p-2 border-2 border-gray-300 rounded-lg"${add_attribute("value", startDate, 0)}></div> <div><label for="email-end-date" class="block mb-2 text-sm font-medium" data-svelte-h="svelte-1ulc02p">End Date</label> <input id="email-end-date" type="date" class="p-2 border-2 border-gray-300 rounded-lg"${add_attribute("value", endDate, 0)}></div> <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-ujg2hx">Apply Filter</button> <button class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700" data-svelte-h="svelte-csc8eo">Clear</button></div></div>  <div class="mb-6 border-b border-gray-200"><div class="flex gap-4"><button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    activeTab === "newsletters" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Newsletters</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    activeTab === "sequences" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Email Sequences</button> <button class="${"px-4 py-2 font-semibold border-b-2 transition-colors " + escape(
    activeTab === "analytics" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900",
    true
  )}">Analytics</button></div></div> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">${escape(form.error)}</div>` : ``} ${form?.success ? `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" data-svelte-h="svelte-1cm0856">Operation successful!</div>` : ``}  ${activeTab === "newsletters" ? `<div class="space-y-6"><div class="flex justify-between items-center"><h2 class="text-2xl font-bold text-gray-900" data-svelte-h="svelte-1k63jv9">Newsletters</h2> <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-a3i2dq">+ Create Newsletter</button></div> ${``}  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h3 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-k9olro">All Newsletters</h3> <div class="space-y-4">${data.newsletters.length ? each(data.newsletters, (newsletter) => {
    return `<div class="p-4 border border-gray-200 rounded-lg"><div class="flex items-start justify-between"><div class="flex-1"><h4 class="font-semibold text-gray-900 mb-1">${escape(newsletter.name)}</h4> <p class="text-sm text-gray-600 mb-2">Subject: ${escape(newsletter.subject)}</p> <div class="flex items-center gap-4 text-sm text-gray-500"><span>Recipients: ${escape(newsletter.recipient_type)}</span> <span>Opened: ${escape(newsletter.opened_count)}</span> <span>Clicked: ${escape(newsletter.clicked_count)}</span> ${newsletter.scheduled_at ? `<span>Scheduled: ${escape(new Date(newsletter.scheduled_at).toLocaleString())}</span>` : ``} </div></div> <div class="flex items-center gap-2"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(getStatusColor(newsletter.status), true)}">${escape(newsletter.status)}</span> <form method="POST" action="?/deleteNewsletter" class="inline"><input type="hidden" name="id"${add_attribute("value", newsletter.id, 0)}> <button type="submit" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" data-svelte-h="svelte-7n3cfc">Delete
										</button></form> </div></div> </div>`;
  }) : `<p class="text-gray-500 text-center py-8" data-svelte-h="svelte-kebqpf">No newsletters found. Create your first newsletter!</p>`}</div></div></div>` : ``}  ${activeTab === "sequences" ? `<div class="space-y-6"><div class="flex justify-between items-center"><h2 class="text-2xl font-bold text-gray-900" data-svelte-h="svelte-1anwcwr">Email Sequences</h2> <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-11tmdlc">+ Create Sequence</button></div> ${``}  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h3 class="text-xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-g2wx7i">All Sequences</h3> <div class="space-y-4">${data.sequences.length ? each(data.sequences, (sequence) => {
    return `<div class="p-4 border border-gray-200 rounded-lg"><div class="flex items-start justify-between"><div class="flex-1"><h4 class="font-semibold text-gray-900 mb-1">${escape(sequence.name)}</h4> <p class="text-sm text-gray-600 mb-2">Trigger: ${escape(sequence.trigger.replace("_", " "))}</p> <p class="text-sm text-gray-600">Emails: ${escape(sequence.emails?.length || 0)}</p></div> <div class="flex items-center gap-2"><span class="${"px-2 py-1 text-xs font-semibold rounded-full " + escape(
      sequence.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
      true
    )}">${escape(sequence.is_active ? "Active" : "Inactive")}</span> <form method="POST" action="?/deleteSequence" class="inline"><input type="hidden" name="id"${add_attribute("value", sequence.id, 0)}> <button type="submit" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" data-svelte-h="svelte-1c5m7q2">Delete
										</button></form> </div></div> </div>`;
  }) : `<p class="text-gray-500 text-center py-8" data-svelte-h="svelte-18jfkr3">No sequences found. Create your first sequence!</p>`}</div></div></div>` : ``}  ${activeTab === "analytics" ? `<div class="space-y-6"> <div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-kw2u7c">Total Sent</h3> <p class="text-3xl font-bold text-gray-900">${escape(data.analytics.totalSent)}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-122j1q8">Open Rate</h3> <p class="text-3xl font-bold text-indigo-600">${escape(data.analytics.openRate.toFixed(2))}%</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-vfw1gy">Click Rate</h3> <p class="text-3xl font-bold text-green-600">${escape(data.analytics.clickRate.toFixed(2))}%</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-1qk7yok">Bounce Rate</h3> <p class="text-3xl font-bold text-red-600">${escape(data.analytics.bounceRate.toFixed(2))}%</p></div></div>  <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 class="text-2xl font-bold text-gray-900 mb-4" data-svelte-h="svelte-1aqbuy3">Campaign Performance</h2> <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50" data-svelte-h="svelte-axndzf"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Rate</th> <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Rate</th></tr></thead> <tbody class="divide-y divide-gray-200">${data.analytics.byCampaign.length ? each(data.analytics.byCampaign, (campaign) => {
    return `<tr><td class="px-6 py-4 font-medium text-gray-900">${escape(campaign.campaign)}</td> <td class="px-6 py-4 text-gray-600">${escape(campaign.sent)}</td> <td class="px-6 py-4 text-gray-600">${escape(campaign.opened)}</td> <td class="px-6 py-4 text-gray-600">${escape(campaign.clicked)}</td> <td class="px-6 py-4 text-gray-600">${escape(campaign.openRate.toFixed(2))}%</td> <td class="px-6 py-4 text-gray-600">${escape(campaign.clickRate.toFixed(2))}%</td> </tr>`;
  }) : `<tr data-svelte-h="svelte-1bjd5ru"><td colspan="6" class="px-6 py-8 text-center text-gray-500">No campaign data</td> </tr>`}</tbody></table></div></div></div>` : ``}</div>`;
});
export {
  Page as default
};
