<!-- VIEW: Advanced Analytics Dashboard -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import Chart from 'chart.js/auto';

	export let data: PageData;
	export let params: Record<string, string> = {};

	let revenueChart: Chart | null = null;
	let productChart: Chart | null = null;
	let categoryChart: Chart | null = null;
	let heatmapChart: Chart | null = null;
	let comparisonChart: Chart | null = null;

	let selectedPeriod = data.period || 'month';
	let showComparison = data.timeComparisons !== null;
	let startDate = '';
	let endDate = '';
	let chartCanvas: HTMLCanvasElement;
	let productCanvas: HTMLCanvasElement;
	let categoryCanvas: HTMLCanvasElement;
	let heatmapCanvas: HTMLCanvasElement;
	let comparisonCanvas: HTMLCanvasElement;

	onMount(() => {
		// Initialize charts after component mounts
		if (typeof window !== 'undefined') {
			setTimeout(() => {
				initRevenueChart();
				initProductChart();
				initCategoryChart();
				initHeatmapChart();
				if (data.timeComparisons) {
					initComparisonChart();
				}
			}, 100);
		}
	});

	onDestroy(() => {
		// Cleanup charts on component destroy
		if (revenueChart) revenueChart.destroy();
		if (productChart) productChart.destroy();
		if (categoryChart) categoryChart.destroy();
		if (heatmapChart) heatmapChart.destroy();
		if (comparisonChart) comparisonChart.destroy();
	});

	function initRevenueChart() {
		if (!chartCanvas) return;

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;

		// Destroy existing chart
		if (revenueChart) {
			revenueChart.destroy();
		}

		const labels = data.revenueTrends.map((t) => t.date);
		const revenueData = data.revenueTrends.map((t) => t.revenue);
		const ordersData = data.revenueTrends.map((t) => t.orders);

		revenueChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Revenue (Tk)',
						data: revenueData,
						borderColor: 'rgb(99, 102, 241)',
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
						tension: 0.4,
						fill: true,
						yAxisID: 'y'
					},
					...(data.previousRevenueTrends
						? [
								{
									label: 'Previous Period Revenue (Tk)',
									data: data.previousRevenueTrends.map((t) => t.revenue),
									borderColor: 'rgb(156, 163, 175)',
									backgroundColor: 'rgba(156, 163, 175, 0.1)',
									tension: 0.4,
									borderDash: [5, 5],
									fill: false,
									yAxisID: 'y'
								}
							]
						: []),
					{
						label: 'Orders',
						data: ordersData,
						borderColor: 'rgb(236, 72, 153)',
						backgroundColor: 'rgba(236, 72, 153, 0.1)',
						tension: 0.4,
						fill: false,
						yAxisID: 'y1'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					legend: {
						position: 'top'
					},
					title: {
						display: true,
						text: 'Revenue Trends Over Time'
					}
				},
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'Revenue (Tk)'
						}
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						title: {
							display: true,
							text: 'Number of Orders'
						},
						grid: {
							drawOnChartArea: false
						}
					}
				}
			}
		});
	}

	function initProductChart() {
		if (!productCanvas) return;

		const ctx = productCanvas.getContext('2d');
		if (!ctx) return;

		if (productChart) {
			productChart.destroy();
		}

		const topProducts = data.productPerformance.slice(0, 10);
		const labels = topProducts.map((p) => p.productName);
		const revenueData = topProducts.map((p) => p.revenue);

		productChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Revenue (Tk)',
						data: revenueData,
						backgroundColor: [
							'rgba(99, 102, 241, 0.8)',
							'rgba(139, 92, 246, 0.8)',
							'rgba(236, 72, 153, 0.8)',
							'rgba(251, 146, 60, 0.8)',
							'rgba(34, 197, 94, 0.8)',
							'rgba(59, 130, 246, 0.8)',
							'rgba(168, 85, 247, 0.8)',
							'rgba(244, 63, 94, 0.8)',
							'rgba(249, 115, 22, 0.8)',
							'rgba(16, 185, 129, 0.8)'
						],
						borderColor: [
							'rgb(99, 102, 241)',
							'rgb(139, 92, 246)',
							'rgb(236, 72, 153)',
							'rgb(251, 146, 60)',
							'rgb(34, 197, 94)',
							'rgb(59, 130, 246)',
							'rgb(168, 85, 247)',
							'rgb(244, 63, 94)',
							'rgb(249, 115, 22)',
							'rgb(16, 185, 129)'
						],
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						text: 'Top 10 Products by Revenue'
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: 'Revenue (Tk)'
						}
					}
				}
			}
		});
	}

	function initCategoryChart() {
		if (!categoryCanvas) return;

		const ctx = categoryCanvas.getContext('2d');
		if (!ctx) return;

		if (categoryChart) {
			categoryChart.destroy();
		}

		const labels = data.categoryPerformance.map((c) => c.category);
		const revenueData = data.categoryPerformance.map((c) => c.revenue);

		categoryChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						label: 'Revenue (Tk)',
						data: revenueData,
						backgroundColor: [
							'rgba(99, 102, 241, 0.8)',
							'rgba(139, 92, 246, 0.8)',
							'rgba(236, 72, 153, 0.8)',
							'rgba(251, 146, 60, 0.8)',
							'rgba(34, 197, 94, 0.8)',
							'rgba(59, 130, 246, 0.8)',
							'rgba(168, 85, 247, 0.8)',
							'rgba(244, 63, 94, 0.8)',
							'rgba(249, 115, 22, 0.8)',
							'rgba(16, 185, 129, 0.8)'
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
					legend: {
						position: 'right'
					},
					title: {
						display: true,
						text: 'Revenue by Category'
					}
				}
			}
		});
	}

	function initHeatmapChart() {
		if (!heatmapCanvas) return;

		const ctx = heatmapCanvas.getContext('2d');
		if (!ctx) return;

		if (heatmapChart) {
			heatmapChart.destroy();
		}

		// Organize heatmap data
		const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const heatmapData = daysOfWeek.map((day) => {
			const dayData = data.salesHeatmap.filter((h) => h.day === day);
			return dayData.length > 0 ? dayData.reduce((sum, d) => sum + d.value, 0) / dayData.length : 0;
		});

		heatmapChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: daysOfWeek,
				datasets: [
					{
						label: 'Average Revenue',
						data: heatmapData,
						backgroundColor: (context) => {
							const value = context.parsed.y;
							const max = Math.max(...heatmapData);
							const intensity = value / max;
							return `rgba(99, 102, 241, ${0.3 + intensity * 0.7})`;
						},
						borderColor: 'rgb(99, 102, 241)',
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						text: 'Sales Heatmap by Day of Week'
					}
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Average Revenue (Tk)'
						}
					}
				}
			}
		});
	}

	function initComparisonChart() {
		if (!comparisonCanvas || !data.timeComparisons) return;

		const ctx = comparisonCanvas.getContext('2d');
		if (!ctx) return;

		if (comparisonChart) {
			comparisonChart.destroy();
		}

		const { currentPeriod, previousPeriod } = data.timeComparisons;
		const revenueChange = previousPeriod.revenue > 0
			? ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100
			: 0;
		const ordersChange = previousPeriod.orders > 0
			? ((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders) * 100
			: 0;
		const aovChange = previousPeriod.averageOrderValue > 0
			? ((currentPeriod.averageOrderValue - previousPeriod.averageOrderValue) / previousPeriod.averageOrderValue) * 100
			: 0;

		comparisonChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Revenue', 'Orders', 'Avg Order Value'],
				datasets: [
					{
						label: 'Current Period',
						data: [currentPeriod.revenue, currentPeriod.orders, currentPeriod.averageOrderValue],
						backgroundColor: 'rgba(99, 102, 241, 0.8)',
						borderColor: 'rgb(99, 102, 241)',
						borderWidth: 2
					},
					{
						label: 'Previous Period',
						data: [previousPeriod.revenue, previousPeriod.orders, previousPeriod.averageOrderValue],
						backgroundColor: 'rgba(156, 163, 175, 0.8)',
						borderColor: 'rgb(156, 163, 175)',
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top'
					},
					title: {
						display: true,
						text: 'Period Comparison'
					}
				},
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	function updatePeriod() {
		const params = new URLSearchParams();
		params.set('period', selectedPeriod);
		if (showComparison) params.set('compare', 'true');
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
		window.location.href = `/admin/analytics?${params.toString()}`;
	}

	function formatCurrency(value: number): string {
		return `Tk ${value.toFixed(2)}`;
	}

	function formatPercentage(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	// Calculate total revenue for category performance
	$: totalCategoryRevenue = data.categoryPerformance.reduce((sum, c) => sum + c.revenue, 0);
</script>

<svelte:head>
	<title>Advanced Analytics - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics Dashboard</h1>
			<p class="text-gray-600">Comprehensive insights into your business performance</p>
		</div>

		<!-- Period Selector -->
		<div class="flex items-center gap-4">
			<select
				bind:value={selectedPeriod}
				on:change={updatePeriod}
				class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
			>
				<option value="day">Today</option>
				<option value="week">This Week</option>
				<option value="month">This Month</option>
				<option value="year">This Year</option>
			</select>
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={showComparison}
					on:change={updatePeriod}
					class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
				/>
				<span class="text-sm text-gray-700">Compare with previous period</span>
			</label>
		</div>
	</div>

	{#if data.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{data.error}
		</div>
	{/if}

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-blue-100 uppercase tracking-wide">Total Revenue</h3>
				<svg class="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
			{#if data.timeComparisons}
				{@const change = ((data.summary.totalRevenue - data.timeComparisons.previousPeriod.revenue) / data.timeComparisons.previousPeriod.revenue) * 100}
				<p class="text-sm text-blue-100 mt-1">
					{formatPercentage(change)} vs previous period
				</p>
			{/if}
		</div>

		<div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-green-100 uppercase tracking-wide">Total Orders</h3>
				<svg class="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{data.summary.totalOrders}</p>
			{#if data.timeComparisons}
				{@const change = ((data.summary.totalOrders - data.timeComparisons.previousPeriod.orders) / data.timeComparisons.previousPeriod.orders) * 100}
				<p class="text-sm text-green-100 mt-1">
					{formatPercentage(change)} vs previous period
				</p>
			{/if}
		</div>

		<div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-purple-100 uppercase tracking-wide">Avg Order Value</h3>
				<svg class="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatCurrency(data.summary.averageOrderValue)}</p>
			{#if data.timeComparisons}
				{@const change = ((data.summary.averageOrderValue - data.timeComparisons.previousPeriod.averageOrderValue) / data.timeComparisons.previousPeriod.averageOrderValue) * 100}
				<p class="text-sm text-purple-100 mt-1">
					{formatPercentage(change)} vs previous period
				</p>
			{/if}
		</div>

		<div class="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-orange-100 uppercase tracking-wide">Total Products</h3>
				<svg class="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{data.summary.totalProducts}</p>
			<p class="text-sm text-orange-100 mt-1">in inventory</p>
		</div>
	</div>

	<!-- Revenue Trends Chart -->
	<div class="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
		<h2 class="text-2xl font-bold text-gray-900 mb-4">Revenue Trends</h2>
		<div class="h-96">
			<canvas bind:this={chartCanvas}></canvas>
		</div>
	</div>

	<!-- Charts Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Product Performance -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Top Products by Revenue</h2>
			<div class="h-96">
				<canvas bind:this={productCanvas}></canvas>
			</div>
		</div>

		<!-- Category Performance -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Revenue by Category</h2>
			<div class="h-96">
				<canvas bind:this={categoryCanvas}></canvas>
			</div>
		</div>
	</div>

	<!-- Sales Heatmap and Comparison -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Sales Heatmap -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Sales Heatmap</h2>
			<div class="h-80">
				<canvas bind:this={heatmapCanvas}></canvas>
			</div>
		</div>

		{#if data.timeComparisons}
			<!-- Period Comparison -->
			<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Period Comparison</h2>
				<div class="h-80">
					<canvas bind:this={comparisonCanvas}></canvas>
				</div>
			</div>
		{/if}
	</div>

	<!-- Product Performance Table -->
	<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-4">Product Performance Details</h2>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b-2 border-gray-200">
						<th class="text-left p-4 font-semibold text-gray-700">Product</th>
						<th class="text-right p-4 font-semibold text-gray-700">Revenue</th>
						<th class="text-right p-4 font-semibold text-gray-700">Quantity Sold</th>
						<th class="text-right p-4 font-semibold text-gray-700">Orders</th>
						<th class="text-right p-4 font-semibold text-gray-700">Avg Revenue/Order</th>
					</tr>
				</thead>
				<tbody>
					{#each data.productPerformance.slice(0, 15) as product}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="p-4 font-medium text-gray-900">{product.productName}</td>
							<td class="p-4 text-right text-gray-700 font-semibold">{formatCurrency(product.revenue)}</td>
							<td class="p-4 text-right text-gray-600">{product.quantity}</td>
							<td class="p-4 text-right text-gray-600">{product.orders}</td>
							<td class="p-4 text-right text-gray-600">
								{formatCurrency(product.revenue / product.orders)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Category Performance Table -->
	<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
		<h2 class="text-2xl font-bold text-gray-900 mb-4">Category Performance</h2>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b-2 border-gray-200">
						<th class="text-left p-4 font-semibold text-gray-700">Category</th>
						<th class="text-right p-4 font-semibold text-gray-700">Revenue</th>
						<th class="text-right p-4 font-semibold text-gray-700">Quantity Sold</th>
						<th class="text-right p-4 font-semibold text-gray-700">Revenue Share</th>
					</tr>
				</thead>
				<tbody>
					{#each data.categoryPerformance as category}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="p-4 font-medium text-gray-900">{category.category}</td>
							<td class="p-4 text-right text-gray-700 font-semibold">{formatCurrency(category.revenue)}</td>
							<td class="p-4 text-right text-gray-600">{category.quantity}</td>
							<td class="p-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<div class="w-32 bg-gray-200 rounded-full h-2">
										<div
											class="bg-indigo-600 h-2 rounded-full"
											style="width: {(category.revenue / totalCategoryRevenue) * 100}%"
										></div>
									</div>
									<span class="text-gray-600 font-medium w-16 text-right">
										{((category.revenue / totalCategoryRevenue) * 100).toFixed(1)}%
									</span>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

