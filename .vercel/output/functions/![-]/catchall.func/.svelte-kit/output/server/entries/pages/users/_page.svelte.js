import { c as create_ssr_component, e as escape, f as each, v as validate_component } from "../../../chunks/ssr.js";
const UserCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0) $$bindings.user(user);
  return `  <a href="${"/users/" + escape(user.id, true)}" class="block p-6 border-2 border-gray-300 rounded-lg bg-white shadow-md no-underline text-inherit transition-all hover:bg-gray-50 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-xl"><h3 class="m-0 mb-3 text-gray-900 text-xl font-bold">${escape(user.name)}</h3> <p class="text-gray-700 my-2 text-base font-medium">${escape(user.email)}</p> ${user.created_at ? `<p class="text-sm text-gray-600 mt-3 mb-0 pt-3 border-t border-gray-200"><span class="font-semibold" data-svelte-h="svelte-1o3sqa7">Joined:</span> ${escape(new Date(user.created_at).toLocaleDateString())}</p>` : ``}</a>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { params = {} } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-20b3db_START -->${$$result.title = `<title>Users - TinyTech</title>`, ""}<!-- HEAD_svelte-20b3db_END -->`, ""} <div class="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen"><h1 class="mb-8 text-center text-4xl font-bold text-gray-900" data-svelte-h="svelte-1ehg0is">Users</h1> ${data.error ? `<div class="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg text-center mb-6"><p class="font-semibold">Error: ${escape(data.error)}</p></div>` : `${data.users.length === 0 ? `<div class="bg-white p-8 rounded-lg shadow-md text-center" data-svelte-h="svelte-1aew13c"><p class="text-gray-600 text-lg">No users found.</p></div>` : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${each(data.users, (user) => {
    return `${validate_component(UserCard, "UserCard").$$render($$result, { user }, {}, {})}`;
  })}</div>`}`}</div>`;
});
export {
  Page as default
};
