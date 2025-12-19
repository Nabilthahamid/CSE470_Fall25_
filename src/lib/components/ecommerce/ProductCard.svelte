<script lang="ts">
	import Button from '../ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatCurrency';
	import type { Product } from '$lib/server/models/products';

	interface ProductCardProps {
		product: Product;
		onAddToCart?: (productId: string) => void;
	}

	let { product, onAddToCart }: ProductCardProps = $props();

	// Check if imageUrl is a PDF
	function isPdf(url: string | null | undefined): boolean {
		if (!url) return false;
		return url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf');
	}
</script>

<a href="/products/{product.slug}" class="block group">
	<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
		{#if product.imageUrl && product.imageUrl.trim() !== ""}
			{#if isPdf(product.imageUrl)}
				<!-- PDF files cannot be displayed as images, show PDF icon/placeholder -->
				<div class="w-full h-64 bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative">
					{#if product.stock === 0}
						<!-- Stock Out Badge -->
						<div class="absolute top-2 left-2 bg-black text-white px-3 py-1 text-xs font-semibold z-10">
							STOCK OUT
						</div>
					{/if}
					<svg class="w-16 h-16 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
					<span class="text-gray-600 text-sm font-medium">PDF Document</span>
				</div>
			{:else}
				<!-- Regular image -->
				<div class="w-full h-64 bg-gray-50 flex items-center justify-center overflow-hidden relative">
					{#if product.stock === 0}
						<!-- Stock Out Badge -->
						<div class="absolute top-2 left-2 bg-black text-white px-3 py-1 text-xs font-semibold z-10">
							STOCK OUT
						</div>
					{/if}
					<img 
						src={product.imageUrl} 
						alt={product.name} 
						class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
						loading="lazy"
						onerror={(e) => {
							// On error, replace image with placeholder
							const img = e.target as HTMLImageElement;
							img.outerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400">Image failed to load</span></div>';
						}}
					/>
				</div>
			{/if}
		{:else}
			<div class="w-full h-64 bg-gray-200 flex items-center justify-center relative">
				{#if product.stock === 0}
					<!-- Stock Out Badge -->
					<div class="absolute top-2 left-2 bg-black text-white px-3 py-1 text-xs font-semibold z-10">
						STOCK OUT
					</div>
				{/if}
				<span class="text-gray-400">No Image</span>
			</div>
		{/if}

		<div class="p-4">
			<h3 class="text-base font-medium mb-2 text-gray-900 line-clamp-2">{product.name}</h3>
			<p class="text-lg font-semibold text-gray-900">{formatCurrency(parseFloat(product.price))}</p>
		</div>
	</div>
</a>

