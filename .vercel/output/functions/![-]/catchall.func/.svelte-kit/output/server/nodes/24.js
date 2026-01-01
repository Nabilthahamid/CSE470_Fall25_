import * as server from '../entries/pages/admin/users/_page.server.ts.js';

export const index = 24;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/users/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/users/+page.server.ts";
export const imports = ["_app/immutable/nodes/24.BoS1eIHt.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
