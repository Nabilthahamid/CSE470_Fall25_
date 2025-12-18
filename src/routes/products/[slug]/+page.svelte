<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let quantity = $state(1);

	function handleAddToCart() {
		// TODO: Implement add to cart logic
		console.log('Add to cart:', data.product.id, quantity);
	}
</script>

<div class="max-w-4xl mx-auto">
	<div class="grid md:grid-cols-2 gap-8">
		<!-- Product Image -->
		<div>
			{#if data.product.imageUrl}
				<img src={data.product.imageUrl} alt={data.product.name} class="w-full rounded-lg" />
			{:else}
				<div class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
					<span class="text-gray-400">No Image</span>
				</div>
			{/if}
		</div>

		<!-- Product Details -->
		<div>
			<h1 class="text-3xl font-bold mb-4">{data.product.name}</h1>
			<p class="text-2xl font-semibold text-blue-600 mb-4">
				{formatCurrency(parseFloat(data.product.price))}
			</p>

			{#if data.product.description}
				<div class="mb-6">
					<h2 class="text-xl font-semibold mb-2">Description</h2>
					<p class="text-gray-600">{data.product.description}</p>
				</div>
			{/if}

			<div class="mb-6">
				{#if data.product.stock > 0}
					<p class="text-green-600 mb-4">In Stock ({data.product.stock} available)</p>
				{:else}
					<p class="text-red-600 mb-4">Out of Stock</p>
				{/if}

				{#if data.product.stock > 0}
					<div class="flex items-center gap-4 mb-4">
						<label for="quantity" class="font-medium">Quantity:</label>
						<input
							id="quantity"
							type="number"
							min="1"
							max={data.product.stock}
							bind:value={quantity}
							class="w-20 px-3 py-2 border rounded"
						/>
					</div>
					<Button variant="primary" size="lg" class="w-full" on:click={handleAddToCart}>
						Add to Cart
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>

