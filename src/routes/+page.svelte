<!-- VIEW: Home page with products -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	export const params = {};

	let showPopup = false;
	let popupMessage = '';
	let popupType: 'success' | 'error' = 'success';
	let popupTimeout: ReturnType<typeof setTimeout> | null = null;

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

</script>

<svelte:head>
	<title>Home - Shop</title>
	<meta name="description" content="Browse our products" />
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<h1 class="text-5xl md:text-6xl mb-4 font-bold text-gray-900">Welcome to Our Store</h1>
			<p class="text-gray-600 text-xl mb-6">Discover amazing products at great prices</p>
			<a
				href="/products"
				class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg no-underline font-semibold transition-colors hover:bg-indigo-700"
			>
				Browse All Products →
			</a>
		</div>

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
				<div class="text-6xl mb-4">📦</div>
				<h3 class="text-2xl font-bold text-gray-800 mb-2">No products available</h3>
				<p class="text-gray-600">Check back soon for new products!</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each data.products as product (product.id)}
					<div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
						<!-- Product Image -->
						<div class="h-56 relative bg-gray-100">
							{#if product.image_url}
								<img
									src={product.image_url}
									alt={product.name}
									class="w-full h-full object-cover"
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
							{#if product.stock > 0}
								<div class="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
									<span>✓</span>
									<span>In Stock</span>
								</div>
							{:else}
								<div class="absolute top-2 right-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
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
							<p class="text-sm mb-4 min-h-[2.5rem] text-gray-600 line-clamp-2">
								{product.description}
							</p>
							
							<!-- Price and Stock -->
							<div class="mb-4">
								<p class="text-3xl font-bold mb-2 text-gray-900">
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
									class="flex-1 text-center px-4 py-2.5 rounded-lg no-underline text-sm font-semibold bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
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
