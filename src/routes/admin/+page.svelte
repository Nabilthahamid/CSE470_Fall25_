<script lang="ts">
	import { LogOut, Shield, User, Home } from 'lucide-svelte';
	import type { PageData } from './$types';

	/** View (UI) - Admin Dashboard Page
	 * This component uses Svelte 5 syntax
	 */
	let { data }: { data: PageData } = $props();

	// Handle logout - use fetch to submit logout request
	async function handleLogout() {
		try {
			// Submit logout request
			const response = await fetch('/auth?/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				credentials: 'same-origin'
			});
			
			// Redirect to login page after logout
			if (response.redirected) {
				window.location.href = response.url;
			} else {
				window.location.href = '/auth?tab=login';
			}
		} catch (error) {
			// If fetch fails, still redirect to login page
			console.error('Logout error:', error);
			window.location.href = '/auth?tab=login';
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - TinyShop</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Header -->
	<header class="border-b border-slate-200 bg-white">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Shield class="h-6 w-6 text-slate-900" />
					<h1 class="text-xl font-bold text-slate-900">Admin Dashboard</h1>
				</div>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2 text-sm text-slate-600">
						<User class="h-4 w-4" />
						<span>{data.user.email}</span>
					</div>
					<a
						href="/shop"
						class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
						title="Go to main website"
					>
						<Home class="h-4 w-4" />
						<span class="hidden sm:inline">Home</span>
					</a>
					<button
						type="button"
						onclick={handleLogout}
						class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
					>
						<LogOut class="h-4 w-4" />
						Logout
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="rounded-lg bg-white p-8 shadow-lg">
			<div class="mb-6">
				<h2 class="text-2xl font-bold text-slate-900">Welcome, Admin!</h2>
				<p class="mt-2 text-slate-600">You have administrative access to TinyShop.</p>
			</div>

			<!-- Admin Info Card -->
			<div class="rounded-lg border border-slate-200 bg-slate-50 p-6">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Account Information</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-slate-600">Email:</span>
						<span class="font-medium text-slate-900">{data.user.email}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">Role:</span>
						<span class="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
							{data.role?.toUpperCase()}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">User ID:</span>
						<span class="font-mono text-xs text-slate-600">{data.user.id}</span>
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="mt-8">
				<h3 class="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<a
						href="/shop"
						class="rounded-lg border border-slate-200 bg-white p-4 text-center hover:bg-slate-50"
					>
						<div class="font-semibold text-slate-900">View Shop</div>
						<div class="mt-1 text-sm text-slate-600">Browse products</div>
					</a>
					<a
						href="/admin/products"
						class="rounded-lg border border-slate-200 bg-white p-4 text-center hover:bg-slate-50"
					>
						<div class="font-semibold text-slate-900">Manage Products</div>
						<div class="mt-1 text-sm text-slate-600">Add, edit, delete products</div>
					</a>
					<a
						href="/admin/orders"
						class="rounded-lg border border-slate-200 bg-white p-4 text-center hover:bg-slate-50"
					>
						<div class="font-semibold text-slate-900">Manage Orders</div>
						<div class="mt-1 text-sm text-slate-600">View and update all orders</div>
					</a>
					<a
						href="/admin/reports"
						class="rounded-lg border border-slate-200 bg-white p-4 text-center hover:bg-slate-50"
					>
						<div class="font-semibold text-slate-900">Business Reports</div>
						<div class="mt-1 text-sm text-slate-600">Profit/loss analysis</div>
					</a>
				</div>
			</div>
		</div>
	</main>
</div>
