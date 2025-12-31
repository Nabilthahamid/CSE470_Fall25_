<!-- VIEW: Users list page -->
<script lang="ts">
	import UserCard from '$lib/components/UserCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export const params = {};
</script>

<svelte:head>
	<title>Users - MVC SvelteKit App</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
	<h1 class="mb-8 text-center text-4xl font-bold text-gray-900">Users</h1>

	{#if data.error}
		<div class="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg text-center mb-6">
			<p class="font-semibold">Error: {data.error}</p>
		</div>
	{:else if data.users.length === 0}
		<div class="bg-white p-8 rounded-lg shadow-md text-center">
			<p class="text-gray-600 text-lg">No users found.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.users as user (user.id)}
				<UserCard {user} />
			{/each}
		</div>
	{/if}
</div>

