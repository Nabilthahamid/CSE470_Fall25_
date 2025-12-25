<!-- VIEW: Products page (public) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	export let params = {};

	let searchInput = data.searchQuery || '';

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

<div class="products-page-container">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header Section -->
		<div class="text-center mb-12">
			<h1 class="page-title-modern text-4xl md:text-5xl mb-4">Our Products</h1>
			<p class="text-white/80 text-lg">Discover amazing products at great prices</p>
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
						class="search-bar-modern w-full px-6 py-4 text-gray-800 placeholder-gray-400 focus:outline-none text-base"
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
					class="search-button-modern text-white border-none cursor-pointer transition-all"
				>
					Search
				</button>
			</form>
			{#if data.searchQuery}
				<div class="search-results-badge">
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
			<div class="empty-state">
				<div class="empty-state-icon">🔍</div>
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
					<div class="product-card-modern">
						<!-- Product Image -->
						<div class="product-image-wrapper h-56 relative">
							{#if product.image_url}
								<img
									src={product.image_url}
									alt={product.name}
									class="w-full h-full object-cover"
									on:error={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
								<div class="product-image-overlay"></div>
							{:else}
								<div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
									<span class="text-gray-400 text-sm">No image</span>
								</div>
							{/if}
							
							<!-- Stock Badge -->
							{#if product.stock > 0}
								<div class="product-badge stock-badge in-stock">
									<span>✓</span>
									<span>In Stock</span>
								</div>
							{:else}
								<div class="product-badge stock-badge out-of-stock">
									<span>✕</span>
									<span>Out of Stock</span>
								</div>
							{/if}
						</div>

						<!-- Product Info -->
						<div class="p-5">
							<h3 class="m-0 mb-2 text-lg font-bold text-gray-900 line-clamp-2 min-h-[3rem]">
								{product.name}
							</h3>
							<p class="product-description text-sm mb-4 min-h-[2.5rem]">
								{product.description}
							</p>
							
							<!-- Price and Stock -->
							<div class="mb-4">
								<p class="product-price-modern text-3xl font-extrabold mb-2">
									Tk {product.price.toFixed(2)}
								</p>
								{#if product.stock > 0}
									<p class="text-xs text-gray-500">
										{product.stock} {product.stock === 1 ? 'item' : 'items'} available
									</p>
								{/if}
							</div>

							<!-- Action Buttons -->
							<div class="flex gap-2">
								<a
									href="/products/{product.id}"
									class="view-details-button flex-1 text-center px-4 py-2.5 rounded-lg no-underline text-sm font-semibold transition-all"
								>
									View Details
								</a>
								{#if product.stock > 0}
									<form method="POST" action="/cart/add?redirect=/products" use:enhance class="flex-1">
										<input type="hidden" name="product_id" value={product.id} />
										<input type="hidden" name="quantity" value="1" />
										<button
											type="submit"
											class="product-button-modern w-full text-white border-none px-4 py-2.5 rounded-lg cursor-pointer text-sm font-semibold"
										>
											<span>Add to Cart</span>
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

