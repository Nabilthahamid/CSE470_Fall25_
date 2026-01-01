import * as server from '../entries/pages/admin/analytics/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/analytics/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/analytics/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.DFOHm0XG.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CFNrZGOd.js"];
export const stylesheets = [];
export const fonts = [];
