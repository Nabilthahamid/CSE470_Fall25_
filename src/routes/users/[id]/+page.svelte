<!-- VIEW: User detail page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.user.name} - MVC SvelteKit App</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen">
	<a href="/users" class="inline-block mb-8 text-indigo-600 no-underline hover:underline font-medium">← Back to Users</a>

	<div class="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
		<h1 class="mb-6 text-4xl font-bold text-gray-900">{data.user.name}</h1>
		<div class="space-y-4">
			<div class="py-3 border-b border-gray-200">
				<strong class="inline-block min-w-[120px] text-gray-700 font-semibold">Email:</strong>
				<span class="text-gray-900 text-lg">{data.user.email}</span>
			</div>
			<div class="py-3 border-b border-gray-200">
				<strong class="inline-block min-w-[120px] text-gray-700 font-semibold">ID:</strong>
				<span class="text-gray-600 text-sm font-mono">{data.user.id}</span>
			</div>
			{#if data.user.created_at}
				<div class="py-3 border-b border-gray-200">
					<strong class="inline-block min-w-[120px] text-gray-700 font-semibold">Created:</strong>
					<span class="text-gray-900">{new Date(data.user.created_at).toLocaleString()}</span>
				</div>
			{/if}
			{#if data.user.updated_at}
				<div class="py-3 border-b border-gray-200">
					<strong class="inline-block min-w-[120px] text-gray-700 font-semibold">Updated:</strong>
					<span class="text-gray-900">{new Date(data.user.updated_at).toLocaleString()}</span>
				</div>
			{/if}
		</div>
	</div>
</div>

