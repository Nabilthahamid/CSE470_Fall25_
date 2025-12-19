<script lang="ts">
	import { FileText, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Filter } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let startDate = $state<string>('');
	let endDate = $state<string>('');
	
	// Order status options
	const orderStatuses = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'processing', label: 'Processing' },
		{ value: 'shipped', label: 'Shipped' },
		{ value: 'delivered', label: 'Delivered' },
		{ value: 'cancelled', label: 'Cancelled' }
	];
	
	// Initialize selected statuses from URL params (default: all non-cancelled)
	let selectedStatuses = $state<string[]>(['pending', 'processing', 'shipped', 'delivered']);
	
	// Initialize from URL on mount
	onMount(() => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search);
			
			// Get dates from URL
			const startDateParam = urlParams.get('startDate');
			const endDateParam = urlParams.get('endDate');
			if (startDateParam) startDate = startDateParam;
			if (endDateParam) endDate = endDateParam;
			
			// Get statuses from URL
			const statusParam = urlParams.get('statuses');
			if (statusParam) {
				selectedStatuses = statusParam.split(',').filter(s => s.trim());
			}
		}
	});

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	}

	// Format percentage
	function formatPercentage(value: number): string {
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	// Toggle status selection - clicking a status makes it the ONLY selected one
	function toggleStatus(status: string) {
		if (selectedStatuses.length === 1 && selectedStatuses[0] === status) {
			// If this is the only selected status, deselect it and go back to default
			selectedStatuses = ['pending', 'processing', 'shipped', 'delivered'];
		} else {
			// Select only this status (deselect all others)
			selectedStatuses = [status];
		}
		// Auto-apply filters when status is clicked
		applyFilters();
	}

	// Apply filters
	async function applyFilters() {
		const params = new URLSearchParams();
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		if (selectedStatuses.length > 0) {
			params.set('statuses', selectedStatuses.join(','));
		}
		
		window.location.href = `/admin/reports${params.toString() ? '?' + params.toString() : ''}`;
	}

	// Clear all filters
	function clearFilters() {
		startDate = '';
		endDate = '';
		selectedStatuses = ['pending', 'processing', 'shipped', 'delivered'];
		window.location.href = '/admin/reports';
	}

	// Get profit color class
	function getProfitColor(profit: number): string {
		if (profit > 0) return 'text-green-600';
		if (profit < 0) return 'text-red-600';
		return 'text-slate-600';
	}

	// Get profit margin color class
	function getMarginColor(margin: number): string {
		if (margin > 20) return 'text-green-600';
		if (margin > 10) return 'text-blue-600';
		if (margin > 0) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

<svelte:head>
	<title>Business Reports - TinyShop Admin</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Header -->
	<header class="border-b border-slate-200 bg-white">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<FileText class="h-6 w-6 text-slate-900" />
					<h1 class="text-xl font-bold text-slate-900">Business Reports</h1>
				</div>
				<div class="flex items-center gap-4">
					<a
						href="/admin"
						class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
					>
						Back to Dashboard
					</a>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<!-- Filters Section -->
		<div class="mb-6 rounded-lg border border-slate-200 bg-white p-6">
			<div class="flex items-center gap-4 mb-4">
				<Filter class="h-5 w-5 text-slate-600" />
				<h3 class="text-lg font-semibold text-slate-900">Filters</h3>
			</div>
			
			<!-- Date Range Filter -->
			<div class="mb-6">
				<div class="flex items-center gap-4 mb-3">
					<Calendar class="h-4 w-4 text-slate-600" />
					<h4 class="text-sm font-semibold text-slate-700">Date Range</h4>
				</div>
				<div class="flex flex-wrap items-end gap-4">
					<div>
						<label for="start-date" class="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
						<input
							id="start-date"
							type="date"
							bind:value={startDate}
							class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
						/>
					</div>
					<div>
						<label for="end-date" class="mb-1 block text-sm font-medium text-slate-700">End Date</label>
						<input
							id="end-date"
							type="date"
							bind:value={endDate}
							class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
						/>
					</div>
				</div>
			</div>

			<!-- Order Status Filter -->
			<div class="mb-6">
				<h4 class="mb-3 text-sm font-semibold text-slate-700">Order Status</h4>
				<div class="flex flex-wrap gap-3">
					{#each orderStatuses as status}
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={selectedStatuses.includes(status.value)}
								onchange={() => toggleStatus(status.value)}
								class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900"
							/>
							<span class="text-sm text-slate-700">{status.label}</span>
						</label>
					{/each}
				</div>
				<p class="mt-2 text-xs text-slate-500">
					Click a status to show only that status. Click again to show all non-cancelled orders.
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<button
					type="button"
					onclick={applyFilters}
					class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
				>
					Apply Filters
				</button>
				<button
					type="button"
					onclick={clearFilters}
					class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
				>
					Clear All
				</button>
			</div>
		</div>

		<!-- Summary Cards -->
		<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
			<div class="rounded-lg border border-slate-200 bg-white p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-green-100 p-3">
						<DollarSign class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Total Revenue</p>
						<p class="text-2xl font-bold text-slate-900">
							{formatCurrency(data.profitLossData.total_revenue)}
						</p>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-slate-200 bg-white p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-100 p-3">
						<Package class="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Total Cost</p>
						<p class="text-2xl font-bold text-slate-900">
							{formatCurrency(data.profitLossData.total_cost)}
						</p>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-slate-200 bg-white p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-100 p-3">
						{#if data.profitLossData.total_profit >= 0}
							<TrendingUp class="h-6 w-6 text-purple-600" />
						{:else}
							<TrendingDown class="h-6 w-6 text-red-600" />
						{/if}
					</div>
					<div>
						<p class="text-sm text-slate-600">Total Profit</p>
						<p class="text-2xl font-bold {getProfitColor(data.profitLossData.total_profit)}">
							{formatCurrency(data.profitLossData.total_profit)}
						</p>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-slate-200 bg-white p-6">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-yellow-100 p-3">
						<FileText class="h-6 w-6 text-yellow-600" />
					</div>
					<div>
						<p class="text-sm text-slate-600">Profit Margin</p>
						<p class="text-2xl font-bold {getMarginColor(data.profitLossData.total_profit_margin)}">
							{formatPercentage(data.profitLossData.total_profit_margin)}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Products Table -->
		<div class="rounded-lg border border-slate-200 bg-white shadow-lg">
			<div class="border-b border-slate-200 p-6">
				<h2 class="text-xl font-bold text-slate-900">Product Profit/Loss Analysis</h2>
				<p class="mt-1 text-sm text-slate-600">
					Total Products Sold: {data.profitLossData.total_products_sold}
				</p>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-slate-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Product Name
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Cost Price
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Selling Price
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Quantity Sold
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Revenue
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Total Cost
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Profit
							</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
								Profit Margin
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 bg-white">
						{#if data.profitLossData.products.length === 0}
							<tr>
								<td colspan="8" class="px-6 py-8 text-center text-sm text-slate-500">
									No sales data available. Start selling products to see profit/loss reports.
								</td>
							</tr>
						{:else}
							{#each data.profitLossData.products as product}
								<tr class="hover:bg-slate-50">
									<td class="whitespace-nowrap px-6 py-4">
										<div class="text-sm font-medium text-slate-900">{product.product_name}</div>
										<div class="text-xs text-slate-500">{product.product_slug}</div>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
										{formatCurrency(product.cost_price)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
										{formatCurrency(product.selling_price)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
										{product.total_quantity_sold}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
										{formatCurrency(product.total_revenue)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
										{formatCurrency(product.total_cost)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm font-semibold {getProfitColor(product.profit)}">
										{formatCurrency(product.profit)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm font-semibold {getMarginColor(product.profit_margin)}">
										{formatPercentage(product.profit_margin)}
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Export/Print Section -->
		<div class="mt-6 flex justify-end gap-4">
			<button
				type="button"
				onclick={() => window.print()}
				class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
			>
				Print Report
			</button>
		</div>
	</main>
</div>

<style>
	@media print {
		header,
		button,
		input,
		label {
			display: none;
		}
	}
</style>
