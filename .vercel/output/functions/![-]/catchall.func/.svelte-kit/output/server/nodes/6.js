import * as server from '../entries/pages/admin/content/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/content/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/content/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.BrwbLWGI.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js","_app/immutable/chunks/D6OxuRK_.js","_app/immutable/chunks/DIdqDoZy.js"];
export const stylesheets = [];
export const fonts = [];
