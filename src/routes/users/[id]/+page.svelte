<!-- VIEW: User detail page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let params: { id: string }; // Accept params from dynamic route
</script>

<svelte:head>
	<title>{data.user.name} - MVC SvelteKit App</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8">
	<a href="/users" class="inline-block mb-8 text-indigo-400 no-underline hover:underline">← Back to Users</a>

	<div class="bg-white/5 p-8 rounded-lg">
		<h1 class="mb-6 text-3xl font-bold">{data.user.name}</h1>
		<div>
			<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">Email:</strong> {data.user.email}</p>
			<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">ID:</strong> {data.user.id}</p>
			{#if data.user.created_at}
				<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">Created:</strong> {new Date(data.user.created_at).toLocaleString()}</p>
			{/if}
			{#if data.user.updated_at}
				<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">Updated:</strong> {new Date(data.user.updated_at).toLocaleString()}</p>
			{/if}
		</div>
	</div>
</div>

