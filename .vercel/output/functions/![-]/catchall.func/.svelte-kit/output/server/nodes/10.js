import * as server from '../entries/pages/admin/kpi-dashboard/_page.server.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/kpi-dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/kpi-dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/10.BJD57x-_.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CFNrZGOd.js"];
export const stylesheets = [];
export const fonts = [];
