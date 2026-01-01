import * as server from '../entries/pages/profile/_page.server.ts.js';

export const index = 37;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/profile/+page.server.ts";
export const imports = ["_app/immutable/nodes/37.BFHfubOA.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CkhL24sa.js","_app/immutable/chunks/Bv0qn4Z6.js"];
export const stylesheets = [];
export const fonts = [];
