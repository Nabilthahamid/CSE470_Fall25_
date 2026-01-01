<!-- VIEW: Admin dashboard page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import DashboardWidget from '$lib/components/DashboardWidget.svelte';

	export let data: PageData;
	export let params: Record<string, string> = {};

	let aiInsights: any = null;
	let loadingInsights = false;
	let insightsError: string | null = null;
	let dashboardView: 'overview' | 'sales' | 'inventory' = 'overview';
	let isCustomizing = false;
	let widgetVisibility: Record<string, boolean> = {};
	let widgetOrder: string[] = [];

	// Widget IDs
	const widgetIds = [
		'stats_cards',
		'revenue_summary',
		'notifications',
		'admin_controls',
		'quick_actions',
		'ai_insights'
	];

	onMount(async () => {
		loadAIInsights();
		loadDashboardPreferences();
	});

	function loadDashboardPreferences() {
		const savedView = localStorage.getItem('admin_dashboard_view');
		if (savedView) dashboardView = savedView as any;

		const savedVisibility = localStorage.getItem('admin_widget_visibility');
		if (savedVisibility) {
			try {
				widgetVisibility = JSON.parse(savedVisibility);
			} catch (error) {
				widgetVisibility = {};
			}
		} else {
			// Default: all visible
			widgetIds.forEach(id => {
				widgetVisibility[id] = true;
			});
		}

		const savedOrder = localStorage.getItem('admin_widget_order');
		if (savedOrder) {
			try {
				widgetOrder = JSON.parse(savedOrder);
			} catch (error) {
				widgetOrder = widgetIds;
			}
		} else {
			widgetOrder = widgetIds;
		}
	}

	function saveDashboardPreferences() {
		localStorage.setItem('admin_dashboard_view', dashboardView);
		localStorage.setItem('admin_widget_visibility', JSON.stringify(widgetVisibility));
		localStorage.setItem('admin_widget_order', JSON.stringify(widgetOrder));
	}

	function toggleWidget(id: string) {
		widgetVisibility[id] = !widgetVisibility[id];
		saveDashboardPreferences();
	}

	function handleDragStart(e: DragEvent, widgetId: string) {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', widgetId);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(e: DragEvent, targetWidgetId: string) {
		e.preventDefault();
		const draggedWidgetId = e.dataTransfer?.getData('text/plain');
		if (!draggedWidgetId || draggedWidgetId === targetWidgetId) return;

		const draggedIndex = widgetOrder.indexOf(draggedWidgetId);
		const targetIndex = widgetOrder.indexOf(targetWidgetId);

		if (draggedIndex !== -1 && targetIndex !== -1) {
			widgetOrder.splice(draggedIndex, 1);
			widgetOrder.splice(targetIndex, 0, draggedWidgetId);
			saveDashboardPreferences();
		}
	}

	async function loadAIInsights() {
		loadingInsights = true;
		insightsError = null;
		try {
			const response = await fetch('/api/admin/ai-insights');
			if (response.ok) {
				const data = await response.json();
				if (data.error) {
					insightsError = data.error;
				} else {
					aiInsights = data;
				}
			} else {
				const errorData = await response.json().catch(() => ({ error: 'Failed to load AI insights' }));
				insightsError = errorData.error || `Server error: ${response.status}`;
			}
		} catch (error: any) {
			console.error('Error loading AI insights:', error);
			insightsError = error.message || 'Error loading AI insights. Please try again.';
		} finally {
			loadingInsights = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - TinyTech</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Header with View Selector and Customize Button -->
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
		<div>
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
			<p class="text-gray-600 text-lg">
				Welcome, {data.user?.user_metadata?.name || data.user?.email}
			</p>
		</div>
		<div class="flex items-center gap-3">
			<!-- View Selector -->
			<div class="flex bg-gray-100 rounded-lg p-1">
				<button
					on:click={() => {
						dashboardView = 'overview';
						saveDashboardPreferences();
					}}
					class="px-4 py-2 rounded-md text-sm font-medium transition-colors {dashboardView === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
				>
					Overview
				</button>
				<button
					on:click={() => {
						dashboardView = 'sales';
						saveDashboardPreferences();
					}}
					class="px-4 py-2 rounded-md text-sm font-medium transition-colors {dashboardView === 'sales' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
				>
					Sales
				</button>
				<button
					on:click={() => {
						dashboardView = 'inventory';
						saveDashboardPreferences();
					}}
					class="px-4 py-2 rounded-md text-sm font-medium transition-colors {dashboardView === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
				>
					Inventory
				</button>
			</div>
			<!-- Customize Button -->
			<button
				on:click={() => (isCustomizing = !isCustomizing)}
				class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
				</svg>
				{isCustomizing ? 'Done' : 'Customize'}
			</button>
		</div>
	</div>

	<!-- Customization Panel -->
	{#if isCustomizing}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<h3 class="font-semibold text-gray-900 mb-3">Customize Dashboard</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
				{#each widgetIds as widgetId}
					<label class="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
						<input
							type="checkbox"
							checked={widgetVisibility[widgetId] ?? true}
							on:change={() => toggleWidget(widgetId)}
							class="w-4 h-4 text-indigo-600"
						/>
						<span class="text-sm text-gray-700">{widgetId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
					</label>
				{/each}
			</div>
			<p class="text-sm text-gray-600 mt-3">
				💡 Drag widgets to reorder them. Toggle checkboxes to show/hide widgets.
			</p>
		</div>
	{/if}

	<!-- Overview View -->
	{#if dashboardView === 'overview'}
		<!-- Dashboard Statistics Cards -->
		{#if widgetVisibility['stats_cards'] ?? true}
			<div
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
				on:dragover={handleDragOver}
				on:drop={(e) => handleDrop(e, 'stats_cards')}
				role="region"
				aria-label="Dashboard statistics cards"
			>
				<div
					on:dragstart={(e) => handleDragStart(e, 'stats_cards')}
					class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1 {isCustomizing ? 'cursor-move' : ''}"
					role={isCustomizing ? 'button' : undefined}
					tabindex={isCustomizing ? 0 : undefined}
					aria-label={isCustomizing ? 'Drag to reorder widget' : undefined}
				>
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-semibold text-blue-100 uppercase tracking-wide">Today's Revenue</h3>
						<svg class="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<p class="text-3xl font-bold">Tk {data.stats.todayRevenue.toFixed(2)}</p>
					<p class="text-sm text-blue-100 mt-1">{data.stats.todayOrders} orders</p>
				</div>

				<div class="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-semibold text-orange-100 uppercase tracking-wide">Pending Orders</h3>
						<svg class="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
						</svg>
					</div>
					<p class="text-3xl font-bold">{data.stats.pendingOrders}</p>
					<p class="text-sm text-orange-100 mt-1">of {data.stats.totalOrders} total</p>
				</div>

				<div class="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-semibold text-red-100 uppercase tracking-wide">Low Stock</h3>
						<svg class="w-6 h-6 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
						</svg>
					</div>
					<p class="text-3xl font-bold">{data.stats.lowStockCount}</p>
					<p class="text-sm text-red-100 mt-1">{data.stats.outOfStockCount} out of stock</p>
				</div>

				<div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-semibold text-green-100 uppercase tracking-wide">Total Products</h3>
						<svg class="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
						</svg>
					</div>
					<p class="text-3xl font-bold">{data.stats.totalProducts}</p>
					<p class="text-sm text-green-100 mt-1">in inventory</p>
				</div>
			</div>
		{/if}

		<!-- Revenue & Orders Summary -->
		{#if widgetVisibility['revenue_summary'] ?? true}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
				<div class="bg-white p-6 rounded-xl border-2 border-indigo-200 shadow-md hover:shadow-lg transition-all">
					<div class="flex items-center gap-3 mb-4">
						<div class="bg-indigo-100 p-3 rounded-lg">
							<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-bold text-gray-900">This Week</h3>
							<p class="text-sm text-gray-600">Revenue & Orders</p>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex justify-between items-center">
							<span class="text-gray-600">Revenue:</span>
							<span class="text-2xl font-bold text-indigo-600">Tk {data.stats.weekRevenue.toFixed(2)}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-gray-600">Orders:</span>
							<span class="text-xl font-semibold text-gray-900">{data.stats.weekOrders}</span>
						</div>
					</div>
				</div>

				<div class="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all">
					<div class="flex items-center gap-3 mb-4">
						<div class="bg-purple-100 p-3 rounded-lg">
							<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-bold text-gray-900">This Month</h3>
							<p class="text-sm text-gray-600">Revenue & Orders</p>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex justify-between items-center">
							<span class="text-gray-600">Revenue:</span>
							<span class="text-2xl font-bold text-purple-600">Tk {data.stats.monthRevenue.toFixed(2)}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-gray-600">Orders:</span>
							<span class="text-xl font-semibold text-gray-900">{data.stats.monthOrders}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Notifications Section -->
		{#if widgetVisibility['notifications'] ?? true}
			{#if data.unreadCount > 0}
				<div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
					<div class="flex justify-between items-center mb-4">
						<h2 class="m-0 text-xl font-semibold text-gray-900">
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
							<div class="bg-white p-4 rounded border border-gray-200 flex justify-between items-start">
								<div class="flex-1">
									<h3 class="m-0 mb-1 font-semibold text-gray-900">{notification.title}</h3>
									<p class="m-0 text-sm text-gray-600">{notification.message}</p>
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
						<p class="mt-4 text-sm text-gray-600 text-center">
							And {data.notifications.length - 5} more notifications...
						</p>
					{/if}
				</div>
			{/if}
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
			<!-- Admin Controls Panel -->
			{#if widgetVisibility['admin_controls'] ?? true}
				<div class="bg-white p-6 rounded-lg border border-gray-200">
					<h2 class="m-0 mb-4 text-xl font-semibold text-gray-900">Admin Controls</h2>
					<p class="mb-4 text-gray-700">You have administrator privileges.</p>
					<ul class="list-none p-0 m-4 mt-0">
						<li class="py-2 border-b border-gray-200 text-gray-700">
							Role: <strong class="text-gray-900">{data.user?.role}</strong>
						</li>
						<li class="py-2 border-b border-gray-200 text-gray-700">Email: {data.user?.email}</li>
						<li class="py-2 border-b border-gray-200 text-gray-700">User ID: {data.user?.id}</li>
					</ul>
				</div>
			{/if}

			<!-- Quick Actions Panel -->
			{#if widgetVisibility['quick_actions'] ?? true}
				<div class="bg-white p-6 rounded-lg border border-gray-200">
					<h2 class="m-0 mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
					<div class="flex flex-col gap-3 mt-4">
						<a
							href="/admin/products"
							class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700 text-center"
						>
							Manage Products
						</a>
						<a
							href="/admin/orders"
							class="inline-block px-6 py-3 bg-green-600 text-white no-underline rounded-lg transition-colors hover:bg-green-700 text-center"
						>
							Manage Orders
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
							href="/admin/analytics"
							class="inline-block px-6 py-3 bg-purple-600 text-white no-underline rounded-lg transition-colors hover:bg-purple-700 text-center"
						>
							Analytics
						</a>
						<a
							href="/admin/kpi-dashboard"
							class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700 text-center"
						>
							KPI Dashboard
						</a>
						<a
							href="/users"
							class="inline-block px-6 py-3 bg-indigo-600 text-white no-underline rounded-lg transition-colors hover:bg-indigo-700 text-center"
						>
							View Users
						</a>
						<a
							href="/profile"
							class="inline-block px-6 py-3 bg-gray-600 text-white no-underline rounded-lg transition-colors hover:bg-gray-700 text-center"
						>
							View Profile
						</a>
					</div>
				</div>
			{/if}

			<!-- Important Notice Panel -->
			<div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
				<h2 class="m-0 mb-4 text-xl font-semibold text-gray-900">⚠️ Important</h2>
				<p class="text-gray-700">
					Role changes can only be made from the Supabase dashboard. The application cannot modify user roles for security reasons.
				</p>
			</div>
		</div>
	{/if}

	<!-- Sales View -->
	{#if dashboardView === 'sales'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Sales Overview</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="text-center p-6 bg-blue-50 rounded-lg">
					<p class="text-sm text-gray-600 mb-1">Today's Revenue</p>
					<p class="text-3xl font-bold text-blue-600">Tk {data.stats.todayRevenue.toFixed(2)}</p>
				</div>
				<div class="text-center p-6 bg-green-50 rounded-lg">
					<p class="text-sm text-gray-600 mb-1">This Week</p>
					<p class="text-3xl font-bold text-green-600">Tk {data.stats.weekRevenue.toFixed(2)}</p>
				</div>
				<div class="text-center p-6 bg-purple-50 rounded-lg">
					<p class="text-sm text-gray-600 mb-1">This Month</p>
					<p class="text-3xl font-bold text-purple-600">Tk {data.stats.monthRevenue.toFixed(2)}</p>
				</div>
			</div>
			<div class="mt-6 flex gap-3">
				<a href="/admin/sales-report" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
					View Sales Report
				</a>
				<a href="/admin/profit-loss" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
					View Profit/Loss
				</a>
				<a href="/admin/analytics" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
					View Analytics
				</a>
			</div>
		</div>
	{/if}

	<!-- Inventory View -->
	{#if dashboardView === 'inventory'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Inventory Overview</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="text-center p-6 bg-green-50 rounded-lg">
					<p class="text-sm text-gray-600 mb-1">Total Products</p>
					<p class="text-3xl font-bold text-green-600">{data.stats.totalProducts}</p>
				</div>
				<div class="text-center p-6 bg-red-50 rounded-lg">
					<p class="text-sm text-gray-600 mb-1">Low Stock</p>
					<p class="text-3xl font-bold text-red-600">{data.stats.lowStockCount}</p>
				</div>
				<div class="text-center p-6 bg-orange-50 rounded-lg">
					<p class="text-sm text-gray-600 mb-1">Out of Stock</p>
					<p class="text-3xl font-bold text-orange-600">{data.stats.outOfStockCount}</p>
				</div>
			</div>
			<div class="mt-6 flex gap-3">
				<a href="/admin/products" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
					Manage Products
				</a>
				<a href="/admin/inventory/bulk-operations" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
					Bulk Operations
				</a>
				<a href="/admin/inventory/tracking" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
					Inventory Tracking
				</a>
			</div>
		</div>
	{/if}

	<!-- AI Insights Panel -->
	{#if (widgetVisibility['ai_insights'] ?? true) && dashboardView === 'overview'}
		<div class="mt-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-3">
					<div class="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
						<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
						</svg>
					</div>
					<div>
						<h2 class="m-0 text-2xl font-bold text-gray-900">AI Insights Panel</h2>
						<p class="text-sm text-gray-600 mt-0.5">Powered by advanced AI analytics</p>
					</div>
				</div>
				<button
					on:click={loadAIInsights}
					disabled={loadingInsights}
					class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
				>
					{#if loadingInsights}
						<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Refreshing...
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
						</svg>
						Refresh
					{/if}
				</button>
			</div>

			{#if loadingInsights}
				<div class="text-center py-12">
					<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					</div>
					<p class="text-gray-700 font-semibold">Analyzing data with AI...</p>
					<p class="text-sm text-gray-500 mt-2">This may take a few seconds</p>
				</div>
			{:else if insightsError}
				<div class="bg-red-50 text-red-700 p-5 rounded-xl border-2 border-red-200 shadow-sm">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						{insightsError}
					</div>
				</div>
			{:else if aiInsights}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<!-- Enhanced Sales Predictions -->
					<div class="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all hover:border-blue-300 transform hover:-translate-y-1">
						<div class="flex items-center gap-3 mb-4">
							<div class="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-md">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-bold text-gray-900">Enhanced Sales Predictions</h3>
								<p class="text-xs text-gray-500">Statistical forecasting</p>
							</div>
						</div>
						<div class="space-y-3">
							<div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
								<p class="text-3xl font-bold text-indigo-600 mb-1">{aiInsights.salesPrediction?.predictedSales?.toLocaleString() || '0'}</p>
								<p class="text-sm text-gray-600 font-medium">units predicted (30 days)</p>
							</div>
							<div class="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
								<p class="text-2xl font-bold text-gray-900 mb-1">Tk {aiInsights.salesPrediction?.predictedRevenue?.toFixed(2) || '0.00'}</p>
								<p class="text-sm text-gray-600 font-medium">Predicted revenue</p>
							</div>
							{#if aiInsights.salesPrediction?.confidence !== undefined}
								<div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
									<div class="flex items-center justify-between mb-2">
										<span class="text-xs font-semibold text-purple-700">Confidence</span>
										<span class="text-xs font-bold text-purple-900">{Math.round((aiInsights.salesPrediction.confidence || 0) * 100)}%</span>
									</div>
									<div class="w-full bg-purple-200 rounded-full h-2">
										<div class="bg-purple-600 h-2 rounded-full" style="width: {(aiInsights.salesPrediction.confidence || 0) * 100}%"></div>
									</div>
								</div>
							{/if}
							{#if aiInsights.salesPrediction?.scenarios}
								<div class="pt-2 border-t border-gray-200">
									<p class="text-xs font-semibold text-gray-700 mb-2">Scenarios (30 days):</p>
									<div class="grid grid-cols-3 gap-2 text-xs">
										<div class="text-center">
											<p class="font-bold text-green-600">{aiInsights.salesPrediction.scenarios.optimistic.toLocaleString()}</p>
											<p class="text-gray-500">Optimistic</p>
										</div>
										<div class="text-center border-x border-gray-200">
											<p class="font-bold text-blue-600">{aiInsights.salesPrediction.scenarios.realistic.toLocaleString()}</p>
											<p class="text-gray-500">Realistic</p>
										</div>
										<div class="text-center">
											<p class="font-bold text-orange-600">{aiInsights.salesPrediction.scenarios.pessimistic.toLocaleString()}</p>
											<p class="text-gray-500">Pessimistic</p>
										</div>
									</div>
								</div>
							{/if}
							<div class="flex items-center gap-2 pt-2">
								<span class="text-xs px-3 py-1.5 rounded-full font-semibold border {(aiInsights.salesPrediction?.trend === 'increasing') ? 'bg-green-100 text-green-700 border-green-200' : (aiInsights.salesPrediction?.trend === 'decreasing') ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'}">
									{aiInsights.salesPrediction?.trend || 'stable'} trend
								</span>
							</div>
						</div>
					</div>

					<!-- Enhanced Stock Recommendations -->
					<div class="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all hover:border-orange-300 transform hover:-translate-y-1">
						<div class="flex items-center gap-3 mb-4">
							<div class="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-md">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-bold text-gray-900">Stock Recommendations</h3>
								<p class="text-xs text-gray-500">EOQ & reorder points</p>
							</div>
						</div>
						{#if aiInsights.stockRecommendations && aiInsights.stockRecommendations.length > 0}
							<div class="space-y-3 max-h-64 overflow-y-auto">
								{#each aiInsights.stockRecommendations.slice(0, 5) as rec}
									<div class="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md">
										<p class="font-bold text-sm text-gray-900 mb-1">{rec.productName}</p>
										<p class="text-xs text-gray-600 mb-2">{rec.reason}</p>
										<div class="flex items-center gap-2 flex-wrap mb-2">
											<span class="text-xs px-3 py-1 rounded-full font-semibold {rec.urgency === 'high' ? 'bg-red-100 text-red-700 border border-red-200' : rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-green-100 text-green-700 border border-green-200'}">
												{rec.urgency} priority
											</span>
											<span class="text-xs text-gray-600 font-medium">Stock: {rec.currentStock} → Order: {rec.recommendedOrder}</span>
										</div>
										{#if rec.salesVelocity !== undefined}
											<div class="text-xs text-gray-500 space-y-1">
												<p>Sales velocity: {rec.salesVelocity.toFixed(2)} units/day</p>
												{#if rec.estimatedStockoutDate}
													<p>Est. stockout: {new Date(rec.estimatedStockoutDate).toLocaleDateString()}</p>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-4 bg-green-50 rounded-lg border border-green-200">
								<p class="text-sm text-green-700 font-medium">✓ All products have adequate stock levels.</p>
							</div>
						{/if}
					</div>

					<!-- Enhanced Customer Insights -->
					<div class="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all hover:border-purple-300 transform hover:-translate-y-1">
						<div class="flex items-center gap-3 mb-4">
							<div class="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-md">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-bold text-gray-900">Customer Insights</h3>
								<p class="text-xs text-gray-500">RFM Analysis & CLV</p>
							</div>
						</div>
						<div class="space-y-4">
							<div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
								<p class="text-2xl font-bold text-indigo-600 mb-1">Tk {aiInsights.customerInsights?.averageOrderValue?.toFixed(2) || '0.00'}</p>
								<p class="text-sm text-gray-600 font-medium">Average Order Value</p>
							</div>
							{#if aiInsights.customerInsights?.customerLifetimeValue !== undefined}
								<div class="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
									<p class="text-xl font-bold text-gray-900 mb-1">Tk {aiInsights.customerInsights.customerLifetimeValue.toFixed(2)}</p>
									<p class="text-sm text-gray-600 font-medium">Customer Lifetime Value</p>
								</div>
							{/if}
							{#if aiInsights.customerInsights?.segments}
								<div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
									<p class="text-xs font-semibold text-gray-700 mb-2">Customer Segments (RFM):</p>
									<div class="grid grid-cols-2 gap-2 text-xs">
										<div><span class="font-semibold text-green-600">{aiInsights.customerInsights.segments.champions}</span> Champions</div>
										<div><span class="font-semibold text-blue-600">{aiInsights.customerInsights.segments.loyal}</span> Loyal</div>
										<div><span class="font-semibold text-yellow-600">{aiInsights.customerInsights.segments.atRisk}</span> At Risk</div>
										<div><span class="font-semibold text-purple-600">{aiInsights.customerInsights.segments.new}</span> New</div>
										<div class="col-span-2"><span class="font-semibold text-red-600">{aiInsights.customerInsights.segments.lost}</span> Lost</div>
									</div>
								</div>
							{/if}
							{#if aiInsights.customerInsights?.topCustomers && aiInsights.customerInsights.topCustomers.length > 0}
								<div class="mt-4 pt-4 border-t-2 border-gray-200">
									<p class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
										<svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
										</svg>
										Top Customers
									</p>
									<div class="space-y-2">
										{#each aiInsights.customerInsights.topCustomers.slice(0, 3) as customer}
											<div class="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
												<p class="text-sm font-semibold text-gray-900">{customer.userName}</p>
												<p class="text-xs text-purple-600 font-medium">Tk {customer.totalSpent.toFixed(2)} • {customer.orderCount} orders</p>
											</div>
										{/each}
									</div>
								</div>
							{/if}
							{#if aiInsights.customerInsights?.recommendations && aiInsights.customerInsights.recommendations.length > 0}
								<div class="mt-4 pt-4 border-t-2 border-gray-200">
									<p class="text-xs font-semibold text-gray-700 mb-2">Recommendations:</p>
									<ul class="text-xs text-gray-600 space-y-1">
										{#each aiInsights.customerInsights.recommendations.slice(0, 2) as rec}
											<li class="flex items-start gap-2">
												<span class="text-purple-500 mt-0.5">•</span>
												<span>{rec}</span>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
