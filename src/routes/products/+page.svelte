<!-- VIEW: Products page (public) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import {
		addToComparison,
		removeFromComparison,
		isInComparison,
		getComparisonCount
	} from '$lib/utils/comparison';

	export let data: PageData;
	export const params = {};

	let searchInput = data.searchQuery || '';
	let showPopup = false;
	let popupMessage = '';
	let popupType: 'success' | 'error' = 'success';
	let popupTimeout: ReturnType<typeof setTimeout> | null = null;
	let comparisonStates: Record<string, boolean> = {};
	let comparisonCount = 0;

	onMount(() => {
		updateComparisonStates();
		updateComparisonCount();
	});

	function updateComparisonStates() {
		data.products.forEach((product) => {
			comparisonStates[product.id] = isInComparison(product.id);
		});
	}

	function updateComparisonCount() {
		comparisonCount = getComparisonCount();
	}

	function handleCompareToggle(productId: string) {
		if (comparisonStates[productId]) {
			removeFromComparison(productId);
			comparisonStates[productId] = false;
			showPopupMessage('Removed from comparison', 'success');
		} else {
			const result = addToComparison(productId);
			if (result.success) {
				comparisonStates[productId] = true;
				showPopupMessage(result.message, 'success');
			} else {
				showPopupMessage(result.message, 'error');
			}
		}
		updateComparisonCount();
	}

	function showPopupMessage(message: string, type: 'success' | 'error' = 'success') {
		popupMessage = message;
		popupType = type;
		showPopup = true;
		if (popupTimeout) clearTimeout(popupTimeout);
		popupTimeout = setTimeout(() => {
			showPopup = false;
		}, 3000);
	}

	function closePopup() {
		showPopup = false;
		if (popupTimeout) clearTimeout(popupTimeout);
	}

	function handleSearch() {
		const url = new URL(window.location.href);
		if (searchInput.trim()) {
			url.searchParams.set('search', searchInput.trim());
		} else {
			url.searchParams.delete('search');
		}
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function clearSearch() {
		searchInput = '';
		const url = new URL(window.location.href);
		url.searchParams.delete('search');
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	// Update search input when URL changes
	$: {
		if (data.searchQuery !== searchInput) {
			searchInput = data.searchQuery || '';
		}
	}
</script>

<svelte:head>
	<title>Products - Shop</title>
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
	<!-- Popup Modal -->
	{#if showPopup}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" on:click={closePopup} on:keydown={(e) => e.key === 'Escape' && closePopup()}>
			<div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all" on:click|stopPropagation>
				<div class="p-6 text-center">
					<div class="mb-4">
						{#if popupType === 'success'}
							<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
								<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
						{:else}
							<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
								<svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
								</svg>
							</div>
						{/if}
					</div>
					<h3 class="text-xl font-bold mb-2 {popupType === 'success' ? 'text-green-800' : 'text-red-800'}">
						{popupType === 'success' ? 'Success!' : 'Error!'}
					</h3>
					<p class="text-gray-700 mb-6">{popupMessage}</p>
					<button
						on:click={closePopup}
						class="px-6 py-2 {popupType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg font-semibold transition-colors"
					>
						OK
					</button>
				</div>
			</div>
		</div>
	{/if}
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header Section -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl mb-4 font-bold text-gray-900">Our Products</h1>
			<p class="text-gray-600 text-lg">Discover amazing products at great prices</p>
		</div>

		<!-- Search Bar -->
		<div class="mb-8">
			<form
				on:submit|preventDefault={handleSearch}
				class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
			>
				<div class="flex-1 relative">
					<input
						type="text"
						bind:value={searchInput}
						placeholder="🔍 Search products by name or description..."
						class="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-base"
					/>
					{#if searchInput}
						<button
							type="button"
							on:click={clearSearch}
							class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
							aria-label="Clear search"
						>
							×
						</button>
					{/if}
				</div>
				<button
					type="submit"
					class="bg-indigo-600 text-white border-none px-6 py-4 rounded-lg cursor-pointer transition-colors hover:bg-indigo-700 font-semibold"
				>
					Search
				</button>
			</form>
			{#if data.searchQuery}
				<div class="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
					<span>🔍</span>
					<span>Found {data.products.length} {data.products.length === 1 ? 'result' : 'results'} for "{data.searchQuery}"</span>
				</div>
			{/if}
		</div>

		<!-- Messages -->
		{#if data.success}
			<div class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 shadow-lg">
				<div class="flex items-center gap-2">
					<span>✅</span>
					<span>{data.success}</span>
				</div>
			</div>
		{/if}

		{#if data.error}
			<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 shadow-lg">
				<div class="flex items-center gap-2">
					<span>❌</span>
					<span>{data.error}</span>
				</div>
			</div>
		{/if}

		<!-- Products Grid -->
		{#if data.products.length === 0}
			<div class="text-center p-12 bg-white rounded-lg">
				<div class="text-6xl mb-4">🔍</div>
				<h3 class="text-2xl font-bold text-gray-800 mb-2">
					{data.searchQuery ? 'No products found' : 'No products available'}
				</h3>
				<p class="text-gray-600">
					{data.searchQuery
						? `We couldn't find any products matching "${data.searchQuery}". Try a different search term.`
						: 'Check back soon for new products!'}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
				{#each data.products as product (product.id)}
					<div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
						<!-- Product Image -->
						<div class="h-64 relative bg-gray-100 overflow-hidden">
							{#if product.image_url}
								<img
									src={product.image_url}
									alt={product.name}
									class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
									on:error={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							{:else}
								<div class="w-full h-full bg-gray-200 flex items-center justify-center">
									<span class="text-gray-400 text-sm">No image</span>
								</div>
							{/if}
							
							<!-- Stock Badge -->
							<div class="absolute top-3 right-3">
								{#if product.stock > 0}
									<span class="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
										<span>✓</span>
										<span>In Stock</span>
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
										<span>✕</span>
										<span>Out of Stock</span>
									</span>
								{/if}
							</div>
						</div>

						<!-- Product Info -->
						<div class="p-5 flex flex-col flex-1">
							<h3 class="m-0 mb-2 text-lg font-bold text-gray-900 line-clamp-2 h-14">
								{product.name}
							</h3>
							<p class="text-sm mb-3 text-gray-600 line-clamp-2 h-10">
								{product.description || 'No description available'}
							</p>
							
							<!-- Price and Stock -->
							<div class="mb-4 flex-shrink-0">
								<p class="text-2xl font-bold mb-1 text-gray-900">
									Tk {product.price.toFixed(2)}
								</p>
								{#if product.stock > 0}
									<p class="text-xs text-gray-500 font-medium">
										{product.stock} {product.stock === 1 ? 'item' : 'items'} available
									</p>
								{/if}
							</div>

							<!-- Compare Button -->
							<div class="mb-3">
								<button
									type="button"
									on:click={() => handleCompareToggle(product.id)}
									class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors {comparisonStates[product.id]
										? 'bg-indigo-600 text-white hover:bg-indigo-700'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									{comparisonStates[product.id] ? 'Remove from Compare' : 'Add to Compare'}
								</button>
							</div>

							<!-- Action Buttons -->
							<div class="flex gap-2 mt-auto">
								<a
									href="/products/{product.id}"
									class="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg no-underline text-sm font-semibold bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
								>
									View Details
								</a>
								{#if product.stock > 0}
									<form 
										method="POST" 
										action="/cart/add" 
										use:enhance={({ result }) => {
											return async () => {
												if (result.type === 'success') {
													try {
														const data = await result.json();
														if (data.success) {
															showPopupMessage('Added to cart successfully!', 'success');
														} else {
															showPopupMessage(data.error || 'Failed to add to cart', 'error');
														}
													} catch (e) {
														showPopupMessage('Added to cart successfully!', 'success');
													}
												} else if (result.type === 'failure') {
													showPopupMessage('Failed to add to cart. Please try again.', 'error');
												}
											};
										}}
										class="flex-1"
									>
										<input type="hidden" name="product_id" value={product.id} />
										<input type="hidden" name="quantity" value="1" />
										<button
											type="submit"
											class="w-full bg-green-600 text-white border-none px-4 py-2.5 rounded-lg cursor-pointer text-sm font-semibold hover:bg-green-700 transition-colors"
										>
											Add to Cart
										</button>
									</form>
								{:else}
									<button
										disabled
										class="flex-1 bg-gray-200 text-gray-500 border-none px-4 py-2.5 rounded-lg cursor-not-allowed text-sm font-semibold"
									>
										Out of Stock
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

