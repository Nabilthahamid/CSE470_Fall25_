<!-- VIEW: Profit/Loss report page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { productService } from '$lib/services/ProductService';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;
	export let params = {}; // Accept params but don't use it (may be passed by SvelteKit)

	let startDate = '';
	let endDate = '';
	let productId = '';
	let products: Array<{ id: string; name: string }> = [];
	let showFilters = false;

	onMount(async () => {
		try {
			const allProducts = await productService.getAllProducts();
			products = allProducts.map((p) => ({ id: p.id, name: p.name }));
		} catch (error) {
			console.error('Failed to load products:', error);
		}
	});

	function downloadCSV() {
		const csv = form?.csvContent || '';
		const filename = form?.filename || 'profit-loss-report.csv';

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
</script>

<svelte:head>
	<title>Profit/Loss Report - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="m-0 text-3xl font-bold">Profit/Loss Report</h1>
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
						href="/admin/profit-loss"
						class="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg no-underline inline-block transition-colors hover:bg-gray-700"
					>
						Clear Filters
					</a>
				</div>
			</form>
		</div>
	{/if}

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
		<div class="bg-white/5 p-6 rounded-lg border border-white/10">
			<h3 class="text-gray-400 text-sm mb-2">Total Sales</h3>
			<p class="text-3xl font-bold">${data.report.totalSales.toFixed(2)}</p>
		</div>
		<div class="bg-white/5 p-6 rounded-lg border border-white/10">
			<h3 class="text-gray-400 text-sm mb-2">Total Cost</h3>
			<p class="text-3xl font-bold">${data.report.totalCost.toFixed(2)}</p>
		</div>
		<div class="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
			<h3 class="text-green-400 text-sm mb-2">Total Profit</h3>
			<p class="text-3xl font-bold text-green-400">${data.report.totalProfit.toFixed(2)}</p>
		</div>
		<div class="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
			<h3 class="text-red-400 text-sm mb-2">Total Loss</h3>
			<p class="text-3xl font-bold text-red-400">${data.report.totalLoss.toFixed(2)}</p>
		</div>
		<div
			class="p-6 rounded-lg border {data.report.netProfit >= 0
				? 'bg-green-500/10 border-green-500/30'
				: 'bg-red-500/10 border-red-500/30'}"
		>
			<h3 class="text-gray-400 text-sm mb-2">Net Profit</h3>
			<p
				class="text-3xl font-bold {data.report.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}"
			>
				${data.report.netProfit.toFixed(2)}
			</p>
		</div>
	</div>

	<!-- Product Breakdown -->
	<div class="mb-8">
		<h2 class="mb-4 text-2xl font-semibold">Product Breakdown</h2>
		<div class="bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b border-white/10">
						<th class="p-4 text-left">Product</th>
						<th class="p-4 text-right">Quantity Sold</th>
						<th class="p-4 text-right">Revenue</th>
						<th class="p-4 text-right">Cost</th>
						<th class="p-4 text-right">Profit</th>
						<th class="p-4 text-right">Loss</th>
						<th class="p-4 text-right">Net Profit</th>
					</tr>
				</thead>
				<tbody>
					{#each data.report.productBreakdown as item (item.product_id)}
						<tr class="border-b border-white/5 hover:bg-white/5">
							<td class="p-4">{item.product_name}</td>
							<td class="p-4 text-right">{item.totalSold}</td>
							<td class="p-4 text-right">${item.totalRevenue.toFixed(2)}</td>
							<td class="p-4 text-right">${item.totalCost.toFixed(2)}</td>
							<td class="p-4 text-right text-green-400">${item.profit.toFixed(2)}</td>
							<td class="p-4 text-right text-red-400">${item.loss.toFixed(2)}</td>
							<td
								class="p-4 text-right {item.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}"
							>
								${item.netProfit.toFixed(2)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if data.report.productBreakdown.length === 0}
				<div class="p-8 text-center text-gray-400">No sales data available</div>
			{/if}
		</div>
	</div>

	<!-- Recent Sales -->
	<div>
		<h2 class="mb-4 text-2xl font-semibold">Recent Sales</h2>
		<div class="bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b border-white/10">
						<th class="p-4 text-left">Date</th>
						<th class="p-4 text-left">Product</th>
						<th class="p-4 text-left">Customer</th>
						<th class="p-4 text-right">Quantity</th>
						<th class="p-4 text-right">Sale Price</th>
						<th class="p-4 text-right">Total Amount</th>
						<th class="p-4 text-right">Profit/Loss</th>
					</tr>
				</thead>
				<tbody>
					{#each data.report.sales.slice(0, 50) as sale (sale.id)}
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
			{#if data.report.sales.length === 0}
				<div class="p-8 text-center text-gray-400">No sales data available</div>
			{/if}
		</div>
	</div>
</div>

