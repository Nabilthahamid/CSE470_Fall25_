<!-- VIEW: User profile page -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	export let params = {}; // Accept params but don't use it (may be passed by SvelteKit)
</script>

<svelte:head>
	<title>Profile - MVC SvelteKit App</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8">
	<h1 class="mb-8 text-center text-3xl font-bold">Your Profile</h1>

	<div class="bg-white/5 p-8 rounded-lg">
		<div>
			<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">ID:</strong> {data.user.id}</p>
			<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">Email:</strong> {data.user.email}</p>
			<p class="my-4 py-2 border-b border-white/10"><strong class="inline-block min-w-[100px]">Name:</strong> {data.user.user_metadata?.name || 'Not set'}</p>
		</div>
	</div>
</div>

