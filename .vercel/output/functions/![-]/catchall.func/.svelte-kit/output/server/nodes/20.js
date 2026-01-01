import * as server from '../entries/pages/admin/profit-loss/_page.server.ts.js';

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/profit-loss/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/profit-loss/+page.server.ts";
export const imports = ["_app/immutable/nodes/20.BQE9f5Bp.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/D0QH3NT1.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js","_app/immutable/chunks/N0cYVlAj.js","_app/immutable/chunks/DIdqDoZy.js"];
export const stylesheets = [];
export const fonts = [];
