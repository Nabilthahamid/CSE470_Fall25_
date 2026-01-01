import * as server from '../entries/pages/orders/_page.server.ts.js';

export const index = 32;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/orders/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/orders/+page.server.ts";
export const imports = ["_app/immutable/nodes/32.BRZUY-lT.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
