<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { Product } from '$lib/server/models/products';

	interface ProductCardProps {
		product: Product;
		onAddToCart?: (productId: string) => void;
	}

	let { product, onAddToCart }: ProductCardProps = $props();
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
	{#if product.imageUrl}
		<img src={product.imageUrl} alt={product.name} class="w-full h-48 object-cover" />
	{:else}
		<div class="w-full h-48 bg-gray-200 flex items-center justify-center">
			<span class="text-gray-400">No Image</span>
		</div>
	{/if}

	<div class="p-4">
		<h3 class="text-lg font-semibold mb-2">{product.name}</h3>
		<p class="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
		<div class="flex items-center justify-between">
			<span class="text-xl font-bold">{formatCurrency(parseFloat(product.price))}</span>
			{#if product.stock > 0}
				<span class="text-sm text-green-600">In Stock ({product.stock})</span>
			{:else}
				<span class="text-sm text-red-600">Out of Stock</span>
			{/if}
		</div>
		<div class="mt-4">
			<a href="/products/{product.slug}">
				<Button variant="outline" class="w-full mb-2">View Details</Button>
			</a>
			{#if onAddToCart && product.stock > 0}
				<Button variant="primary" class="w-full" on:click={() => onAddToCart(product.id)}>
					Add to Cart
				</Button>
			{/if}
		</div>
	</div>
</div>

