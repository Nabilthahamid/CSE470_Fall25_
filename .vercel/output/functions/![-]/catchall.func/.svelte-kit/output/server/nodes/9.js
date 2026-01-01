import * as server from '../entries/pages/admin/inventory/tracking/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/inventory/tracking/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/inventory/tracking/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.Bf_q2Ul2.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CFNrZGOd.js"];
export const stylesheets = [];
export const fonts = [];
