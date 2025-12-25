<!-- VIEW: Root layout component -->
<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	export let params = {}; // Accept params but don't use it (may be passed by SvelteKit)

	let searchInput = '';

	function handleSearch() {
		if (searchInput.trim()) {
			goto(`/products?search=${encodeURIComponent(searchInput.trim())}`);
		} else {
			goto('/products');
		}
		searchInput = '';
	}
</script>

<nav class="bg-gray-900 py-4 border-b border-gray-800">
	<div class="max-w-7xl mx-auto px-8 flex justify-between items-center gap-4">
		<a href="/" class="text-2xl font-bold text-white no-underline">MVC App</a>
		
		<!-- Search Bar -->
		<div class="flex-1 max-w-md">
			<form on:submit|preventDefault={handleSearch} class="flex gap-2">
				<input
					type="text"
					bind:value={searchInput}
					placeholder="Search products..."
					class="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
				/>
				<button
					type="submit"
					class="bg-indigo-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-indigo-700"
				>
					Search
				</button>
			</form>
		</div>

		<div class="flex gap-6 items-center">
			{#if data.user}
				<span class="text-gray-400 text-sm">Welcome, {data.user.user_metadata?.name || data.user.email}</span>
				<a href="/" class="text-white no-underline transition-colors hover:text-indigo-400">Home</a>
				<a href="/cart" class="text-white no-underline transition-colors hover:text-indigo-400">Cart</a>
				<a href="/profile" class="text-white no-underline transition-colors hover:text-indigo-400">Profile</a>
				<form method="POST" action="/auth/logout" use:enhance class="inline">
					<button type="submit" class="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-red-700">
						Logout
					</button>
				</form>
			{:else}
				<a href="/" class="text-white no-underline transition-colors hover:text-indigo-400">Home</a>
				<a href="/cart" class="text-white no-underline transition-colors hover:text-indigo-400">Cart</a>
				<a href="/auth/login" class="text-white no-underline transition-colors hover:text-indigo-400">Login</a>
				<a href="/auth/register" class="text-white no-underline transition-colors hover:text-indigo-400">Register</a>
			{/if}
		</div>
	</div>
</nav>

<main class="w-full min-h-screen">
	<slot />
</main>


