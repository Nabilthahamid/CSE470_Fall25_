<script lang="ts">
	import ProductCard from '$lib/components/ecommerce/ProductCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div>
	<h1 class="text-3xl font-bold mb-8">All Products</h1>

	{#if data.products.length === 0}
		<div class="max-w-2xl mx-auto text-center py-16">
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-8">
				<h2 class="text-2xl font-bold text-blue-900 mb-4">Database Not Connected</h2>
				<p class="text-blue-700 mb-6">
					To see products, you need to set up your database connection.
				</p>
				<div class="bg-white rounded p-4 text-left space-y-3">
					<p class="font-semibold text-gray-900">Quick Setup:</p>
					<ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
						<li>Create a <code class="bg-gray-100 px-2 py-1 rounded">.env</code> file (use <code class="bg-gray-100 px-2 py-1 rounded">.env.example</code> as template)</li>
						<li>Add your Supabase credentials to <code class="bg-gray-100 px-2 py-1 rounded">.env</code></li>
						<li>Run the SQL schema from <code class="bg-gray-100 px-2 py-1 rounded">supabase-schema.sql</code> in Supabase SQL Editor</li>
						<li>Restart your dev server</li>
					</ol>
				</div>
				<div class="mt-6 flex gap-4 justify-center">
					<a
						href="/test-connection"
						class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
					>
						Test Connection
					</a>
					<a
						href="https://app.supabase.com"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
					>
						Open Supabase
					</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each data.products as product (product.id)}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}
</div>

