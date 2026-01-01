import * as server from '../entries/pages/admin/marketing/discounts/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/marketing/discounts/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/marketing/discounts/+page.server.ts";
export const imports = ["_app/immutable/nodes/12.Cthf9MQl.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
