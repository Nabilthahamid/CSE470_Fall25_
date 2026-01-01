import * as server from '../entries/pages/admin/returns/_page.server.ts.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/returns/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/returns/+page.server.ts";
export const imports = ["_app/immutable/nodes/21.LxFGo71v.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
