<!-- VIEW: Admin Sidebar Navigation Component -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let mobileMenuOpen = false;
	let collapsed = false;

	// Persist sidebar state in localStorage
	onMount(() => {
		// Check localStorage for sidebar state (only on desktop)
		if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
			const savedState = localStorage.getItem('adminSidebarCollapsed');
			if (savedState !== null) {
				collapsed = savedState === 'true';
			}
		}

		// Check screen size for mobile
		const checkMobile = () => {
			if (window.innerWidth < 1024) {
				mobileMenuOpen = false;
				collapsed = false;
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});

	function toggleSidebar() {
		if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
			collapsed = !collapsed;
			localStorage.setItem('adminSidebarCollapsed', collapsed.toString());
			// Dispatch custom event to notify layout
			window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { collapsed } }));
		}
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function isActive(path: string): boolean {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	const menuItems = [
		{
			title: 'Dashboard',
			path: '/admin',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		},
		{
			title: 'Products',
			path: '/admin/products',
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
		},
		{
			title: 'Orders',
			path: '/admin/orders',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
		},
		{
			title: 'Sales Report',
			path: '/admin/sales-report',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
		},
		{
			title: 'Profit/Loss',
			path: '/admin/profit-loss',
			icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		{
			title: 'Analytics',
			path: '/admin/analytics',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
		},
		{
			title: 'KPI Dashboard',
			path: '/admin/kpi-dashboard',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
		},
		{
			title: 'Users',
			path: '/admin/users',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
		},
		{
			title: 'Bulk Operations',
			path: '/admin/inventory/bulk-operations',
			icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
		},
		{
			title: 'Inventory Tracking',
			path: '/admin/inventory/tracking',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
		},
		{
			title: 'Content Management',
			path: '/admin/content',
			icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
		},
		{
			title: 'Media Library',
			path: '/admin/media',
			icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
		},
		{
			title: 'Financial Management',
			path: '/admin/financial',
			icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
		},
		{
			title: 'Returns & Refunds',
			path: '/admin/returns',
			icon: 'M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 14H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z'
		},
		{
			title: 'Shipping Management',
			path: '/admin/shipping',
			icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
		},
		{
			title: 'Discounts & Coupons',
			path: '/admin/marketing/discounts',
			icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		{
			title: 'Promotional Campaigns',
			path: '/admin/marketing/campaigns',
			icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
		},
		{
			title: 'Email Marketing',
			path: '/admin/marketing/email',
			icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
		}
	];
</script>

<!-- Mobile Menu Button -->
<div class="lg:hidden fixed top-4 left-4 z-50">
	<button
		type="button"
		on:click={toggleMobileMenu}
		class="bg-indigo-600 text-white p-3 rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all touch-manipulation"
		aria-label="Toggle menu"
		style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			></path>
		</svg>
	</button>
</div>

<!-- Mobile Overlay -->
{#if mobileMenuOpen}
	<div
		class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
		on:click={toggleMobileMenu}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Enter' && toggleMobileMenu()}
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white z-40 transition-all duration-300 shadow-2xl {collapsed
		? 'w-20'
		: 'w-64'} {mobileMenuOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}"
>
	<!-- Sidebar Header -->
	<div class="flex items-center justify-between p-6 border-b border-gray-700">
		{#if !collapsed}
			<h2 class="text-xl font-bold text-white">Admin Panel</h2>
		{:else}
			<div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
				<span class="text-white font-bold text-sm">A</span>
			</div>
		{/if}
		<button
			type="button"
			on:click={toggleSidebar}
			class="lg:block hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if collapsed}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
					></path>
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7-7 7"
					></path>
				{/if}
			</svg>
		</button>
	</div>

	<!-- Navigation Menu -->
	<nav class="flex-1 overflow-y-auto py-4">
		<ul class="space-y-1 px-3">
			{#each menuItems as item}
				<li>
					<a
						href={item.path}
						class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 touch-manipulation {isActive(
							item.path
						)
							? 'bg-indigo-600 text-white shadow-lg'
							: 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'}"
						title={collapsed ? item.title : ''}
						style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; min-height: 44px;"
					>
						<svg
							class="w-6 h-6 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}
							></path>
						</svg>
						{#if !collapsed}
							<span class="font-medium">{item.title}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Sidebar Footer -->
	<div class="p-4 border-t border-gray-700">
		<a
			href="/"
			class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
			title={collapsed ? 'View Store' : ''}
		>
			<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				></path>
			</svg>
			{#if !collapsed}
				<span class="font-medium">View Store</span>
			{/if}
		</a>
	</div>
</aside>
