<!-- VIEW: KPI Dashboard - Business Intelligence -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Chart from 'chart.js/auto';

	export let data: PageData;
	export let params: Record<string, string> = {};

	let conversionChart: Chart | null = null;
	let aovChart: Chart | null = null;
	let retentionChart: Chart | null = null;
	let marginChart: Chart | null = null;
	let comparisonChart: Chart | null = null;

	let selectedPeriod = data.period || 'month';
	let showComparison = false;
	let startDate = '';
	let endDate = '';
	let selectedCategory: string | null = null;
	let selectedProduct: string | null = null;
	let showDrillDown = false;
	let drillDownData: any = null;
	let drillDownType: 'category' | 'product' | 'segment' | null = null;

	let conversionCanvas: HTMLCanvasElement;
	let aovCanvas: HTMLCanvasElement;
	let retentionCanvas: HTMLCanvasElement;
	let marginCanvas: HTMLCanvasElement;
	let comparisonCanvas: HTMLCanvasElement;

	onMount(() => {
		setTimeout(() => {
			initConversionChart();
			initAOVChart();
			initRetentionChart();
			initMarginChart();
			if (data.timeComparisons) {
				initComparisonChart();
			}
		}, 100);
	});

	function initConversionChart() {
		if (!conversionCanvas) return;
		const ctx = conversionCanvas.getContext('2d');
		if (!ctx) return;

		if (conversionChart) conversionChart.destroy();

		const labels = data.conversionTrends.map((t) => t.date);
		const rates = data.conversionTrends.map((t) => t.rate);

		conversionChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Conversion Rate (%)',
						data: rates,
						borderColor: 'rgb(99, 102, 241)',
						backgroundColor: 'rgba(99, 102, 241, 0.1)',
						tension: 0.4,
						fill: true
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'top' },
					title: { display: true, text: 'Conversion Rate Trends' }
				},
				scales: {
					y: {
						beginAtZero: true,
						title: { display: true, text: 'Conversion Rate (%)' }
					}
				}
			}
		});
	}

	function initAOVChart() {
		if (!aovCanvas) return;
		const ctx = aovCanvas.getContext('2d');
		if (!ctx) return;

		if (aovChart) aovChart.destroy();

		const labels = data.aovTrends.map((t) => t.date);
		const aovs = data.aovTrends.map((t) => t.aov);

		aovChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Average Order Value (Tk)',
						data: aovs,
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
					title: { display: true, text: 'Average Order Value Trends' }
				},
				scales: {
					y: {
						beginAtZero: true,
						title: { display: true, text: 'AOV (Tk)' }
					}
				}
			}
		});
	}

	function initRetentionChart() {
		if (!retentionCanvas) return;
		const ctx = retentionCanvas.getContext('2d');
		if (!ctx) return;

		if (retentionChart) retentionChart.destroy();

		const segments = data.retentionMetrics.customerSegments;
		const labels = ['Champions', 'Loyal', 'At Risk', 'New', 'Lost'];
		const values = [
			segments.champions,
			segments.loyal,
			segments.atRisk,
			segments.new,
			segments.lost
		];

		retentionChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						data: values,
						backgroundColor: [
							'rgba(34, 197, 94, 0.8)',
							'rgba(59, 130, 246, 0.8)',
							'rgba(251, 146, 60, 0.8)',
							'rgba(139, 92, 246, 0.8)',
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
					title: { display: true, text: 'Customer Segments (RFM Analysis)' }
				}
			}
		});
	}

	function initMarginChart() {
		if (!marginCanvas) return;
		const ctx = marginCanvas.getContext('2d');
		if (!ctx) return;

		if (marginChart) marginChart.destroy();

		const categories = data.grossMarginAnalysis.marginByCategory.slice(0, 10);
		const labels = categories.map((c) => c.category);
		const margins = categories.map((c) => c.margin);

		marginChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Gross Margin (%)',
						data: margins,
						backgroundColor: (context) => {
							const value = context.parsed.y;
							if (value >= 30) return 'rgba(34, 197, 94, 0.8)';
							if (value >= 20) return 'rgba(251, 146, 60, 0.8)';
							return 'rgba(239, 68, 68, 0.8)';
						},
						borderColor: (context) => {
							const value = context.parsed.y;
							if (value >= 30) return 'rgb(34, 197, 94)';
							if (value >= 20) return 'rgb(251, 146, 60)';
							return 'rgb(239, 68, 68)';
						},
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: { display: false },
					title: { display: true, text: 'Gross Margin by Category' }
				},
				scales: {
					x: {
						beginAtZero: true,
						title: { display: true, text: 'Margin (%)' }
					}
				},
				onClick: (event, elements) => {
					if (elements.length > 0) {
						const index = elements[0].index;
						const category = data.grossMarginAnalysis.marginByCategory[index];
						if (category) {
							drillDownType = 'category';
							drillDownData = category;
							selectedCategory = category.category;
							showDrillDown = true;
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

		if (comparisonChart) comparisonChart.destroy();

		const { currentPeriod, previousPeriod } = data.timeComparisons;

		comparisonChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['Conversion Rate', 'AOV', 'Retention', 'Gross Margin'],
				datasets: [
					{
						label: 'Current Period',
						data: [
							currentPeriod.conversionRate,
							currentPeriod.averageOrderValue,
							currentPeriod.customerRetention,
							currentPeriod.grossMargin
						],
						backgroundColor: 'rgba(99, 102, 241, 0.8)',
						borderColor: 'rgb(99, 102, 241)',
						borderWidth: 2
					},
					{
						label: 'Previous Period',
						data: [
							previousPeriod.conversionRate,
							previousPeriod.averageOrderValue,
							previousPeriod.customerRetention,
							previousPeriod.grossMargin
						],
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
					legend: { position: 'top' },
					title: { display: true, text: 'Period Comparison' }
				},
				scales: {
					y: { beginAtZero: true }
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
		window.location.href = `/admin/kpi-dashboard?${params.toString()}`;
	}

	function exportChart(chart: Chart | null, filename: string) {
		if (!chart) return;
		const url = chart.toBase64Image();
		const link = document.createElement('a');
		link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
		link.href = url;
		link.click();
	}

	function formatCurrency(value: number): string {
		return `Tk ${value.toFixed(2)}`;
	}

	function formatPercentage(value: number): string {
		return `${value.toFixed(2)}%`;
	}

	function getTrendIndicator(current: number, previous: number): { text: string; color: string } {
		if (previous === 0) return { text: 'N/A', color: 'gray' };
		const change = ((current - previous) / previous) * 100;
		if (change > 0) return { text: `+${change.toFixed(1)}%`, color: 'green' };
		if (change < 0) return { text: `${change.toFixed(1)}%`, color: 'red' };
		return { text: '0%', color: 'gray' };
	}

	function drillDownToCategory(category: string) {
		drillDownType = 'category';
		selectedCategory = category;
		drillDownData = data.grossMarginAnalysis.marginByCategory.find((c) => c.category === category);
		showDrillDown = true;
	}

	function drillDownToProduct(productName: string) {
		drillDownType = 'product';
		selectedProduct = productName;
		drillDownData = data.grossMarginAnalysis.marginByProduct.find((p) => p.productName === productName);
		showDrillDown = true;
	}

	function drillDownToSegment(segment: string) {
		drillDownType = 'segment';
		drillDownData = {
			name: segment,
			count: data.retentionMetrics.customerSegments[segment.toLowerCase() as keyof typeof data.retentionMetrics.customerSegments] || 0
		};
		showDrillDown = true;
	}

	function closeDrillDown() {
		showDrillDown = false;
		drillDownData = null;
		drillDownType = null;
		selectedCategory = null;
		selectedProduct = null;
	}
</script>

<svelte:head>
	<title>KPI Dashboard - Business Intelligence</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">KPI Dashboard</h1>
			<p class="text-gray-600">Business Intelligence & Key Performance Indicators</p>
		</div>

		<!-- Period Selector -->
		<div class="flex items-center gap-4 flex-wrap">
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

	<!-- KPI Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
		<!-- Conversion Rate -->
		<div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-blue-100 uppercase tracking-wide">Conversion Rate</h3>
				<svg class="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatPercentage(data.kpis.conversionRate)}</p>
			{#if data.timeComparisons}
				{@const trend = getTrendIndicator(data.kpis.conversionRate, data.timeComparisons.previousPeriod.conversionRate)}
				<p class="text-sm text-blue-100 mt-1">
					<span class="font-semibold {trend.color === 'green' ? 'text-green-200' : trend.color === 'red' ? 'text-red-200' : 'text-gray-200'}">
						{trend.text}
					</span> vs previous period
				</p>
			{/if}
		</div>

		<!-- Average Order Value -->
		<div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-green-100 uppercase tracking-wide">Average Order Value</h3>
				<svg class="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatCurrency(data.kpis.averageOrderValue)}</p>
			{#if data.timeComparisons}
				{@const trend = getTrendIndicator(data.kpis.averageOrderValue, data.timeComparisons.previousPeriod.averageOrderValue)}
				<p class="text-sm text-green-100 mt-1">
					<span class="font-semibold {trend.color === 'green' ? 'text-green-200' : trend.color === 'red' ? 'text-red-200' : 'text-gray-200'}">
						{trend.text}
					</span> vs previous period
				</p>
			{/if}
		</div>

		<!-- Customer Retention -->
		<div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-purple-100 uppercase tracking-wide">Customer Retention</h3>
				<svg class="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatPercentage(data.kpis.customerRetention)}</p>
			<p class="text-sm text-purple-100 mt-1">{data.retentionMetrics.repeatCustomers} repeat customers</p>
		</div>

		<!-- Gross Margin -->
		<div class="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-orange-100 uppercase tracking-wide">Gross Margin</h3>
				<svg class="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatPercentage(data.kpis.grossMargin)}</p>
			{#if data.timeComparisons}
				{@const trend = getTrendIndicator(data.kpis.grossMargin, data.timeComparisons.previousPeriod.grossMargin)}
				<p class="text-sm text-orange-100 mt-1">
					<span class="font-semibold {trend.color === 'green' ? 'text-green-200' : trend.color === 'red' ? 'text-red-200' : 'text-gray-200'}">
						{trend.text}
					</span> vs previous period
				</p>
			{/if}
		</div>

		<!-- Repeat Customer Rate -->
		<div class="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-indigo-100 uppercase tracking-wide">Repeat Customer Rate</h3>
				<svg class="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatPercentage(data.kpis.repeatCustomerRate)}</p>
			<p class="text-sm text-indigo-100 mt-1">Customer loyalty metric</p>
		</div>

		<!-- Customer Lifetime Value -->
		<div class="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-lg text-white">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-semibold text-pink-100 uppercase tracking-wide">Customer Lifetime Value</h3>
				<svg class="w-6 h-6 text-pink-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
			</div>
			<p class="text-3xl font-bold">{formatCurrency(data.kpis.customerLifetimeValue)}</p>
			<p class="text-sm text-pink-100 mt-1">Average revenue per customer</p>
		</div>
	</div>

	<!-- Charts Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Conversion Rate Chart -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold text-gray-900">Conversion Rate Trends</h2>
				<button
					on:click={() => exportChart(conversionChart, 'conversion-rate')}
					class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Export
				</button>
			</div>
			<div class="h-80">
				<canvas bind:this={conversionCanvas}></canvas>
			</div>
		</div>

		<!-- AOV Chart -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold text-gray-900">Average Order Value Trends</h2>
				<button
					on:click={() => exportChart(aovChart, 'aov-trends')}
					class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Export
				</button>
			</div>
			<div class="h-80">
				<canvas bind:this={aovCanvas}></canvas>
			</div>
		</div>

		<!-- Customer Retention Chart -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold text-gray-900">Customer Segments</h2>
				<button
					on:click={() => exportChart(retentionChart, 'customer-segments')}
					class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Export
				</button>
			</div>
			<div class="h-80">
				<canvas bind:this={retentionCanvas}></canvas>
			</div>
			<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
				<button
					on:click={() => drillDownToSegment('champions')}
					class="bg-green-50 p-3 rounded-lg hover:bg-green-100 transition-colors cursor-pointer text-left"
				>
					<p class="font-semibold text-green-700">Champions</p>
					<p class="text-2xl font-bold text-green-600">{data.retentionMetrics.customerSegments.champions}</p>
					<p class="text-xs text-green-600 mt-1">Click to view details →</p>
				</button>
				<button
					on:click={() => drillDownToSegment('loyal')}
					class="bg-blue-50 p-3 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer text-left"
				>
					<p class="font-semibold text-blue-700">Loyal</p>
					<p class="text-2xl font-bold text-blue-600">{data.retentionMetrics.customerSegments.loyal}</p>
					<p class="text-xs text-blue-600 mt-1">Click to view details →</p>
				</button>
				<button
					on:click={() => drillDownToSegment('atRisk')}
					class="bg-yellow-50 p-3 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer text-left"
				>
					<p class="font-semibold text-yellow-700">At Risk</p>
					<p class="text-2xl font-bold text-yellow-600">{data.retentionMetrics.customerSegments.atRisk}</p>
					<p class="text-xs text-yellow-600 mt-1">Click to view details →</p>
				</button>
				<button
					on:click={() => drillDownToSegment('lost')}
					class="bg-red-50 p-3 rounded-lg hover:bg-red-100 transition-colors cursor-pointer text-left"
				>
					<p class="font-semibold text-red-700">Lost</p>
					<p class="text-2xl font-bold text-red-600">{data.retentionMetrics.customerSegments.lost}</p>
					<p class="text-xs text-red-600 mt-1">Click to view details →</p>
				</button>
			</div>
		</div>

		<!-- Gross Margin Chart -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold text-gray-900">Gross Margin by Category</h2>
				<button
					on:click={() => exportChart(marginChart, 'gross-margin')}
					class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Export
				</button>
			</div>
			<div class="h-80">
				<canvas bind:this={marginCanvas}></canvas>
			</div>
		</div>
	</div>

	<!-- Period Comparison Chart -->
	{#if data.timeComparisons}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-2xl font-bold text-gray-900">Period Comparison</h2>
				<button
					on:click={() => exportChart(comparisonChart, 'period-comparison')}
					class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Export
				</button>
			</div>
			<div class="h-96">
				<canvas bind:this={comparisonCanvas}></canvas>
			</div>
		</div>
	{/if}

	<!-- Detailed Tables -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Gross Margin by Product -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Top Products by Gross Margin</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b-2 border-gray-200">
							<th class="text-left p-4 font-semibold text-gray-700">Product</th>
							<th class="text-right p-4 font-semibold text-gray-700">Margin</th>
							<th class="text-right p-4 font-semibold text-gray-700">Revenue</th>
						</tr>
					</thead>
					<tbody>
						{#each data.grossMarginAnalysis.marginByProduct.slice(0, 10) as product}
							<tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" on:click={() => drillDownToProduct(product.productName)}>
								<td class="p-4 font-medium text-gray-900">{product.productName}</td>
								<td class="p-4 text-right">
									<span class="font-semibold {product.margin >= 30 ? 'text-green-600' : product.margin >= 20 ? 'text-yellow-600' : 'text-red-600'}">
										{formatPercentage(product.margin)}
									</span>
								</td>
								<td class="p-4 text-right text-gray-700">{formatCurrency(product.revenue)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Gross Margin by Category -->
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
			<h2 class="text-2xl font-bold text-gray-900 mb-4">Gross Margin by Category</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b-2 border-gray-200">
							<th class="text-left p-4 font-semibold text-gray-700">Category</th>
							<th class="text-right p-4 font-semibold text-gray-700">Margin</th>
							<th class="text-right p-4 font-semibold text-gray-700">Revenue</th>
						</tr>
					</thead>
					<tbody>
						{#each data.grossMarginAnalysis.marginByCategory as category}
							<tr 
								class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" 
								on:click={() => drillDownToCategory(category.category)}
								on:keydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										drillDownToCategory(category.category);
									}
								}}
								role="button"
								tabindex="0"
								aria-label="View details for {category.category}"
							>
								<td class="p-4 font-medium text-gray-900">{category.category}</td>
								<td class="p-4 text-right">
									<span class="font-semibold {category.margin >= 30 ? 'text-green-600' : category.margin >= 20 ? 'text-yellow-600' : 'text-red-600'}">
										{formatPercentage(category.margin)}
									</span>
								</td>
								<td class="p-4 text-right text-gray-700">{formatCurrency(category.revenue)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Customer Retention Details -->
	<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
		<h2 class="text-2xl font-bold text-gray-900 mb-4">Customer Retention Metrics</h2>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div class="bg-blue-50 p-4 rounded-lg">
				<p class="text-sm font-semibold text-blue-700 mb-1">Retention Rate</p>
				<p class="text-3xl font-bold text-blue-600">{formatPercentage(data.retentionMetrics.retentionRate)}</p>
			</div>
			<div class="bg-green-50 p-4 rounded-lg">
				<p class="text-sm font-semibold text-green-700 mb-1">Repeat Customers</p>
				<p class="text-3xl font-bold text-green-600">{data.retentionMetrics.repeatCustomers}</p>
			</div>
			<div class="bg-purple-50 p-4 rounded-lg">
				<p class="text-sm font-semibold text-purple-700 mb-1">New Customers</p>
				<p class="text-3xl font-bold text-purple-600">{data.retentionMetrics.newCustomers}</p>
			</div>
			<div class="bg-red-50 p-4 rounded-lg">
				<p class="text-sm font-semibold text-red-700 mb-1">Lost Customers</p>
				<p class="text-3xl font-bold text-red-600">{data.retentionMetrics.lostCustomers}</p>
			</div>
		</div>
	</div>

	<!-- Drill-Down Modal -->
	{#if showDrillDown && drillDownData}
		<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" on:click={closeDrillDown}>
			<div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
				<div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
					<h3 class="text-2xl font-bold text-gray-900">
						{#if drillDownType === 'category'}
							Category: {drillDownData.category}
						{:else if drillDownType === 'product'}
							Product: {drillDownData.productName}
						{:else if drillDownType === 'segment'}
							Segment: {drillDownData.name}
						{/if}
					</h3>
					<button
						on:click={closeDrillDown}
						class="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				<div class="p-6">
					{#if drillDownType === 'category'}
						<div class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="bg-blue-50 p-4 rounded-lg">
									<p class="text-sm font-semibold text-blue-700 mb-1">Gross Margin</p>
									<p class="text-2xl font-bold text-blue-600">{formatPercentage(drillDownData.margin)}</p>
								</div>
								<div class="bg-green-50 p-4 rounded-lg">
									<p class="text-sm font-semibold text-green-700 mb-1">Total Revenue</p>
									<p class="text-2xl font-bold text-green-600">{formatCurrency(drillDownData.revenue)}</p>
								</div>
							</div>
							<div class="bg-gray-50 p-4 rounded-lg">
								<p class="text-sm text-gray-600">
									This category contributes <strong>{formatPercentage((drillDownData.revenue / data.grossMarginAnalysis.marginByCategory.reduce((sum, c) => sum + c.revenue, 0)) * 100)}</strong> of total revenue.
								</p>
							</div>
							<div>
								<h4 class="font-semibold text-gray-900 mb-2">Products in this category:</h4>
								<ul class="space-y-2">
									{#each data.grossMarginAnalysis.marginByProduct.filter((p) => p.productName.includes(drillDownData.category)) as product}
										<li class="flex items-center justify-between p-2 bg-gray-50 rounded">
											<span class="text-gray-700">{product.productName}</span>
											<span class="font-semibold text-gray-900">{formatCurrency(product.revenue)}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{:else if drillDownType === 'product'}
						<div class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="bg-blue-50 p-4 rounded-lg">
									<p class="text-sm font-semibold text-blue-700 mb-1">Gross Margin</p>
									<p class="text-2xl font-bold text-blue-600">{formatPercentage(drillDownData.margin)}</p>
								</div>
								<div class="bg-green-50 p-4 rounded-lg">
									<p class="text-sm font-semibold text-green-700 mb-1">Total Revenue</p>
									<p class="text-2xl font-bold text-green-600">{formatCurrency(drillDownData.revenue)}</p>
								</div>
							</div>
							<div class="bg-gray-50 p-4 rounded-lg">
								<p class="text-sm text-gray-600">
									Margin Status: 
									<span class="font-semibold {drillDownData.margin >= 30 ? 'text-green-600' : drillDownData.margin >= 20 ? 'text-yellow-600' : 'text-red-600'}">
										{drillDownData.margin >= 30 ? 'Excellent' : drillDownData.margin >= 20 ? 'Good' : 'Needs Improvement'}
									</span>
								</p>
							</div>
						</div>
					{:else if drillDownType === 'segment'}
						<div class="space-y-4">
							<div class="bg-blue-50 p-4 rounded-lg">
								<p class="text-sm font-semibold text-blue-700 mb-1">Customer Count</p>
								<p class="text-3xl font-bold text-blue-600">{drillDownData.count}</p>
							</div>
							<div class="bg-gray-50 p-4 rounded-lg">
								<p class="text-sm text-gray-600">
									{#if drillDownData.name === 'champions'}
										Champions are your best customers - they buy frequently, spend high amounts, and have made recent purchases. Focus on retention and upselling.
									{:else if drillDownData.name === 'loyal'}
										Loyal customers have made multiple purchases and show consistent engagement. Consider loyalty programs to increase frequency.
									{:else if drillDownData.name === 'atRisk'}
										At-risk customers haven't purchased recently but have a history with you. Re-engagement campaigns are recommended.
									{:else if drillDownData.name === 'lost'}
										Lost customers haven't purchased in a long time. Consider win-back campaigns or survey to understand why they left.
									{/if}
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

