<script lang="ts">
	import type { PageData } from './$types';
	import { ShoppingCart, Package, Check } from 'lucide-svelte';
	import { cart } from '$lib/stores/cart';
	import { onMount } from 'svelte';

	/** View (UI) - Single Product Detail Page
	 * This component only displays data provided by the data prop
	 * No business logic or database queries here
	 */
	let { data }: { data: PageData } = $props();

	const product = $derived(data.product);
	const isInStock = $derived(product.stock > 0);
	const formattedPrice = $derived(new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(product.price));

	let quantity = $state(1);
	let addedToCart = $state(false);

	function handleAddToCart() {
		if (isInStock && quantity > 0) {
			cart.addItem(product, quantity);
			addedToCart = true;
			setTimeout(() => {
				addedToCart = false;
			}, 2000);
		}
	}
</script>

<svelte:head>
	<title>{product.name} - TinyShop</title>
	<meta name="description" content={product.description || product.name} />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<div class="mx-auto max-w-6xl">
			<!-- Breadcrumb Navigation -->
			<nav class="mb-6 text-sm text-slate-600">
				<a href="/shop" class="hover:text-slate-900">Shop</a>
				<span class="mx-2">/</span>
				<span class="text-slate-900">{product.name}</span>
			</nav>

			<!-- Product Detail Card -->
			<div class="overflow-hidden rounded-lg bg-white shadow-lg md:flex">
				<!-- Product Image -->
				<div class="h-96 w-full bg-slate-200 md:h-auto md:w-1/2">
					{#if product.image_url}
						<img
							src={product.image_url}
							alt={product.name}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center">
							<Package class="h-24 w-24 text-slate-400" />
						</div>
					{/if}
				</div>

				<!-- Product Information -->
				<div class="flex flex-1 flex-col p-6 md:p-8">
					<h1 class="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
						{product.name}
					</h1>

					<div class="mb-6">
						<p class="text-3xl font-bold text-slate-900">{formattedPrice}</p>
					</div>

					{#if product.description}
						<div class="mb-6">
							<h2 class="mb-2 text-lg font-semibold text-slate-900">Description</h2>
							<p class="text-slate-600 whitespace-pre-wrap">{product.description}</p>
						</div>
					{/if}

					<!-- Stock Status -->
					<div class="mb-6 flex items-center gap-2">
						{#if isInStock}
							<Check class="h-5 w-5 text-green-600" />
							<span class="text-green-600 font-medium">
								In Stock ({product.stock} available)
							</span>
						{:else}
							<Package class="h-5 w-5 text-slate-400" />
							<span class="text-slate-400 font-medium">Out of Stock</span>
						{/if}
					</div>

					<!-- Quantity & Add to Cart -->
					<div class="mt-auto space-y-4">
						{#if isInStock}
							<div class="flex items-center gap-4">
								<label for="quantity" class="text-sm font-medium text-slate-700">Quantity:</label>
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => quantity > 1 && quantity--}
										class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
										aria-label="Decrease quantity"
									>
										−
									</button>
									<input
										type="number"
										id="quantity"
										bind:value={quantity}
										min="1"
										max={product.stock}
										class="w-20 rounded border border-slate-300 px-3 py-2 text-center"
									/>
									<button
										type="button"
										onclick={() => quantity < product.stock && quantity++}
										disabled={quantity >= product.stock}
										class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
										aria-label="Increase quantity"
									>
										+
									</button>
								</div>
							</div>
						{/if}
						
						<button
							type="button"
							onclick={handleAddToCart}
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-50 md:w-auto"
							disabled={!isInStock || quantity <= 0}
						>
							<ShoppingCart class="h-5 w-5" />
							{addedToCart ? 'Added to Cart!' : isInStock ? 'Add to Cart' : 'Out of Stock'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

