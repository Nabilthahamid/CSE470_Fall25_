<!-- VIEW: Root layout component -->
<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { getComparisonCount } from '$lib/utils/comparison';
	import AIChatbot from '$lib/components/AIChatbot.svelte';

	export let data: LayoutData;
	// @ts-ignore - SvelteKit may pass params even without dynamic segments
	export let params: Record<string, string> = {};
	
	// Check if we're on an admin page
	$: isAdminPage = $page.url.pathname.startsWith('/admin');
	$: homeLink = isAdminPage ? '/admin' : '/';
	
	let comparisonCount = 0;

	onMount(() => {
		updateComparisonCount();
		// Update count when storage changes
		const interval = setInterval(updateComparisonCount, 1000);
		return () => clearInterval(interval);
	});

	function updateComparisonCount() {
		comparisonCount = getComparisonCount();
	}
</script>

<nav class="bg-gray-900 py-4 border-b border-gray-800">
	<div class="max-w-7xl mx-auto px-8 flex justify-between items-center gap-4">
		<a href={homeLink} class="text-2xl font-bold text-white no-underline">TinyTech</a>

		<div class="flex gap-6 items-center">
			{#if isAdminPage}
				<!-- Admin pages: Only show logout -->
				<form method="POST" action="/auth/logout" use:enhance class="inline">
					<button type="submit" class="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-red-700">
						Logout
					</button>
				</form>
			{:else if data.user}
				<!-- Regular pages with logged in user: Show normal navigation -->
				<span class="text-gray-400 text-sm">Welcome, {data.user.user_metadata?.name || data.user.email}</span>
				<a href="/" class="text-white no-underline transition-colors hover:text-indigo-400">Home</a>
				<a href="/products" class="text-white no-underline transition-colors hover:text-indigo-400">Products</a>
				<a href="/pc-builder" class="text-white no-underline transition-colors hover:text-indigo-400">PC Builder</a>
				<a href="/cart" class="text-white no-underline transition-colors hover:text-indigo-400">Cart</a>
				<a href="/orders" class="text-white no-underline transition-colors hover:text-indigo-400">Orders</a>
				<a href="/compare" class="relative text-white no-underline transition-colors hover:text-indigo-400">
					Compare
					{#if comparisonCount > 0}
						<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
							{comparisonCount}
						</span>
					{/if}
				</a>
				<a href="/faq" class="text-white no-underline transition-colors hover:text-indigo-400">FAQ</a>
				<a href="/profile" class="text-white no-underline transition-colors hover:text-indigo-400">Profile</a>
				<form method="POST" action="/auth/logout" use:enhance class="inline">
					<button type="submit" class="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-red-700">
						Logout
					</button>
				</form>
			{:else}
				<!-- Not logged in: Show login/register -->
				<a href="/" class="text-white no-underline transition-colors hover:text-indigo-400">Home</a>
				<a href="/products" class="text-white no-underline transition-colors hover:text-indigo-400">Products</a>
				<a href="/pc-builder" class="text-white no-underline transition-colors hover:text-indigo-400">PC Builder</a>
				<a href="/cart" class="text-white no-underline transition-colors hover:text-indigo-400">Cart</a>
				<a href="/compare" class="relative text-white no-underline transition-colors hover:text-indigo-400">
					Compare
					{#if comparisonCount > 0}
						<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
							{comparisonCount}
						</span>
					{/if}
				</a>
				<a href="/faq" class="text-white no-underline transition-colors hover:text-indigo-400">FAQ</a>
				<a href="/auth/login" class="text-white no-underline transition-colors hover:text-indigo-400">Login</a>
				<a href="/auth/register" class="text-white no-underline transition-colors hover:text-indigo-400">Register</a>
			{/if}
		</div>
	</div>
</nav>

<main class="w-full min-h-screen">
	<slot />
</main>

<!-- AI Chatbot - Show on all pages except admin -->
{#if !isAdminPage}
	<AIChatbot userId={data.user?.id || null} />
{/if}
