<!-- VIEW: Admin Users Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
	export let params: Record<string, string> = {};

	let searchInput = data.searchQuery || '';
	let filterRole = data.filters?.role || 'all';
	let showUserDetails: string | null = null;
	let customerAnalysis: any = null;
	let loadingAnalysis: string | null = null;

	function applyFilters() {
		const params = new URLSearchParams();
		
		if (searchInput.trim()) {
			params.set('search', searchInput.trim());
		}
		if (filterRole !== 'all') {
			params.set('role', filterRole);
		}
		
		const queryString = params.toString();
		goto(`/admin/users${queryString ? '?' + queryString : ''}`);
	}

	function clearFilters() {
		searchInput = '';
		filterRole = 'all';
		goto('/admin/users');
	}

	function toggleUserDetails(userId: string) {
		showUserDetails = showUserDetails === userId ? null : userId;
	}

	function formatDate(dateString: string | null | undefined): string {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatCurrency(amount: number): string {
		return `Tk ${amount.toFixed(2)}`;
	}

	async function analyzeCustomer(userId: string) {
		loadingAnalysis = userId;
		customerAnalysis = null;
		try {
			const response = await fetch('/api/admin/gemini-customer-analysis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId })
			});
			if (response.ok) {
				customerAnalysis = await response.json();
			} else {
				console.error('Failed to analyze customer');
			}
		} catch (error) {
			console.error('Error analyzing customer:', error);
		} finally {
			loadingAnalysis = null;
		}
	}
</script>

<svelte:head>
	<title>User Management - Admin - TinyTech</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900">User Management</h1>
		<div class="text-sm text-gray-600">
			Total Users: <span class="font-semibold text-indigo-600">{data.users.length}</span>
		</div>
	</div>

	{#if data.error}
		<div class="bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg mb-6">
			<p class="font-semibold">Error: {data.error}</p>
		</div>
	{/if}

	<!-- Search & Filter Panel -->
	<div class="bg-white rounded-lg shadow-md p-4 mb-6">
		<div class="flex flex-col md:flex-row gap-4">
			<!-- Search -->
			<div class="flex-1">
				<label for="search" class="block mb-2 font-medium text-sm text-gray-700">Search Users</label>
				<input
					type="text"
					id="search"
					bind:value={searchInput}
					placeholder="Search by email, name, or customer name..."
					class="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							applyFilters();
						}
					}}
				/>
			</div>

			<!-- Role Filter -->
			<div class="md:w-48">
				<label for="roleFilter" class="block mb-2 font-medium text-sm text-gray-700">Role</label>
				<select
					id="roleFilter"
					bind:value={filterRole}
					class="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
				>
					<option value="all">All Roles</option>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<!-- Action Buttons -->
			<div class="flex items-end gap-2">
				<button
					type="button"
					on:click={applyFilters}
					class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700 font-semibold"
				>
					Search
				</button>
				<button
					type="button"
					on:click={clearFilters}
					class="bg-gray-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700 font-semibold"
				>
					Clear
				</button>
			</div>
		</div>
	</div>

	<!-- Users Table -->
	{#if data.users.length === 0}
		<div class="bg-white p-8 rounded-lg shadow-md text-center">
			<p class="text-gray-600 text-lg">No users found matching your criteria.</p>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold">User</th>
							<th class="px-6 py-4 text-left text-sm font-semibold">Contact</th>
							<th class="px-6 py-4 text-left text-sm font-semibold">Role</th>
							<th class="px-6 py-4 text-left text-sm font-semibold">Orders</th>
							<th class="px-6 py-4 text-left text-sm font-semibold">Total Spent</th>
							<th class="px-6 py-4 text-left text-sm font-semibold">Joined</th>
							<th class="px-6 py-4 text-center text-sm font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each data.users as user (user.id)}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div>
										<p class="font-semibold text-gray-900">{user.name || 'N/A'}</p>
										<p class="text-sm text-gray-500">{user.email}</p>
										{#if user.customer_name && user.customer_name !== user.name}
											<p class="text-xs text-gray-400 mt-1">Customer: {user.customer_name}</p>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm">
										{#if user.customer_phone}
											<p class="text-gray-900">{user.customer_phone}</p>
										{:else}
											<p class="text-gray-400">N/A</p>
										{/if}
										{#if user.customer_city}
											<p class="text-gray-500 text-xs mt-1">{user.customer_city}</p>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="px-3 py-1 rounded-full text-xs font-semibold {user.role === 'admin'
										? 'bg-purple-100 text-purple-800'
										: 'bg-blue-100 text-blue-800'}">
										{user.role === 'admin' ? 'Admin' : 'User'}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm">
										<p class="font-semibold text-gray-900">{user.totalOrders || 0}</p>
										{#if user.lastOrderDate}
											<p class="text-xs text-gray-500">Last: {formatDate(user.lastOrderDate)}</p>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4">
									<p class="font-semibold text-indigo-600">{formatCurrency(user.totalSpent || 0)}</p>
								</td>
								<td class="px-6 py-4">
									<p class="text-sm text-gray-600">{formatDate(user.created_at)}</p>
								</td>
								<td class="px-6 py-4 text-center">
									<button
										type="button"
										on:click={() => toggleUserDetails(user.id)}
										class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
									>
										{showUserDetails === user.id ? 'Hide' : 'View'} Details
									</button>
								</td>
							</tr>
							
							<!-- Expanded User Details -->
							{#if showUserDetails === user.id}
								<tr>
									<td colspan="7" class="px-6 py-4 bg-gray-50">
										<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
											<!-- Personal Information -->
											<div>
												<h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
													<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
													</svg>
													Personal Information
												</h3>
												<dl class="space-y-2 text-sm">
													<div>
														<dt class="text-gray-500">User ID:</dt>
														<dd class="text-gray-900 font-mono text-xs">{user.id}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Email:</dt>
														<dd class="text-gray-900">{user.email}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Name:</dt>
														<dd class="text-gray-900">{user.name || 'N/A'}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Account Created:</dt>
														<dd class="text-gray-900">{formatDate(user.created_at)}</dd>
													</div>
													{#if user.updated_at}
														<div>
															<dt class="text-gray-500">Last Updated:</dt>
															<dd class="text-gray-900">{formatDate(user.updated_at)}</dd>
														</div>
													{/if}
												</dl>
											</div>

											<!-- Shipping Information -->
											<div>
												<h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
													<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
													</svg>
													Shipping Address
												</h3>
												<dl class="space-y-2 text-sm">
													<div>
														<dt class="text-gray-500">Customer Name:</dt>
														<dd class="text-gray-900">{user.customer_name || 'N/A'}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Phone:</dt>
														<dd class="text-gray-900">{user.customer_phone || 'N/A'}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Address:</dt>
														<dd class="text-gray-900">{user.customer_address || 'N/A'}</dd>
													</div>
													<div>
														<dt class="text-gray-500">City:</dt>
														<dd class="text-gray-900">{user.customer_city || 'N/A'}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Postal Code:</dt>
														<dd class="text-gray-900">{user.customer_postal_code || 'N/A'}</dd>
													</div>
													<div>
														<dt class="text-gray-500">Country:</dt>
														<dd class="text-gray-900">{user.customer_country || 'N/A'}</dd>
													</div>
												</dl>
											</div>

											<!-- Order Statistics -->
											<div class="md:col-span-2">
												<h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
													<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
													</svg>
													Order Statistics
												</h3>
												<div class="grid grid-cols-3 gap-4">
													<div class="bg-indigo-50 p-4 rounded-lg">
														<p class="text-sm text-gray-600">Total Orders</p>
														<p class="text-2xl font-bold text-indigo-600">{user.totalOrders || 0}</p>
													</div>
													<div class="bg-green-50 p-4 rounded-lg">
														<p class="text-sm text-gray-600">Total Spent</p>
														<p class="text-2xl font-bold text-green-600">{formatCurrency(user.totalSpent || 0)}</p>
													</div>
													<div class="bg-purple-50 p-4 rounded-lg">
														<p class="text-sm text-gray-600">Last Order</p>
														<p class="text-sm font-semibold text-purple-600">
															{user.lastOrderDate ? formatDate(user.lastOrderDate) : 'No orders'}
														</p>
													</div>
												</div>
											</div>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

