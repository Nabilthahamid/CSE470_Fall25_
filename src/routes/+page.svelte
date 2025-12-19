<script lang="ts">
	import ProductCard from "$lib/components/commerce/ProductCard.svelte";
	import { ShoppingBag, ArrowRight } from "lucide-svelte";
	import type { PageData } from "./$types";

	/** View (UI) - Landing Page
	 * Displays all products on the homepage
	 */
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>TinyShop - Your One-Stop Shop</title>
	<meta name="description" content="Browse our amazing collection of products" />
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Hero Section -->
	<div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
		<div class="container mx-auto px-4 py-16 md:px-6 md:py-24">
			<div class="mx-auto max-w-3xl text-center">
				<h1 class="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
					Welcome to TinyShop
				</h1>
				<p class="mb-8 text-lg text-slate-300 md:text-xl">
					Discover amazing products at unbeatable prices. Shop with confidence and enjoy
					fast delivery.
				</p>
				<a
					href="#products"
					class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-100"
				>
					<ShoppingBag class="h-5 w-5" />
					Shop Now
					<ArrowRight class="h-5 w-5" />
				</a>
			</div>
		</div>
	</div>

	<!-- Products Section -->
	<div id="products" class="container mx-auto px-4 py-12 md:px-6 md:py-16">
		<header class="mb-8 text-center">
			<h2 class="text-3xl font-bold text-slate-900 md:text-4xl">Featured Products</h2>
			<p class="mt-2 text-slate-600">Browse our complete collection</p>
		</header>

		<!-- Products are loaded from database via +page.server.ts -->
		<!-- No hardcoded products - all data comes from Supabase products table -->
		{#if data.products && data.products.length > 0}
			<div
				class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each data.products as product (product.id)}
					<ProductCard {product} />
				{/each}
			</div>
		{:else}
			<div class="rounded-lg bg-slate-100 p-12 text-center">
				<p class="text-lg text-slate-600">No products available at the moment.</p>
				<p class="mt-2 text-sm text-slate-500">Please check back later.</p>
			</div>
		{/if}
	</div>
</div>

