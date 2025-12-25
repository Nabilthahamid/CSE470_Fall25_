<!-- VIEW: Home page with products -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	export let params = {};
</script>

<svelte:head>
	<title>Home - Shop</title>
	<meta name="description" content="Browse our products" />
</svelte:head>

<div class="products-page-container">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<h1 class="page-title-modern text-5xl md:text-6xl mb-4">Welcome to Our Store</h1>
			<p class="text-white/90 text-xl mb-6">Discover amazing products at great prices</p>
			<a
				href="/products"
				class="inline-block search-button-modern text-white px-8 py-3 rounded-full no-underline font-semibold transition-all"
			>
				Browse All Products →
			</a>
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
				<div class="empty-state-icon">📦</div>
				<h3 class="text-2xl font-bold text-gray-800 mb-2">No products available</h3>
				<p class="text-gray-600">Check back soon for new products!</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
									<form method="POST" action="/cart/add?redirect=/" use:enhance class="flex-1">
										<input type="hidden" name="product_id" value={product.id} />
										<input type="hidden" name="quantity" value="1" />
										<button
											type="submit"
											class="quick-add-button w-full text-white border-none px-4 py-2.5 rounded-lg cursor-pointer text-sm font-semibold"
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
