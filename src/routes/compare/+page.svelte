<!-- VIEW: Product comparison page -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { productService } from '$lib/services/ProductService';
	import type { Product } from '$lib/models/Product';
	import {
		getComparisonProducts,
		removeFromComparison,
		clearComparison,
		isInComparison
	} from '$lib/utils/comparison';

	let products: Product[] = [];
	let loading = true;
	let error: string | null = null;
	let comparisonIds: string[] = [];
	let aiInsights: any = null;
	let aiLoading = false;
	let showAIInsights = false;

	onMount(async () => {
		await loadComparisonProducts();
	});

	async function loadComparisonProducts() {
		loading = true;
		error = null;
		comparisonIds = getComparisonProducts();

		if (comparisonIds.length === 0) {
			loading = false;
			aiInsights = null;
			return;
		}

		try {
			const allProducts = await productService.getAllProducts();
			products = allProducts.filter((p) => comparisonIds.includes(p.id));
			
			// Sort products to match the order in comparisonIds
			products.sort((a, b) => {
				const indexA = comparisonIds.indexOf(a.id);
				const indexB = comparisonIds.indexOf(b.id);
				return indexA - indexB;
			});

			// Load AI insights if products are loaded
			if (products.length > 0) {
				await loadAIInsights();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load products';
		} finally {
			loading = false;
		}
	}

	async function loadAIInsights() {
		if (products.length === 0) return;

		aiLoading = true;
		try {
			const response = await fetch('/compare/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ productIds: products.map(p => p.id) })
			});

			if (response.ok) {
				const data = await response.json();
				aiInsights = data.insights;
				showAIInsights = true;
			} else {
				console.error('Failed to load AI insights');
			}
		} catch (err) {
			console.error('Error loading AI insights:', err);
		} finally {
			aiLoading = false;
		}
	}

	function toggleAIInsights() {
		if (!aiInsights && products.length > 0) {
			loadAIInsights();
		} else {
			showAIInsights = !showAIInsights;
		}
	}

	function getProductName(productId: string): string {
		return products.find(p => p.id === productId)?.name || 'Unknown';
	}

	function handleRemove(productId: string) {
		removeFromComparison(productId);
		loadComparisonProducts();
	}

	function handleClearAll() {
		if (confirm('Are you sure you want to clear all comparisons?')) {
			clearComparison();
			products = [];
			comparisonIds = [];
		}
	}

	function handleAddMore() {
		goto('/products');
	}
</script>

<svelte:head>
	<title>Compare Products - TinyTech</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-4 md:p-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl md:text-4xl font-bold text-gray-900">Compare Products</h1>
		{#if products.length > 0}
			<button
				on:click={handleClearAll}
				class="bg-red-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold hover:bg-red-700 transition-colors"
			>
				Clear All
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-600">Loading products...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{error}
		</div>
	{:else if products.length === 0}
		<div class="text-center py-12 bg-white rounded-lg border border-gray-200">
			<div class="text-6xl mb-4">📊</div>
			<h3 class="text-2xl font-bold text-gray-800 mb-2">No products to compare</h3>
			<p class="text-gray-600 mb-6">Add products to comparison to see them side by side</p>
			<button
				on:click={handleAddMore}
				class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer font-semibold hover:bg-indigo-700 transition-colors"
			>
				Browse Products
			</button>
		</div>
		{:else}
		<!-- AI Insights Section -->
		{#if products.length >= 2}
			<div class="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
				<!-- Header -->
				<div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="bg-white bg-opacity-20 p-2.5 rounded-lg">
								<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
								</svg>
							</div>
							<h2 class="text-xl font-bold text-white">AI Comparison Analysis</h2>
						</div>
						<button
							on:click={toggleAIInsights}
							class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-sm"
						>
							{#if aiLoading}
								<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Analyzing...
							{:else if showAIInsights}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
								</svg>
								Hide Insights
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
								Show AI Insights
							{/if}
						</button>
					</div>
				</div>

				<!-- Content -->
				<div class="p-6">
					{#if aiLoading}
						<div class="text-center py-12">
							<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
								<svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							</div>
							<p class="text-gray-600 font-medium">Analyzing products with AI...</p>
							<p class="text-sm text-gray-500 mt-2">This may take a few seconds</p>
						</div>
					{:else if showAIInsights && aiInsights}
						<div class="space-y-6">
							<!-- Summary Card -->
							<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
								<div class="flex items-start gap-3">
									<div class="bg-indigo-100 p-2.5 rounded-lg flex-shrink-0">
										<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
										</svg>
									</div>
									<div class="flex-1">
										<h3 class="text-lg font-bold text-gray-900 mb-2">Summary</h3>
										<p class="text-gray-700 leading-relaxed">{aiInsights.summary}</p>
									</div>
								</div>
							</div>

							<!-- Insights Grid -->
							<div class="grid md:grid-cols-2 gap-5">
								<!-- Best Value -->
								{#if aiInsights.bestValue}
									<div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md">
										<div class="flex items-center gap-3 mb-3">
											<div class="bg-green-500 p-2.5 rounded-lg">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
												</svg>
											</div>
											<h3 class="text-lg font-bold text-gray-900">Best Value for Money</h3>
										</div>
										<div class="mb-3">
											<p class="text-sm font-semibold text-green-700 mb-1">Recommended Product</p>
											<p class="text-base font-bold text-gray-900">{getProductName(aiInsights.bestValue.productId)}</p>
										</div>
										<p class="text-sm text-gray-700 leading-relaxed">{aiInsights.bestValue.reason}</p>
									</div>
								{/if}

								<!-- Best for Gaming -->
								{#if aiInsights.bestForGaming}
									<div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border-2 border-red-200 hover:border-red-300 transition-all shadow-sm hover:shadow-md">
										<div class="flex items-center gap-3 mb-3">
											<div class="bg-red-500 p-2.5 rounded-lg">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
												</svg>
											</div>
											<h3 class="text-lg font-bold text-gray-900">Best for Gaming</h3>
										</div>
										<div class="mb-3">
											<p class="text-sm font-semibold text-red-700 mb-1">Recommended Product</p>
											<p class="text-base font-bold text-gray-900">{getProductName(aiInsights.bestForGaming.productId)}</p>
										</div>
										<p class="text-sm text-gray-700 leading-relaxed">{aiInsights.bestForGaming.reason}</p>
									</div>
								{/if}

								<!-- Best for Work -->
								{#if aiInsights.bestForWork}
									<div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
										<div class="flex items-center gap-3 mb-3">
											<div class="bg-blue-500 p-2.5 rounded-lg">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
												</svg>
											</div>
											<h3 class="text-lg font-bold text-gray-900">Best for Work</h3>
										</div>
										<div class="mb-3">
											<p class="text-sm font-semibold text-blue-700 mb-1">Recommended Product</p>
											<p class="text-base font-bold text-gray-900">{getProductName(aiInsights.bestForWork.productId)}</p>
										</div>
										<p class="text-sm text-gray-700 leading-relaxed">{aiInsights.bestForWork.reason}</p>
									</div>
								{/if}

								<!-- Best Performance -->
								{#if aiInsights.bestPerformance}
									<div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border-2 border-purple-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md">
										<div class="flex items-center gap-3 mb-3">
											<div class="bg-purple-500 p-2.5 rounded-lg">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
												</svg>
											</div>
											<h3 class="text-lg font-bold text-gray-900">Best Performance</h3>
										</div>
										<div class="mb-3">
											<p class="text-sm font-semibold text-purple-700 mb-1">Recommended Product</p>
											<p class="text-base font-bold text-gray-900">{getProductName(aiInsights.bestPerformance.productId)}</p>
										</div>
										<p class="text-sm text-gray-700 leading-relaxed">{aiInsights.bestPerformance.reason}</p>
									</div>
								{/if}
							</div>

							<!-- AI Recommendation -->
							{#if aiInsights.recommendation}
								<div class="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-indigo-200">
									<div class="flex items-start gap-4">
										<div class="bg-yellow-400 p-3 rounded-lg flex-shrink-0 shadow-md">
											<svg class="w-6 h-6 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
											</svg>
										</div>
										<div class="flex-1">
											<h3 class="text-lg font-bold text-indigo-900 mb-2">AI Recommendation</h3>
											<p class="text-indigo-800 leading-relaxed">{aiInsights.recommendation}</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
			<div class="min-w-full">
				<!-- Comparison Table -->
				<table class="w-full">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-4 py-4 text-left text-sm font-semibold text-gray-900 w-48">Attribute</th>
							{#each products as product}
								<th class="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-[250px] relative">
									<button
										on:click={() => handleRemove(product.id)}
										class="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
										aria-label="Remove from comparison"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
									<div class="flex flex-col items-center">
										{#if product.image_url}
											<img
												src={product.image_url}
												alt={product.name}
												class="w-32 h-32 object-cover rounded-lg mb-3 border border-gray-200"
												on:error={(e) => {
													e.currentTarget.style.display = 'none';
												}}
											/>
										{:else}
											<div class="w-32 h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
												<span class="text-gray-400 text-xs">No image</span>
											</div>
										{/if}
										<a
											href="/products/{product.id}"
											class="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors no-underline mb-2"
										>
											{product.name}
										</a>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						<!-- Description -->
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-4 text-sm font-medium text-gray-700">Description</td>
							{#each products as product}
								<td class="px-4 py-4 text-sm text-gray-600 text-center">
									{product.description || 'No description'}
								</td>
							{/each}
						</tr>

						<!-- Price -->
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-4 text-sm font-medium text-gray-700">Price</td>
							{#each products as product}
								<td class="px-4 py-4 text-center">
									<span class="text-2xl font-bold text-indigo-600">
										Tk {product.price.toFixed(2)}
									</span>
								</td>
							{/each}
						</tr>

						<!-- Stock Status -->
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-4 text-sm font-medium text-gray-700">Stock Status</td>
							{#each products as product}
								<td class="px-4 py-4 text-center">
									{#if product.stock > 0}
										<span class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
											<span>✓</span>
											<span>In Stock ({product.stock} {product.stock === 1 ? 'item' : 'items'})</span>
										</span>
									{:else}
										<span class="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
											<span>✕</span>
											<span>Out of Stock</span>
										</span>
									{/if}
								</td>
							{/each}
						</tr>

						<!-- Actions -->
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-4 text-sm font-medium text-gray-700">Actions</td>
							{#each products as product}
								<td class="px-4 py-4 text-center">
									<div class="flex flex-col gap-2 items-center">
										<a
											href="/products/{product.id}"
											class="w-full flex items-center justify-center px-4 py-2 rounded-lg no-underline text-sm font-semibold bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
										>
											View Details
										</a>
										{#if product.stock > 0}
											<form method="POST" action="/cart/add" class="w-full">
												<input type="hidden" name="product_id" value={product.id} />
												<input type="hidden" name="quantity" value="1" />
												<button
													type="submit"
													class="w-full bg-green-600 text-white border-none px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold hover:bg-green-700 transition-colors"
												>
													Add to Cart
												</button>
											</form>
										{/if}
									</div>
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		{#if products.length < 4}
			<div class="mt-6 text-center">
				<button
					on:click={handleAddMore}
					class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer font-semibold hover:bg-indigo-700 transition-colors"
				>
					Add More Products to Compare
				</button>
			</div>
		{/if}
	{/if}
</div>

