import * as server from '../entries/pages/compare/_page.server.ts.js';

export const index = 31;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/compare/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/compare/+page.server.ts";
export const imports = ["_app/immutable/nodes/31.CgKDxG3J.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/CVNeJg5R.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bv0qn4Z6.js","_app/immutable/chunks/N0cYVlAj.js","_app/immutable/chunks/DIdqDoZy.js","_app/immutable/chunks/BlR_y4Yo.js"];
export const stylesheets = [];
export const fonts = [];
