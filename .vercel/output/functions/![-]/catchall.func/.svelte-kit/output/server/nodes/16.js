import * as server from '../entries/pages/admin/products/_page.server.ts.js';

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/products/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/products/+page.server.ts";
export const imports = ["_app/immutable/nodes/16.Q2q8F1aK.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
