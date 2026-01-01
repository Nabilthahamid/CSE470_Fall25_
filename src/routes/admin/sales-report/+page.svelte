<!-- VIEW: Sales report page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import { productService } from '$lib/services/ProductService';

	export let data: PageData;
	export let form: ActionData;
	export const params = {};

	let startDate = '';
	let endDate = '';
	let productId = '';
	let products: Array<{ id: string; name: string }> = [];
	let showFilters = false;
	let aiAnalytics: any = null;
	let loadingAnalytics = false;

	onMount(async () => {
		if (typeof window === 'undefined') return; // Only run on client
		try {
			const allProducts = await productService.getAllProducts();
			products = allProducts.map((p) => ({ id: p.id, name: p.name }));
			loadAIAnalytics();
		} catch (error) {
			console.error('Failed to load products:', error);
		}
	});

	async function loadAIAnalytics() {
		loadingAnalytics = true;
		try {
			const params = new URLSearchParams();
			if (startDate) params.append('startDate', startDate);
			if (endDate) params.append('endDate', endDate);
			if (productId) params.append('productId', productId);

			const response = await fetch(`/api/admin/ai-sales-analytics?${params.toString()}`);
			if (response.ok) {
				aiAnalytics = await response.json();
			}
		} catch (error) {
			console.error('Error loading AI analytics:', error);
		} finally {
			loadingAnalytics = false;
		}
	}

	$: if (startDate || endDate || productId) {
		loadAIAnalytics();
	}

	function downloadCSV() {
		const csv = form?.csvContent || '';
		const filename = form?.filename || 'sales-report.csv';

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}

	$: if (form?.csvContent) {
		downloadCSV();
	}

	// Calculate totals
	$: totalSales = data.sales.reduce((sum, sale) => sum + sale.total_amount, 0);
	$: totalQuantity = data.sales.reduce((sum, sale) => sum + sale.quantity, 0);
	$: totalProfit = data.sales.reduce((sum, sale) => sum + sale.profit, 0);
</script>

<svelte:head>
	<title>Sales Report - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="m-0 text-3xl font-bold">Sales Report</h1>
		<div class="flex gap-4">
			<button
				class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700"
				on:click={() => (showFilters = !showFilters)}
			>
				{showFilters ? 'Hide Filters' : 'Show Filters'}
			</button>
			<form method="POST" action="?/export" use:enhance>
				<input type="hidden" name="startDate" value={startDate} />
				<input type="hidden" name="endDate" value={endDate} />
				<input type="hidden" name="productId" value={productId} />
				<button
					type="submit"
					class="bg-green-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-green-700"
				>
					Download CSV Report
				</button>
			</form>
		</div>
	</div>

	{#if data.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{data.error}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{form.error}
		</div>
	{/if}

	{#if showFilters}
		<div class="bg-white/5 p-6 rounded-lg mb-6 border border-white/10">
			<h2 class="mb-4 text-xl font-semibold">Filters</h2>
			<form method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label for="startDate" class="block mb-2 font-medium">Start Date</label>
					<input
						type="date"
						id="startDate"
						name="startDate"
						bind:value={startDate}
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="endDate" class="block mb-2 font-medium">End Date</label>
					<input
						type="date"
						id="endDate"
						name="endDate"
						bind:value={endDate}
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="productId" class="block mb-2 font-medium">Product</label>
					<select
						id="productId"
						name="productId"
						bind:value={productId}
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					>
						<option value="">All Products</option>
						{#each products as product}
							<option value={product.id}>{product.name}</option>
						{/each}
					</select>
				</div>
				<div class="md:col-span-3">
					<button
						type="submit"
						class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700"
					>
						Apply Filters
					</button>
					<a
						href="/admin/sales-report"
						class="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg no-underline inline-block transition-colors hover:bg-gray-700"
					>
						Clear Filters
					</a>
				</div>
			</form>
		</div>
	{/if}

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<div class="bg-white/5 p-6 rounded-lg border border-white/10">
			<h3 class="text-gray-400 text-sm mb-2">Total Sales</h3>
			<p class="text-3xl font-bold">${totalSales.toFixed(2)}</p>
		</div>
		<div class="bg-white/5 p-6 rounded-lg border border-white/10">
			<h3 class="text-gray-400 text-sm mb-2">Total Items Sold</h3>
			<p class="text-3xl font-bold">{totalQuantity}</p>
		</div>
		<div
			class="p-6 rounded-lg border {totalProfit >= 0
				? 'bg-green-500/10 border-green-500/30'
				: 'bg-red-500/10 border-red-500/30'}"
		>
			<h3 class="text-gray-400 text-sm mb-2">Total Profit</h3>
			<p class="text-3xl font-bold {totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}">
				${totalProfit.toFixed(2)}
			</p>
		</div>
	</div>

	<!-- AI Analytics Section -->
	{#if aiAnalytics}
		<div class="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
			<div class="flex items-center gap-3 mb-6">
				<div class="bg-indigo-600 p-3 rounded-lg">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900">AI Sales Analytics</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<!-- Trend Analysis -->
				<div class="bg-white rounded-lg p-5 border border-indigo-100">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Sales Trend</h3>
					<div class="flex items-center gap-3">
						<div class="text-3xl font-bold {aiAnalytics.trend === 'increasing' ? 'text-green-600' : aiAnalytics.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'}">
							{aiAnalytics.trend === 'increasing' ? '↗' : aiAnalytics.trend === 'decreasing' ? '↘' : '→'}
						</div>
						<div>
							<p class="text-xl font-bold text-gray-900 capitalize">{aiAnalytics.trend}</p>
							<p class="text-sm text-gray-600">Strength: {aiAnalytics.trendStrength.toFixed(1)}%</p>
						</div>
					</div>
				</div>

				<!-- Anomalies -->
				<div class="bg-white rounded-lg p-5 border border-indigo-100">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Anomaly Detection</h3>
					{#if aiAnalytics.anomalies.length > 0}
						<p class="text-2xl font-bold text-orange-600 mb-2">{aiAnalytics.anomalies.length}</p>
						<p class="text-sm text-gray-600">Unusual patterns detected</p>
						<div class="mt-3 space-y-2 max-h-32 overflow-y-auto">
							{#each aiAnalytics.anomalies.slice(0, 3) as anomaly}
								<div class="text-xs p-2 bg-gray-50 rounded border border-gray-200">
									<p class="font-semibold">{anomaly.type === 'spike' ? '📈 Spike' : '📉 Drop'}</p>
									<p class="text-gray-600">{anomaly.date}</p>
									<p class="text-gray-500 text-xs">{anomaly.reason}</p>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-lg font-semibold text-green-600">No anomalies detected</p>
						<p class="text-sm text-gray-600">Sales patterns are normal</p>
					{/if}
				</div>
			</div>

			<!-- Insights -->
			<div class="bg-white rounded-lg p-5 border border-indigo-100">
				<h3 class="text-lg font-bold text-gray-900 mb-3">AI Insights</h3>
				<ul class="space-y-2">
					{#each aiAnalytics.insights as insight}
						<li class="flex items-start gap-2 text-sm text-gray-700">
							<span class="text-indigo-600 mt-1">•</span>
							<span>{insight}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}

	<!-- Sales Table -->
	<div class="bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b border-white/10">
					<th class="p-4 text-left">Date</th>
					<th class="p-4 text-left">Product</th>
					<th class="p-4 text-left">Customer</th>
					<th class="p-4 text-right">Quantity</th>
					<th class="p-4 text-right">Sale Price</th>
					<th class="p-4 text-right">Cost Price</th>
					<th class="p-4 text-right">Total Amount</th>
					<th class="p-4 text-right">Profit/Loss</th>
				</tr>
			</thead>
			<tbody>
				{#each data.sales as sale (sale.id)}
					<tr class="border-b border-white/5 hover:bg-white/5">
						<td class="p-4">
							{#if sale.created_at}
								{new Date(sale.created_at).toLocaleDateString()}
							{/if}
						</td>
						<td class="p-4">{sale.product_name || 'N/A'}</td>
						<td class="p-4">{sale.user_name || 'Guest'}</td>
						<td class="p-4 text-right">{sale.quantity}</td>
						<td class="p-4 text-right">${sale.sale_price.toFixed(2)}</td>
						<td class="p-4 text-right">${sale.cost_price.toFixed(2)}</td>
						<td class="p-4 text-right">${sale.total_amount.toFixed(2)}</td>
						<td
							class="p-4 text-right {sale.profit >= 0 ? 'text-green-400' : 'text-red-400'}"
						>
							${sale.profit.toFixed(2)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if data.sales.length === 0}
			<div class="p-8 text-center text-gray-400">No sales data available</div>
		{/if}
	</div>
</div>

