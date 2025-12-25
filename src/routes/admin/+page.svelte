<!-- VIEW: Admin dashboard page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	export let params = {}; // Accept params but don't use it (may be passed by SvelteKit)
</script>

<svelte:head>
	<title>Admin Dashboard - MVC SvelteKit App</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<h1 class="mb-4 text-center text-3xl font-bold">Admin Dashboard</h1>
	<p class="text-center text-gray-400 mb-8 text-lg">Welcome, {data.user?.user_metadata?.name || data.user?.email}</p>

	<!-- Notifications Section -->
	{#if data.unreadCount > 0}
		<div class="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/30 mb-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="m-0 text-xl font-semibold">
					🔔 Notifications ({data.unreadCount} unread)
				</h2>
				<form method="POST" action="?/markAllRead" use:enhance>
					<button
						type="submit"
						class="bg-yellow-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-yellow-700"
					>
						Mark All Read
					</button>
				</form>
			</div>
			<div class="space-y-3">
				{#each data.notifications.slice(0, 5) as notification (notification.id)}
					<div
						class="bg-white/5 p-4 rounded border border-white/10 flex justify-between items-start"
					>
						<div class="flex-1">
							<h3 class="m-0 mb-1 font-semibold">{notification.title}</h3>
							<p class="m-0 text-sm text-gray-400">{notification.message}</p>
							{#if notification.product_name}
								<p class="mt-2 text-xs text-gray-500">
									Product: {notification.product_name}
								</p>
							{/if}
							<p class="mt-1 text-xs text-gray-500">
								{new Date(notification.created_at || '').toLocaleString()}
							</p>
						</div>
						<form method="POST" action="?/markNotificationRead" use:enhance class="ml-4">
							<input type="hidden" name="id" value={notification.id} />
							<button
								type="submit"
								class="bg-gray-600 text-white border-none px-3 py-1 rounded cursor-pointer text-xs transition-colors hover:bg-gray-700"
							>
								Mark Read
							</button>
						</form>
					</div>
				{/each}
			</div>
			{#if data.notifications.length > 5}
				<p class="mt-4 text-sm text-gray-400 text-center">
					And {data.notifications.length - 5} more notifications...
				</p>
			{/if}
		</div>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
		<div class="bg-white/5 p-6 rounded-lg border border-white/10">
			<h2 class="m-0 mb-4 text-xl font-semibold">Admin Controls</h2>
			<p class="mb-4">You have administrator privileges.</p>
			<ul class="list-none p-0 m-4 mt-0">
				<li class="py-2 border-b border-white/10">Role: <strong>{data.user?.role}</strong></li>
				<li class="py-2 border-b border-white/10">Email: {data.user?.email}</li>
				<li class="py-2 border-b border-white/10">User ID: {data.user?.id}</li>
			</ul>
		</div>

		<div class="bg-white/5 p-6 rounded-lg border border-white/10">
			<h2 class="m-0 mb-4 text-xl font-semibold">Quick Actions</h2>
			<div class="flex flex-col gap-3 mt-4">
				<a
					href="/admin/products"
					class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700 text-center"
				>
					Manage Products
				</a>
				<a
					href="/admin/profit-loss"
					class="inline-block px-6 py-3 bg-green-600 text-white no-underline rounded-lg transition-colors hover:bg-green-700 text-center"
				>
					Profit/Loss Report
				</a>
				<a
					href="/admin/sales-report"
					class="inline-block px-6 py-3 bg-blue-600 text-white no-underline rounded-lg transition-colors hover:bg-blue-700 text-center"
				>
					Sales Report
				</a>
				<a
					href="/users"
					class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700 text-center"
				>
					Manage Users
				</a>
				<a
					href="/profile"
					class="inline-block px-6 py-3 bg-gray-600 text-white no-underline rounded-lg transition-colors hover:bg-gray-700 text-center"
				>
					View Profile
				</a>
			</div>
		</div>

		<div class="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/30">
			<h2 class="m-0 mb-4 text-xl font-semibold">⚠️ Important</h2>
			<p>Role changes can only be made from the Supabase dashboard. The application cannot modify user roles for security reasons.</p>
		</div>
	</div>
</div>

