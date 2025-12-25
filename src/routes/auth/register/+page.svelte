<!-- VIEW: Register page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Register - MVC SvelteKit App</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen p-8 bg-gray-50">
	<div class="bg-white p-10 rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
		<h1 class="m-0 mb-2 text-gray-800 text-center text-3xl font-bold">Register</h1>
		<p class="text-center text-gray-600 mb-8">Create a new account</p>

		{#if form?.error}
			<div class="bg-red-50 text-red-700 p-3 rounded-lg mb-4 border border-red-200">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="mb-6">
				<label for="name" class="block mb-2 text-gray-800 font-medium">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					value={form?.name || ''}
					required
					autocomplete="name"
					placeholder="John Doe"
					minlength="2"
					class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"
				/>
			</div>

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
					autocomplete="new-password"
					placeholder="••••••••"
					minlength="6"
					class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 box-border"
				/>
				<small class="block mt-1 text-gray-600 text-sm">Must be at least 6 characters</small>
			</div>

			<button type="submit" class="w-full p-3 bg-indigo-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-4 hover:bg-indigo-700 active:scale-[0.98]">
				Create Account
			</button>
		</form>

		<div class="mt-6 text-center">
			<p class="text-gray-600">
				Already have an account? <a href="/auth/login" class="text-indigo-600 no-underline font-medium hover:underline">Login here</a>
			</p>
		</div>
	</div>
</div>

