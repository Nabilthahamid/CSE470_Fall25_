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

	onMount(async () => {
		await loadComparisonProducts();
	});

	async function loadComparisonProducts() {
		loading = true;
		error = null;
		comparisonIds = getComparisonProducts();

		if (comparisonIds.length === 0) {
			loading = false;
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
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load products';
		} finally {
			loading = false;
		}
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
	<title>Compare Products - Shop</title>
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

