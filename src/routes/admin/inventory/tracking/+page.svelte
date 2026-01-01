<!-- VIEW: Inventory Tracking Page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Chart from 'chart.js/auto';

	export let data: PageData;
	export let params: Record<string, string> = {};

	let valuationChart: Chart | null = null;
	let abcChart: Chart | null = null;
	let selectedTab: 'valuation' | 'movement' | 'abc' | 'deadstock' | 'aging' = 'valuation';
	let daysThreshold = data.daysThreshold || 90;

	let valuationCanvas: HTMLCanvasElement;
	let abcCanvas: HTMLCanvasElement;

	onMount(() => {
		setTimeout(() => {
			initValuationChart();
			initABCChart();
		}, 100);
	});

	function initValuationChart() {
		if (!valuationCanvas) return;
		const ctx = valuationCanvas.getContext('2d');
		if (!ctx) return;

		if (valuationChart) valuationChart.destroy();

		const categories = data.valuation.byCategory.slice(0, 10);
		const labels = categories.map(c => c.category);
		const costValues = categories.map(c => c.costValue);
		const retailValues = categories.map(c => c.retailValue);

		valuationChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Cost Value (Tk)',
						data: costValues,
						backgroundColor: 'rgba(239, 68, 68, 0.8)',
						borderColor: 'rgb(239, 68, 68)',
						borderWidth: 2
					},
					{
						label: 'Retail Value (Tk)',
						data: retailValues,
						backgroundColor: 'rgba(34, 197, 94, 0.8)',
						borderColor: 'rgb(34, 197, 94)',
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'top' },
					title: { display: true, text: 'Inventory Valuation by Category' }
				},
				scales: {
					y: {
						beginAtZero: true,
						title: { display: true, text: 'Value (Tk)' }
					}
				}
			}
		});
	}

	function initABCChart() {
		if (!abcCanvas) return;
		const ctx = abcCanvas.getContext('2d');
		if (!ctx) return;

		if (abcChart) abcChart.destroy();

		const categoryCounts = {
			A: data.abcAnalysis.filter(p => p.category === 'A').length,
			B: data.abcAnalysis.filter(p => p.category === 'B').length,
			C: data.abcAnalysis.filter(p => p.category === 'C').length
		};

		abcChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['A (High Value)', 'B (Medium Value)', 'C (Low Value)'],
				datasets: [
					{
						data: [categoryCounts.A, categoryCounts.B, categoryCounts.C],
						backgroundColor: [
							'rgba(34, 197, 94, 0.8)',
							'rgba(251, 146, 60, 0.8)',
							'rgba(239, 68, 68, 0.8)'
						],
						borderWidth: 2,
						borderColor: '#ffffff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'right' },
					title: { display: true, text: 'ABC Analysis Distribution' }
				}
			}
		});
	}

	function formatCurrency(value: number): string {
		return `Tk ${value.toFixed(2)}`;
	}
</script>

<svelte:head>
	<title>Inventory Tracking - Advanced Analytics</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Inventory Tracking & Analytics</h1>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<div class="flex gap-4">
			<button
				on:click={() => selectedTab = 'valuation'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {selectedTab === 'valuation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Inventory Valuation
			</button>
			<button
				on:click={() => selectedTab = 'movement'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {selectedTab === 'movement' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Stock Movement History
			</button>
			<button
				on:click={() => selectedTab = 'abc'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {selectedTab === 'abc' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				ABC Analysis
			</button>
			<button
				on:click={() => selectedTab = 'deadstock'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {selectedTab === 'deadstock' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Dead Stock Detection
			</button>
			<button
				on:click={() => selectedTab = 'aging'}
				class="px-4 py-2 font-semibold border-b-2 transition-colors {selectedTab === 'aging' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
			>
				Stock Aging Report
			</button>
		</div>
	</div>

	<!-- Inventory Valuation -->
	{#if selectedTab === 'valuation'}
		<div class="space-y-6">
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
					<h3 class="text-sm font-semibold text-blue-100 uppercase tracking-wide mb-2">Total Cost Value</h3>
					<p class="text-3xl font-bold">{formatCurrency(data.valuation.totalCostValue)}</p>
				</div>
				<div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
					<h3 class="text-sm font-semibold text-green-100 uppercase tracking-wide mb-2">Total Retail Value</h3>
					<p class="text-3xl font-bold">{formatCurrency(data.valuation.totalRetailValue)}</p>
				</div>
				<div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
					<h3 class="text-sm font-semibold text-purple-100 uppercase tracking-wide mb-2">Total Products</h3>
					<p class="text-3xl font-bold">{data.valuation.totalProducts}</p>
				</div>
			</div>

			<!-- Chart -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Valuation by Category</h2>
				<div class="h-96">
					<canvas bind:this={valuationCanvas}></canvas>
				</div>
			</div>

			<!-- Category Breakdown Table -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="border-b-2 border-gray-200">
								<th class="text-left p-4 font-semibold text-gray-700">Category</th>
								<th class="text-right p-4 font-semibold text-gray-700">Cost Value</th>
								<th class="text-right p-4 font-semibold text-gray-700">Retail Value</th>
								<th class="text-right p-4 font-semibold text-gray-700">Products</th>
							</tr>
						</thead>
						<tbody>
							{#each data.valuation.byCategory as category}
								<tr class="border-b border-gray-100 hover:bg-gray-50">
									<td class="p-4 font-medium text-gray-900">{category.category}</td>
									<td class="p-4 text-right text-gray-700">{formatCurrency(category.costValue)}</td>
									<td class="p-4 text-right text-gray-700">{formatCurrency(category.retailValue)}</td>
									<td class="p-4 text-right text-gray-700">{category.productCount}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Stock Movement History -->
	{#if selectedTab === 'movement'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Stock Movement History</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b-2 border-gray-200">
							<th class="text-left p-4 font-semibold text-gray-700">Product</th>
							<th class="text-center p-4 font-semibold text-gray-700">Type</th>
							<th class="text-right p-4 font-semibold text-gray-700">Change</th>
							<th class="text-right p-4 font-semibold text-gray-700">Previous</th>
							<th class="text-right p-4 font-semibold text-gray-700">New</th>
							<th class="text-left p-4 font-semibold text-gray-700">Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.movementHistory.slice(0, 100) as movement}
							<tr class="border-b border-gray-100 hover:bg-gray-50">
								<td class="p-4 font-medium text-gray-900">{movement.product_name || 'Unknown'}</td>
								<td class="p-4 text-center">
									<span class="px-2 py-1 rounded text-xs font-semibold {
										movement.change_type === 'sale' ? 'bg-red-100 text-red-700' :
										movement.change_type === 'purchase' ? 'bg-green-100 text-green-700' :
										'bg-blue-100 text-blue-700'
									}">
										{movement.change_type}
									</span>
								</td>
								<td class="p-4 text-right font-semibold {movement.quantity_change < 0 ? 'text-red-600' : 'text-green-600'}">
									{movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
								</td>
								<td class="p-4 text-right text-gray-600">{movement.previous_stock}</td>
								<td class="p-4 text-right text-gray-700 font-semibold">{movement.new_stock}</td>
								<td class="p-4 text-gray-600">
									{movement.created_at ? new Date(movement.created_at).toLocaleString() : 'N/A'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- ABC Analysis -->
	{#if selectedTab === 'abc'}
		<div class="space-y-6">
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">ABC Analysis</h2>
				<div class="h-96 mb-6">
					<canvas bind:this={abcCanvas}></canvas>
				</div>
				<div class="grid grid-cols-3 gap-4">
					<div class="bg-green-50 p-4 rounded-lg">
						<p class="text-sm font-semibold text-green-700 mb-1">Category A</p>
						<p class="text-2xl font-bold text-green-600">
							{data.abcAnalysis.filter(p => p.category === 'A').length}
						</p>
						<p class="text-xs text-green-600 mt-1">Top 80% of value</p>
					</div>
					<div class="bg-yellow-50 p-4 rounded-lg">
						<p class="text-sm font-semibold text-yellow-700 mb-1">Category B</p>
						<p class="text-2xl font-bold text-yellow-600">
							{data.abcAnalysis.filter(p => p.category === 'B').length}
						</p>
						<p class="text-xs text-yellow-600 mt-1">Next 15% of value</p>
					</div>
					<div class="bg-red-50 p-4 rounded-lg">
						<p class="text-sm font-semibold text-red-700 mb-1">Category C</p>
						<p class="text-2xl font-bold text-red-600">
							{data.abcAnalysis.filter(p => p.category === 'C').length}
						</p>
						<p class="text-xs text-red-600 mt-1">Remaining 5% of value</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Product Classification</h2>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="border-b-2 border-gray-200">
								<th class="text-left p-4 font-semibold text-gray-700">Product</th>
								<th class="text-center p-4 font-semibold text-gray-700">Category</th>
								<th class="text-right p-4 font-semibold text-gray-700">Total Value</th>
								<th class="text-right p-4 font-semibold text-gray-700">Percentage</th>
							</tr>
						</thead>
						<tbody>
							{#each data.abcAnalysis.slice(0, 50) as product}
								<tr class="border-b border-gray-100 hover:bg-gray-50">
									<td class="p-4 font-medium text-gray-900">{product.product_name}</td>
									<td class="p-4 text-center">
										<span class="px-3 py-1 rounded-full text-xs font-semibold {
											product.category === 'A' ? 'bg-green-100 text-green-700' :
											product.category === 'B' ? 'bg-yellow-100 text-yellow-700' :
											'bg-red-100 text-red-700'
										}">
											{product.category}
										</span>
									</td>
									<td class="p-4 text-right text-gray-700">{formatCurrency(product.totalValue)}</td>
									<td class="p-4 text-right text-gray-600">{product.percentage.toFixed(2)}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- Dead Stock Detection -->
	{#if selectedTab === 'deadstock'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold text-gray-900">Dead Stock Detection</h2>
				<div class="flex items-center gap-2">
					<label class="text-sm font-medium">Days Threshold:</label>
					<input
						type="number"
						bind:value={daysThreshold}
						min="1"
						class="w-24 p-2 border-2 border-gray-300 rounded-lg"
					/>
					<button
						on:click={() => window.location.href = `/admin/inventory/tracking?daysThreshold=${daysThreshold}`}
						class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
					>
						Update
					</button>
				</div>
			</div>
			<p class="text-gray-600 mb-4">
				Products with no sales for {daysThreshold} days or more
			</p>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b-2 border-gray-200">
							<th class="text-left p-4 font-semibold text-gray-700">Product</th>
							<th class="text-right p-4 font-semibold text-gray-700">Days Since Last Sale</th>
							<th class="text-right p-4 font-semibold text-gray-700">Current Stock</th>
							<th class="text-left p-4 font-semibold text-gray-700">Last Sale Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.deadStock as product}
							<tr class="border-b border-gray-100 hover:bg-gray-50">
								<td class="p-4 font-medium text-gray-900">{product.product_name}</td>
								<td class="p-4 text-right text-red-600 font-semibold">{product.daysSinceLastSale}</td>
								<td class="p-4 text-right text-gray-700">{product.currentStock}</td>
								<td class="p-4 text-gray-600">
									{product.lastSaleDate ? new Date(product.lastSaleDate).toLocaleDateString() : 'Never'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- Stock Aging Report -->
	{#if selectedTab === 'aging'}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Stock Aging Report</h2>
			<p class="text-gray-600 mb-4">Products sorted by how long they've been in stock</p>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b-2 border-gray-200">
							<th class="text-left p-4 font-semibold text-gray-700">Product</th>
							<th class="text-right p-4 font-semibold text-gray-700">Days In Stock</th>
							<th class="text-right p-4 font-semibold text-gray-700">Current Stock</th>
							<th class="text-left p-4 font-semibold text-gray-700">Created Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.stockAging as product}
							<tr class="border-b border-gray-100 hover:bg-gray-50">
								<td class="p-4 font-medium text-gray-900">{product.product_name}</td>
								<td class="p-4 text-right font-semibold {
									product.daysInStock > 180 ? 'text-red-600' :
									product.daysInStock > 90 ? 'text-yellow-600' :
									'text-gray-700'
								}">
									{product.daysInStock}
								</td>
								<td class="p-4 text-right text-gray-700">{product.currentStock}</td>
								<td class="p-4 text-gray-600">
									{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

