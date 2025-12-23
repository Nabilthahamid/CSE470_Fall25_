<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/Navigation.svelte";
	import type { LayoutData } from "./$types";

	/** Global Layout Component
	 * Wraps all pages with navigation and main content area
	 */
	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<Navigation user={data.user} role={data.role} />
<main class="bg-slate-50 min-h-screen">
	{@render children()}
</main>

