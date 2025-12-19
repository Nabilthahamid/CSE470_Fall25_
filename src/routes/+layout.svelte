<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/Navigation.svelte";
	import type { LayoutData } from "./$types";

	/** Global Layout Component
	 * Wraps all pages with navigation and main content area
	 */
	let { data }: { data: LayoutData } = $props();
</script>

<Navigation user={data.user} role={data.role} />
<main>
	<slot />
</main>

