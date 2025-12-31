<!-- VIEW: Admin products management page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export const params = {};

	let showCreateForm = false;
	let searchInput = data.searchQuery || '';

	function toggleCreateForm() {
		showCreateForm = !showCreateForm;
	}

	function handleSearch() {
		const query = searchInput.trim();
		if (query) {
			goto(`/admin/products?search=${encodeURIComponent(query)}`);
		} else {
			goto('/admin/products');
		}
	}

	function clearSearch() {
		searchInput = '';
		goto('/admin/products');
	}
</script>

<svelte:head>
	<title>Product Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="m-0 text-3xl font-bold">Product Management</h1>
		<button class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700" on:click={toggleCreateForm}>
			{showCreateForm ? 'Cancel' : '+ Add New Product'}
		</button>
	</div>

	{#if data.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{data.error}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{form.error}
		</div>
	{/if}

	{#if showCreateForm}
		<div class="bg-white/5 p-8 rounded-lg mb-8 border border-white/10">
			<h2 class="mb-6 text-2xl font-semibold">Create New Product</h2>
			<form method="POST" action="?/create" use:enhance enctype="multipart/form-data">
				<div class="mb-6">
					<label for="name" class="block mb-2 font-medium">Product Name *</label>
					<input type="text" id="name" name="name" required minlength="2" class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" />
				</div>

				<div class="mb-6">
					<label for="description" class="block mb-2 font-medium">Description *</label>
					<textarea id="description" name="description" required minlength="5" rows="4" class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"></textarea>
				</div>

				<div class="mb-6">
					<label for="component_category_id" class="block mb-2 font-medium">Component Category (optional)</label>
					<select id="component_category_id" name="component_category_id" class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500">
						<option value="">None (Regular Product)</option>
						{#each data.categories as category}
							<option value={category.id}>{category.display_name}</option>
						{/each}
					</select>
					<small class="block mt-1 text-gray-400 text-sm">Select a category if this is a PC component</small>
				</div>

				<div class="mb-6">
					<label for="brand" class="block mb-2 font-medium">Brand (optional)</label>
					<input type="text" id="brand" name="brand" placeholder="e.g., Intel, AMD, Samsung" class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" />
				</div>

				<div class="mb-6">
					<label for="specifications" class="block mb-2 font-medium">Specifications (optional)</label>
					<textarea id="specifications" name="specifications" rows="4" placeholder="Enter product specifications (e.g., CPU: Intel i7, RAM: 16GB, Storage: 512GB SSD)" class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"></textarea>
					<small class="block mt-1 text-gray-400 text-sm">Add detailed specifications for this product</small>
				</div>

				<div class="mb-6">
					<label for="image_file" class="block mb-2 font-medium">Product Image (optional)</label>
					<input 
						type="file" 
						id="image_file" 
						name="image_file" 
						accept=".png,.jpg,.jpeg,image/png,image/jpeg"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
					/>
					<small class="block mt-1 text-gray-400 text-sm">Upload a .png or .jpg image (max 5MB)</small>
				</div>

				<div class="mb-6">
					<label for="image_url" class="block mb-2 font-medium">Or Image URL (optional)</label>
					<input type="url" id="image_url" name="image_url" placeholder="https://example.com/image.jpg" class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" />
					<small class="block mt-1 text-gray-400 text-sm">Alternatively, enter a URL to an image</small>
				</div>

				<div class="grid grid-cols-3 gap-4 mb-6">
					<div>
						<label for="cost_price" class="block mb-2 font-medium">Cost Price *</label>
						<input type="number" id="cost_price" name="cost_price" step="0.01" min="0" required class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" />
					</div>

					<div>
						<label for="price" class="block mb-2 font-medium">Selling Price *</label>
						<input type="number" id="price" name="price" step="0.01" min="0" required class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" />
					</div>

					<div>
						<label for="stock" class="block mb-2 font-medium">Stock *</label>
						<input type="number" id="stock" name="stock" min="0" required class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" />
					</div>
				</div>

				<button type="submit" class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700">
					Create Product
				</button>
			</form>
		</div>
	{/if}

	<div class="mt-8">
		<div class="mb-6 flex gap-4 items-end">
			<div class="flex-1">
				<label for="search" class="block mb-2 font-medium">Search Products</label>
				<div class="flex gap-2">
					<input
						type="text"
						id="search"
						bind:value={searchInput}
						placeholder="Search by name or description..."
						class="flex-1 p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
						on:keydown={(e) => {
							if (e.key === 'Enter') {
								handleSearch();
							}
						}}
					/>
					<button
						type="button"
						on:click={handleSearch}
						class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700"
					>
						Search
					</button>
					{#if data.searchQuery}
						<button
							type="button"
							on:click={clearSearch}
							class="bg-gray-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-gray-700"
						>
							Clear
						</button>
					{/if}
				</div>
			</div>
		</div>

		<h2 class="mb-6 text-2xl font-semibold">
			{#if data.searchQuery}
				Search Results ({data.products.length})
			{:else}
				All Products ({data.products.length})
			{/if}
		</h2>

		{#if data.products.length === 0}
			<p class="text-center p-8 text-gray-400">
				{#if data.searchQuery}
					No products found matching "{data.searchQuery}". Try a different search term.
				{:else}
					No products found. Create your first product!
				{/if}
			</p>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
				{#each data.products as product (product.id)}
					<div class="bg-white/5 p-6 rounded-lg border border-white/10">
						{#if product.image_url}
							<img src={product.image_url} alt={product.name} class="w-full h-48 object-cover rounded-lg mb-4" on:error={(e) => { e.currentTarget.style.display = 'none'; }} />
						{/if}
						<h3 class="m-0 mb-2 text-xl font-semibold">{product.name}</h3>
						<p class="text-gray-400 my-2 text-sm line-clamp-2">{product.description}</p>
						<div class="my-4">
							<p class="my-2"><strong>Price:</strong> ${product.price.toFixed(2)}</p>
							<p class="my-2"><strong>Stock:</strong> {product.stock}</p>
						</div>
						<div class="flex gap-2 mt-4">
							<a href="/admin/products/{product.id}/edit" class="bg-green-600 text-white px-4 py-2 rounded no-underline text-sm transition-colors hover:bg-green-700">
								Edit
							</a>
							<form method="POST" action="?/delete" use:enhance class="inline">
								<input type="hidden" name="id" value={product.id} />
								<button 
									type="submit" 
									class="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors hover:bg-red-700"
									on:click={(e) => { if (!confirm('Are you sure?')) { e.preventDefault(); } }}
								>
									Delete
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>


