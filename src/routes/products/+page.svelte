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
	import { toast } from '$lib/stores/toast';

	export let data: PageData;
	// params not used - suppress warning
	// export let params: Record<string, string> = {};

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

	// Calculate discount percentage (can be based on cost_price or a fixed discount)
	function calculateDiscount(product: any): { discountPercent: number; originalPrice: number; discountedPrice: number } {
		// If cost_price exists and is less than price, calculate discount
		// Otherwise, apply a random discount between 5-15% for demo purposes
		const originalPrice = product.price;
		let discountPercent = 0;
		
		if (product.cost_price && product.cost_price < originalPrice) {
			// Calculate discount based on cost_price (assuming markup)
			discountPercent = Math.round(((originalPrice - product.cost_price * 1.1) / originalPrice) * 100);
			discountPercent = Math.max(5, Math.min(15, discountPercent)); // Clamp between 5-15%
		} else {
			// Use product ID to generate consistent discount (5-15%)
			const hash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
			discountPercent = 5 + (hash % 11); // 5-15%
		}
		
		const discountedPrice = originalPrice * (1 - discountPercent / 100);
		
		return {
			discountPercent,
			originalPrice,
			discountedPrice: Math.round(discountedPrice * 100) / 100
		};
	}

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
			toast.success('Removed from comparison');
		} else {
			const result = addToComparison(productId);
			if (result.success) {
				comparisonStates[productId] = true;
				toast.success(result.message);
			} else {
				toast.error(result.message);
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
			url.searchParams.delete('category'); // Clear category when searching
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
	<title>Products - TinyTech</title>
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
	<!-- Popup Modal -->
	{#if showPopup}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
			role="dialog"
			aria-modal="true"
			aria-labelledby="popup-title"
			tabindex="-1"
			on:click={closePopup} 
			on:keydown={(e) => e.key === 'Escape' && closePopup()}
		>
			<div 
				class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all" 
				role="document"
				on:click|stopPropagation
				on:keydown|stopPropagation
			>
				<div class="p-6 text-center">
					<h2 id="popup-title" class="sr-only">{popupType === 'success' ? 'Success' : 'Error'}</h2>
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
			<h1 class="text-4xl md:text-5xl mb-4 font-bold text-gray-900">
				{#if data.category}
					{data.category.display_name}
				{:else}
					Our Products
				{/if}
			</h1>
			<p class="text-gray-600 text-lg">
				{#if data.category}
					Products in {data.category.display_name} category
				{:else}
					Discover amazing products at great prices
				{/if}
			</p>
			{#if data.category}
				<div class="mt-4">
					<a
						href="/products"
						class="inline-block text-indigo-600 hover:text-indigo-700 underline text-sm font-medium"
					>
						← View All Products
					</a>
				</div>
			{/if}
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
					{@const discount = calculateDiscount(product)}
					<div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
						<!-- Product Image -->
						<div class="h-64 relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
							{#if product.image_url}
								<img
									src={product.image_url}
									alt={product.name}
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
									on:error={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							{:else}
								<div class="w-full h-full bg-gray-200 flex items-center justify-center">
									<span class="text-gray-400 text-sm">No image</span>
								</div>
							{/if}
							
							<!-- Discount Badge (Bottom Left) -->
							{#if discount.discountPercent > 0}
								<div class="absolute bottom-3 left-3 z-10">
									<span class="inline-flex items-center justify-center bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
										{discount.discountPercent}% OFF
									</span>
								</div>
							{/if}
							
							<!-- Stock Badge (Top Right) -->
							<div class="absolute top-3 right-3 z-10">
								{#if product.stock > 0}
									<span class="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
										<span class="text-sm">✓</span>
										<span>In Stock</span>
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
										<span class="text-sm">✕</span>
										<span>Out of Stock</span>
									</span>
								{/if}
							</div>
						</div>

						<!-- Product Info -->
						<div class="p-6 flex flex-col flex-1 bg-gradient-to-b from-white to-gray-50">
							<h3 class="m-0 mb-2 text-lg font-bold text-gray-900 line-clamp-2 h-14 group-hover:text-indigo-600 transition-colors">
								{product.name}
							</h3>
							{#if product.brand}
								<p class="text-xs text-indigo-600 font-bold mb-2 uppercase tracking-wide">{product.brand}</p>
							{/if}
							
							<!-- Price Display -->
							<div class="mb-4 flex-shrink-0 pb-4 border-b border-gray-200">
								{#if discount.discountPercent > 0}
									<div class="flex items-baseline gap-2 mb-1">
										<p class="text-2xl font-extrabold text-gray-900">
											Tk {discount.discountedPrice.toFixed(2)}
										</p>
										<p class="text-lg font-semibold text-gray-400 line-through">
											Tk {discount.originalPrice.toFixed(2)}
										</p>
									</div>
								{:else}
									<p class="text-2xl font-extrabold text-gray-900 mb-1">
										Tk {product.price.toFixed(2)}
									</p>
								{/if}
								{#if product.stock > 0}
									<p class="text-xs text-gray-500 font-medium">
										{product.stock} {product.stock === 1 ? 'item' : 'items'} available
									</p>
								{/if}
							</div>

							<!-- Action Buttons -->
							<div class="flex flex-col gap-3 mt-auto">
								{#if product.stock > 0}
									<form 
										method="POST" 
										action="/cart?/add" 
										use:enhance={({ result }) => {
											return async () => {
												if (result && result.type === 'success') {
													try {
														const data = await result.json();
														if (!data.success) {
															toast.error(data.error || 'Failed to add to cart');
														}
													} catch (e) {
														// Silent fail - redirect will happen
													}
												} else if (result && result.type === 'failure') {
													toast.error('Failed to add to cart. Please try again.');
												}
											};
										}}
										class="w-full"
									>
										<input type="hidden" name="product_id" value={product.id} />
										<input type="hidden" name="quantity" value="1" />
										<button
											type="submit"
											class="w-full bg-white border-2 border-blue-600 text-blue-600 px-4 py-3 rounded-lg cursor-pointer text-sm font-bold hover:bg-blue-50 hover:shadow-md transition-all duration-300"
										>
											Add to cart
										</button>
									</form>
								{:else}
									<button
										disabled
										class="w-full bg-gray-200 text-gray-500 border-2 border-gray-300 px-4 py-3 rounded-lg cursor-not-allowed text-sm font-semibold"
									>
										Out of Stock
									</button>
								{/if}
								<a
									href="/products/{product.id}"
									class="w-full flex items-center justify-center px-4 py-2 rounded-lg no-underline text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
								>
									View Details →
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

