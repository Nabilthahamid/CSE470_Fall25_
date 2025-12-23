<script lang="ts">
	import { enhance } from '$app/forms';
	import { LogIn, UserPlus, Mail, Lock } from 'lucide-svelte';
	import type { PageData } from './$types';

	/** View (UI) - Authentication Page with Login and Register tabs
	 * This component uses Svelte 5 syntax
	 */
	let { data, form }: { data: PageData; form: any } = $props();

	// Compute initial tab from data prop
	let initialTab = $derived(
		(data.initialTab === 'login' || data.initialTab === 'register') 
			? data.initialTab 
			: 'login'
	);
	let activeTab: 'login' | 'register' = $state(initialTab);
	let isLoading = $state(false);
	
	// Use derived for error message and type to react to form/data changes
	let computedErrorMessage = $derived(
		form?.error || (data.loggedOut ? 'You have been successfully logged out.' : '')
	);
	let computedErrorType = $derived(form?.type || '');
	
	// Local state for error message (can be cleared by user actions)
	let errorMessage = $state(computedErrorMessage);
	let errorType = $state(computedErrorType);
	
	// Update error message when form/data changes
	$effect(() => {
		errorMessage = computedErrorMessage;
		errorType = computedErrorType;
	});

	function handleSubmit() {
		isLoading = true;
		errorMessage = '';
	}
</script>

<svelte:head>
	<title>Login / Register - TinyShop</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
	<div class="w-full max-w-md">
		<!-- Card Container -->
		<div class="rounded-lg bg-white shadow-xl">
			<!-- Header -->
			<div class="border-b border-slate-200 px-6 py-4">
				<h1 class="text-2xl font-bold text-slate-900">TinyShop</h1>
				<p class="text-sm text-slate-600">Welcome back! Please sign in to your account.</p>
			</div>

			<!-- Tabs -->
			<div class="flex border-b border-slate-200">
				<button
					type="button"
					class="flex-1 px-6 py-4 text-center font-medium transition-colors"
					class:bg-slate-50={activeTab === 'login'}
					class:text-slate-900={activeTab === 'login'}
					class:text-slate-600={activeTab !== 'login'}
					onclick={() => {
						activeTab = 'login';
						errorMessage = '';
					}}
				>
					<LogIn class="mr-2 inline h-4 w-4" />
					Login
				</button>
				<button
					type="button"
					class="flex-1 px-6 py-4 text-center font-medium transition-colors"
					class:bg-slate-50={activeTab === 'register'}
					class:text-slate-900={activeTab === 'register'}
					class:text-slate-600={activeTab !== 'register'}
					onclick={() => {
						activeTab = 'register';
						errorMessage = '';
					}}
				>
					<UserPlus class="mr-2 inline h-4 w-4" />
					Register
				</button>
			</div>

			<!-- Error Message -->
			{@const isLoggedOut = $derived(data.loggedOut)}
			{@const isSuccess = $derived(form?.success || isLoggedOut)}
			{#if errorMessage && (activeTab === errorType || !errorType || isLoggedOut)}
				<div
					class="mx-6 mt-4 rounded-lg border p-3"
					class:bg-red-50={!isSuccess}
					class:border-red-200={!isSuccess}
					class:bg-green-50={isSuccess}
					class:border-green-200={isSuccess}
				>
					<p
						class="text-sm"
						class:text-red-800={!isSuccess}
						class:text-green-800={isSuccess}
					>
						{errorMessage}
					</p>
				</div>
			{/if}

			<!-- Login Form -->
			{#if activeTab === 'login'}
				<form
					method="POST"
					action="?/login"
					use:enhance={() => {
						handleSubmit();
						return async ({ update }) => {
							await update();
							isLoading = false;
						};
					}}
					class="p-6 space-y-4"
				>
					<div>
						<label for="login-email" class="mb-2 block text-sm font-medium text-slate-700">
							Email
						</label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
							<input
								id="login-email"
								type="email"
								name="email"
								required
								placeholder="you@example.com"
								class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
						</div>
					</div>

					<div>
						<label
							for="login-password"
							class="mb-2 block text-sm font-medium text-slate-700"
						>
							Password
						</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
							<input
								id="login-password"
								type="password"
								name="password"
								required
								placeholder="••••••••"
								class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			{/if}

			<!-- Register Form -->
			{#if activeTab === 'register'}
				<form
					method="POST"
					action="?/register"
					use:enhance={() => {
						handleSubmit();
						return async ({ update }) => {
							await update();
							isLoading = false;
						};
					}}
					class="p-6 space-y-4"
				>
					<div>
						<label
							for="register-email"
							class="mb-2 block text-sm font-medium text-slate-700"
						>
							Email
						</label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
							<input
								id="register-email"
								type="email"
								name="email"
								required
								placeholder="you@example.com"
								class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
						</div>
					</div>

					<div>
						<label
							for="register-password"
							class="mb-2 block text-sm font-medium text-slate-700"
						>
							Password
						</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
							<input
								id="register-password"
								type="password"
								name="password"
								required
								minlength="6"
								placeholder="••••••••"
								class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
						</div>
					</div>

					<div>
						<label
							for="register-confirm-password"
							class="mb-2 block text-sm font-medium text-slate-700"
						>
							Confirm Password
						</label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
							<input
								id="register-confirm-password"
								type="password"
								name="confirmPassword"
								required
								minlength="6"
								placeholder="••••••••"
								class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						class="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? 'Creating account...' : 'Create Account'}
					</button>
				</form>
			{/if}
		</div>

		<!-- Footer Link -->
		<div class="mt-6 text-center">
			<a href="/shop" class="text-sm text-slate-600 hover:text-slate-900">
				Continue shopping without an account →
			</a>
		</div>
	</div>
</div>
