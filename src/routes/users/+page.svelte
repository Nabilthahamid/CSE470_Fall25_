<!-- VIEW: Users list page -->
<script lang="ts">
	import UserCard from '$lib/components/UserCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export let params = {}; // Accept params but don't use it (may be passed by SvelteKit)
</script>

<svelte:head>
	<title>Users - MVC SvelteKit App</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<h1 class="mb-8 text-center text-3xl font-bold">Users</h1>

	{#if data.error}
		<div class="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center">
			<p>Error: {data.error}</p>
		</div>
	{:else if data.users.length === 0}
		<p class="text-center p-8 text-gray-400">No users found.</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.users as user (user.id)}
				<UserCard {user} />
			{/each}
		</div>
	{/if}
</div>

