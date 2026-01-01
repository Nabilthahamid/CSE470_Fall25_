import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.CXm7_k18.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js","_app/immutable/chunks/Cy1RiE_f.js","_app/immutable/chunks/BlR_y4Yo.js","_app/immutable/chunks/CVNeJg5R.js"];
export const stylesheets = ["_app/immutable/assets/0.CMihPW0f.css"];
export const fonts = [];
