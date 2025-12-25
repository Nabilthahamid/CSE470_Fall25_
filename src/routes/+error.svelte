<!-- VIEW: Error page -->
<script lang="ts">
	import type { ErrorComponent } from './$types';

	export let error: ErrorComponent;
</script>

<svelte:head>
	<title>Error {error.status || 500}</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8 text-center">
	<div class="bg-white/5 p-8 rounded-lg border border-white/10">
		<h1 class="text-4xl font-bold mb-4 text-red-400">Error {error.status || 500}</h1>
		<p class="text-xl mb-6 text-gray-300">{error.message || 'An unexpected error occurred'}</p>
		<a
			href="/"
			class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700"
		>
			Go Home
		</a>
	</div>
</div>

