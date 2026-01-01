import * as server from '../entries/pages/auth/logout/_page.server.ts.js';

export const index = 26;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/auth/logout/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/auth/logout/+page.server.ts";
export const imports = ["_app/immutable/nodes/26.Ckzh1Lf4.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
