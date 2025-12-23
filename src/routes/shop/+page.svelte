<script lang="ts">
	import ProductCard from '$lib/components/commerce/ProductCard.svelte';
	import { Search, X } from 'lucide-svelte';
	import type { PageData } from './$types';

	/** View (UI) - Shop Product Listing Page
	 * This component only displays data provided by the data prop
	 * No business logic or database queries here
	 */
	let { data }: { data: PageData } = $props();
	
	let searchQuery = $state("");

	// Filter products based on search query
	const filteredProducts = $derived.by(() => {
		if (!data.products) return [];
		
		if (!searchQuery.trim()) {
			return data.products;
		}
		
		const query = searchQuery.toLowerCase().trim();
		return data.products.filter((product) => {
			return (
				product.name.toLowerCase().includes(query) ||
				product.slug.toLowerCase().includes(query) ||
				(product.description?.toLowerCase().includes(query) ?? false)
			);
		});
	});
</script>

<svelte:head>
	<title>TinyShop - Products</title>
	<meta name="description" content="Browse our collection of products" />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<div class="container mx-auto px-4 py-8 md:px-6 md:py-12">
		<header class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900 md:text-4xl">Our Products</h1>
			<p class="mt-2 text-slate-600">Discover our collection</p>
		</header>

		<!-- Search Bar -->
		<div class="mb-8">
			<div class="relative max-w-2xl">
				<Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
				<input
					type="text"
					placeholder="Search products by name, slug, or description..."
					bind:value={searchQuery}
					class="w-full rounded-lg border border-slate-300 bg-white text-slate-900 py-3 pl-10 pr-10 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = "")}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
						title="Clear search"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</div>
			{#if searchQuery && filteredProducts.length !== data.products?.length}
				<p class="mt-3 text-sm text-slate-600">
					Showing {filteredProducts.length} of {data.products?.length || 0} products
				</p>
			{/if}
		</div>

		{#if filteredProducts && filteredProducts.length > 0}
			<div
				class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each filteredProducts as product (product.id)}
					<ProductCard {product} />
				{/each}
			</div>
		{:else if searchQuery && filteredProducts.length === 0}
			<div class="rounded-lg bg-white border border-slate-200 p-12 text-center shadow-sm">
				<Search class="mx-auto h-12 w-12 text-slate-400 mb-4" />
				<p class="text-lg font-medium text-slate-900 mb-2">No products found</p>
				<p class="text-sm text-slate-600 mb-4">
					No products match your search query "{searchQuery}".
				</p>
				<button
					type="button"
					onclick={() => (searchQuery = "")}
					class="text-sm text-slate-900 underline hover:text-slate-700 transition-colors"
				>
					Clear search
				</button>
			</div>
		{:else}
			<div class="rounded-lg bg-slate-100 p-12 text-center">
				<p class="text-lg text-slate-600">No products available at the moment.</p>
			</div>
		{/if}
	</div>
</div>

