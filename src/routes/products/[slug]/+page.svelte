<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let quantity = $state(1);

	async function handleAddToCart() {
		try {
			const response = await fetch('/api/cart/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productId: data.product.id,
					quantity: quantity
				})
			});

			if (response.ok) {
				// Redirect to cart with notification
				window.location.href = `/cart?added=true&product=${encodeURIComponent(data.product.name)}`;
			} else {
				alert('Failed to add item to cart. Please try again.');
			}
		} catch (error) {
			console.error('Error adding to cart:', error);
			alert('Failed to add item to cart. Please try again.');
		}
	}

	// Check if imageUrl is a PDF
	function isPdf(url: string | null | undefined): boolean {
		if (!url) return false;
		return url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf');
	}

	// Format description - handle both plain text and bullet points
	function formatDescription(description: string | null | undefined): string[] {
		if (!description) return [];
		// Split by newlines and filter empty lines
		return description.split('\n').filter(line => line.trim().length > 0);
	}
</script>

<svelte:head>
	<title>{data.product.name} - Tinytech</title>
</svelte:head>

<div class="max-w-6xl mx-auto py-8">
	<div class="grid md:grid-cols-2 gap-8">
		<!-- Product Image -->
		<div class="space-y-4">
			{#if data.product.imageUrl}
				{#if isPdf(data.product.imageUrl)}
					<!-- PDF files cannot be displayed as images, show PDF viewer or placeholder -->
					<div class="w-full h-96 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
						<svg class="w-24 h-24 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						<span class="text-gray-700 text-lg font-medium mb-2">PDF Document</span>
						<a 
							href={data.product.imageUrl} 
							target="_blank" 
							rel="noopener noreferrer"
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							View PDF
						</a>
					</div>
				{:else}
					<!-- Regular image -->
					<img 
						src={data.product.imageUrl} 
						alt={data.product.name} 
						class="w-full rounded-lg shadow-lg object-cover"
						style="max-height: 600px;"
					/>
				{/if}
			{:else}
				<div class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
					<span class="text-gray-400 text-lg">No Image</span>
				</div>
			{/if}
		</div>

		<!-- Product Details -->
		<div class="space-y-6">
			<div>
				<h1 class="text-4xl font-bold mb-4 text-gray-900">{data.product.name}</h1>
				<p class="text-3xl font-bold text-blue-600 mb-6">
					{formatCurrency(parseFloat(data.product.price))}
				</p>
			</div>

			{#if data.product.description}
				<div class="border-t border-b border-gray-200 py-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Specifications</h2>
					<div class="space-y-2">
						{#each formatDescription(data.product.description) as line}
							<p class="text-gray-700">{line}</p>
						{/each}
					</div>
				</div>
			{/if}

			<div class="border-t border-gray-200 pt-6">
				<div class="mb-6">
					{#if data.product.stock > 0}
						<p class="text-lg text-green-600 font-medium mb-6">
							{data.product.stock === 1 ? '1 in stock' : `${data.product.stock} in stock`}
						</p>
					{:else}
						<p class="text-lg text-red-600 font-medium mb-6">Out of Stock</p>
					{/if}

					{#if data.product.stock > 0}
						<div class="flex items-center gap-4 mb-6">
							<label for="quantity" class="font-semibold text-gray-700">Quantity:</label>
							<input
								id="quantity"
								type="number"
								min="1"
								max={data.product.stock}
								bind:value={quantity}
								class="w-24 px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<button
							type="button"
							onclick={handleAddToCart}
							class="w-full bg-gray-900 text-white px-6 py-4 rounded-md hover:bg-gray-800 transition-colors font-semibold text-lg"
						>
							Add to Cart
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

