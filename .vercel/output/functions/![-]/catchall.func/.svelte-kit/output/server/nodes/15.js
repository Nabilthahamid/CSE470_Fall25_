import * as server from '../entries/pages/admin/orders/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/orders/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/orders/+page.server.ts";
export const imports = ["_app/immutable/nodes/15._ehKVgz4.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
