<script lang="ts">
	import { CheckCircle, LogIn, Home } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let countdown = $state(3);

	// Auto-redirect to login page after 3 seconds
	onMount(() => {
		// Countdown timer
		const countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownInterval);
			}
		}, 1000);

		// Redirect timer
		const redirectTimer = setTimeout(() => {
			goto('/auth?tab=login');
		}, 3000);

		return () => {
			clearTimeout(redirectTimer);
			clearInterval(countdownInterval);
		};
	});
</script>

<svelte:head>
	<title>Logged Out Successfully - TinyShop</title>
	<meta name="description" content="You have been successfully logged out" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 shadow-xl text-center">
			<!-- Success Icon -->
			<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
				<CheckCircle class="h-10 w-10 text-green-600" />
			</div>

			<!-- Success Message -->
			<h1 class="mb-4 text-2xl font-bold text-slate-900">Logged Out Successfully</h1>
			<p class="mb-8 text-slate-600">
				You have been successfully logged out of your account. You will be redirected to the login page in a few seconds.
			</p>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
				<a
					href="/auth?tab=login"
					class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
				>
					<LogIn class="h-5 w-5" />
					Go to Login
				</a>
				<a
					href="/"
					class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
				>
					<Home class="h-5 w-5" />
					Go to Home
				</a>
			</div>

			<!-- Redirect Countdown -->
			<p class="mt-6 text-sm text-slate-500">
				Redirecting to login page in <span class="font-semibold text-slate-700">{countdown}</span> {countdown === 1 ? 'second' : 'seconds'}...
			</p>
		</div>
	</div>
</div>
