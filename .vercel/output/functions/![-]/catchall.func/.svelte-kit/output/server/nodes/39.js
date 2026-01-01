import * as server from '../entries/pages/users/_id_/_page.server.ts.js';

export const index = 39;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/users/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/users/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/39.DSdkoxu_.js","_app/immutable/chunks/SRO8nAOF.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = [];
export const fonts = [];
