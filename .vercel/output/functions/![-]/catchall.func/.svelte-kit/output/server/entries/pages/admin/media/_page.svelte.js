import { c as create_ssr_component, e as escape, b as add_attribute, f as each } from "../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/supabase.js";
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
function getMediaUsage(media) {
  return media.usage_count || 0;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { params = {} } = $$props;
  data.type || "all";
  let searchQuery = data.search || "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-17l0oh9_START -->${$$result.title = `<title>Media Library - Admin Dashboard</title>`, ""}<!-- HEAD_svelte-17l0oh9_END -->`, ""} <div class="max-w-7xl mx-auto"><div class="flex justify-between items-center mb-8"><h1 class="text-3xl font-bold text-gray-900" data-svelte-h="svelte-94145l">Media Library</h1> <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700" data-svelte-h="svelte-vvtzww">+ Upload Media</button></div> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">${escape(form.error)}</div>` : ``} ${form?.success ? `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6" data-svelte-h="svelte-1cm0856">Operation successful!</div>` : ``}  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-1edchzr">Total Files</h3> <p class="text-3xl font-bold text-gray-900">${escape(data.stats.totalFiles)}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-hp892h">Total Size</h3> <p class="text-3xl font-bold text-gray-900">${escape(formatFileSize(data.stats.totalSize))}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-d5defi">Images</h3> <p class="text-3xl font-bold text-gray-900">${escape(data.stats.byType.image || 0)}</p></div> <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200"><h3 class="text-sm font-semibold text-gray-600 mb-2" data-svelte-h="svelte-18fhumb">Unused Files</h3> <p class="text-3xl font-bold text-orange-600">${escape(data.stats.unusedCount)}</p></div></div>  ${``}  <div class="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6"><div class="flex flex-wrap items-center gap-4"><div class="flex-1 min-w-[200px]"><input type="text" placeholder="Search media..." class="w-full p-3 border-2 border-gray-300 rounded-lg"${add_attribute("value", searchQuery, 0)}></div> <select class="p-3 border-2 border-gray-300 rounded-lg"><option value="all" data-svelte-h="svelte-7jahaz">All Types</option><option value="image" data-svelte-h="svelte-ejcqbj">Images</option><option value="video" data-svelte-h="svelte-tm9mt7">Videos</option><option value="document" data-svelte-h="svelte-1p86ed1">Documents</option><option value="other" data-svelte-h="svelte-902jce">Other</option></select> <div class="flex gap-2"><button class="${"px-4 py-2 rounded-lg " + escape(
    "bg-indigo-600 text-white",
    true
  )}">Grid</button> <button class="${"px-4 py-2 rounded-lg " + escape(
    "bg-gray-200 text-gray-700",
    true
  )}">List</button></div></div></div>  ${`<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">${data.media.length ? each(data.media, (media) => {
    return `<div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer">${media.file_type === "image" ? `<img${add_attribute("src", media.file_url, 0)}${add_attribute("alt", media.alt_text || media.filename, 0)} class="w-full h-32 object-cover">` : `<div class="w-full h-32 bg-gray-100 flex items-center justify-center" data-svelte-h="svelte-9dtb19"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> </div>`} <div class="p-3"><p class="text-sm font-medium text-gray-900 truncate"${add_attribute("title", media.filename, 0)}>${escape(media.filename)}</p> <p class="text-xs text-gray-500">${escape(formatFileSize(media.file_size))}</p> <p class="text-xs text-gray-500">Used: ${escape(getMediaUsage(media))} times</p></div> </div>`;
  }) : `<div class="col-span-full text-center py-12 text-gray-500" data-svelte-h="svelte-lgbr1d">No media files found. Upload your first file!
				</div>`}</div>`}  ${``}</div>`;
});
export {
  Page as default
};
