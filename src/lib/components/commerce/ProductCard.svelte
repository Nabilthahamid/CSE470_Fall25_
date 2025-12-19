<script lang="ts">
	import { Package, ShoppingCart } from 'lucide-svelte';
	import type { Product } from '$lib/types';
	import { cart } from '$lib/stores/cart';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

	const formattedPrice = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(product.price);

	const isInStock = product.stock > 0;
	let addedToCart = $state(false);

	function handleAddToCart(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isInStock) {
			cart.addItem(product, 1);
			addedToCart = true;
			setTimeout(() => {
				addedToCart = false;
			}, 2000);
		}
	}
</script>

<a
	href="/shop/{product.slug}"
	class="group block overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
>
	<!-- Product Image -->
	<div class="relative h-64 w-full overflow-hidden bg-slate-200">
		{#if product.image_url}
			<img
				src={product.image_url}
				alt={product.name}
				class="h-full w-full object-cover transition-transform group-hover:scale-105"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<Package class="h-16 w-16 text-slate-400" />
			</div>
		{/if}
		{#if !isInStock}
			<div class="absolute inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center">
				<span class="rounded bg-white px-3 py-1 text-sm font-semibold text-slate-900">
					Out of Stock
				</span>
			</div>
		{/if}
	</div>

	<!-- Product Info -->
	<div class="p-4">
		<h3 class="mb-2 text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-700">
			{product.name}
		</h3>
		{#if product.description}
			<p class="mb-3 text-sm text-slate-600 line-clamp-2">
				{product.description}
			</p>
		{/if}
		<div class="flex items-center justify-between">
			<span class="text-xl font-bold text-slate-900">{formattedPrice}</span>
			{#if isInStock}
				<button
					type="button"
					onclick={handleAddToCart}
					class="flex items-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
					title="Add to cart"
				>
					<ShoppingCart class="h-3.5 w-3.5" />
					{addedToCart ? 'Added!' : 'Add'}
				</button>
			{:else}
				<span class="text-xs text-slate-400 font-medium">Out of Stock</span>
			{/if}
		</div>
	</div>
</a>

