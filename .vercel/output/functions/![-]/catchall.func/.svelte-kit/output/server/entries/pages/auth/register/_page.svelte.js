import { c as create_ssr_component, e as escape, b as add_attribute } from "../../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { form } = $$props;
  let { params = {} } = $$props;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  if ($$props.params === void 0 && $$bindings.params && params !== void 0) $$bindings.params(params);
  return `  ${$$result.head += `<!-- HEAD_svelte-cqskuk_START -->${$$result.title = `<title>Register - TinyTech</title>`, ""}<!-- HEAD_svelte-cqskuk_END -->`, ""} <div class="flex items-center justify-center min-h-screen p-8 bg-gray-50"><div class="bg-white p-10 rounded-lg border border-gray-200 shadow-sm w-full max-w-md"><h1 class="m-0 mb-2 text-gray-800 text-center text-3xl font-bold" data-svelte-h="svelte-768xyt">Register</h1> <p class="text-center text-gray-600 mb-8" data-svelte-h="svelte-19v28u6">Create a new account</p> ${form?.error ? `<div class="bg-red-50 text-red-700 p-3 rounded-lg mb-4 border border-red-200">${escape(form.error)}</div>` : ``} <form method="POST"><div class="mb-6"><label for="name" class="block mb-2 text-gray-800 font-medium" data-svelte-h="svelte-10mba7z">Name</label> <input type="text" id="name" name="name"${add_attribute("value", form?.name || "", 0)} required autocomplete="name" placeholder="John Doe" minlength="2" class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"></div> <div class="mb-6"><label for="email" class="block mb-2 text-gray-800 font-medium" data-svelte-h="svelte-f63szz">Email</label> <input type="email" id="email" name="email"${add_attribute("value", form?.email || "", 0)} required autocomplete="email" placeholder="your@email.com" class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"></div> <div class="mb-6" data-svelte-h="svelte-6byome"><label for="password" class="block mb-2 text-gray-800 font-medium">Password</label> <input type="password" id="password" name="password" required autocomplete="new-password" placeholder="••••••••" minlength="6" class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"> <small class="block mt-1 text-gray-600 text-sm">Must be at least 6 characters</small></div> <button type="submit" class="w-full p-3 bg-indigo-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-4 hover:bg-indigo-700 active:scale-[0.98]" data-svelte-h="svelte-1dfkl6o">Create Account</button></form> <div class="mt-6 text-center" data-svelte-h="svelte-amz1i5"><p class="text-gray-600">Already have an account? <a href="/auth/login" class="text-indigo-600 no-underline font-medium hover:underline">Login here</a></p></div></div></div>`;
});
export {
  Page as default
};
