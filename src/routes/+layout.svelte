<!-- VIEW: Root layout component -->
<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	
	// Check if we're on an admin page
	$: isAdminPage = $page.url.pathname.startsWith('/admin');
</script>

<nav class="bg-gray-900 py-4 border-b border-gray-800">
	<div class="max-w-7xl mx-auto px-8 flex justify-between items-center gap-4">
		<a href="/" class="text-2xl font-bold text-white no-underline">MVC App</a>

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
				<a href="/cart" class="text-white no-underline transition-colors hover:text-indigo-400">Cart</a>
				<a href="/profile" class="text-white no-underline transition-colors hover:text-indigo-400">Profile</a>
				<form method="POST" action="/auth/logout" use:enhance class="inline">
					<button type="submit" class="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-red-700">
						Logout
					</button>
				</form>
			{:else}
				<!-- Not logged in: Show login/register -->
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


