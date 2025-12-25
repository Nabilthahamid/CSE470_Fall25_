<!-- VIEW: Login page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let form: ActionData;
	export let params = {}; // Accept params but don't use it (may be passed by SvelteKit)
</script>

<svelte:head>
	<title>Login - MVC SvelteKit App</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-indigo-500 to-purple-600">
	<div class="bg-white/95 p-10 rounded-xl shadow-2xl w-full max-w-md">
		<h1 class="m-0 mb-2 text-gray-800 text-center text-3xl font-bold">Login</h1>
		<p class="text-center text-gray-600 mb-8">Sign in to your account</p>

		{#if form?.error}
			<div class="bg-red-50 text-red-700 p-3 rounded-lg mb-4 border border-red-200">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="mb-6">
				<label for="email" class="block mb-2 text-gray-800 font-medium">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email || ''}
					required
					autocomplete="email"
					placeholder="your@email.com"
					class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"
				/>
			</div>

			<div class="mb-6">
				<label for="password" class="block mb-2 text-gray-800 font-medium">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					autocomplete="current-password"
					placeholder="••••••••"
					class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"
				/>
			</div>

			<button type="submit" class="w-full p-3 bg-indigo-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-4 hover:bg-indigo-700 active:scale-[0.98]">
				Sign In
			</button>
		</form>

		<div class="mt-6 text-center">
			<p class="text-gray-600">
				Don't have an account? <a href="/auth/register" class="text-indigo-600 no-underline font-medium hover:underline">Register here</a>
			</p>
		</div>
	</div>
</div>

