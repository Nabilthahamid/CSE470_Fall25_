<!-- VIEW: Admin Layout with Sidebar -->
<script lang="ts">
	import AdminSidebar from '$lib/components/AdminSidebar.svelte';
	import QuickActionsPanel from '$lib/components/QuickActionsPanel.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	// @ts-ignore - SvelteKit may pass params even without dynamic segments
	export let params: Record<string, string> = {};

	let sidebarCollapsed = false;

	onMount(() => {
		// Listen for sidebar collapse state changes
		const handleStorageChange = () => {
			if (typeof window !== 'undefined') {
				const savedState = localStorage.getItem('adminSidebarCollapsed');
				sidebarCollapsed = savedState === 'true';
			}
		};

		const handleSidebarToggle = (e: CustomEvent) => {
			sidebarCollapsed = e.detail.collapsed;
		};

		handleStorageChange();
		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
		
		// Also check periodically for same-tab changes
		const interval = setInterval(handleStorageChange, 100);
		
		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
			clearInterval(interval);
		};
	});

	// Reactive statement to update margin based on collapsed state
	$: sidebarWidth = sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64';
</script>

<svelte:head>
	<title>Admin - TinyTech</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<AdminSidebar />

	<!-- Main Content -->
	<main class="{sidebarWidth} transition-all duration-300 min-h-screen">
		<div class="p-4 lg:p-8">
			<slot />
		</div>
	</main>
	<QuickActionsPanel />
</div>

