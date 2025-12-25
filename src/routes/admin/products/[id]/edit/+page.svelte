<!-- VIEW: Edit product page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: { id: string }; // Accept params from dynamic route
</script>

<svelte:head>
	<title>Edit {data.product.name} - Admin Dashboard</title>
</svelte:head>

<div class="max-w-3xl mx-auto p-8">
	<a href="/admin/products" class="inline-block mb-6 text-indigo-400 no-underline hover:underline">← Back to Products</a>

	<h1 class="mb-8 text-3xl font-bold">Edit Product</h1>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
			{form.error}
		</div>
	{/if}

	<div class="bg-white/5 p-8 rounded-lg border border-white/10">
		<form method="POST" use:enhance enctype="multipart/form-data">
			<div class="mb-6">
				<label for="name" class="block mb-2 font-medium">Product Name *</label>
				<input
					type="text"
					id="name"
					name="name"
					value={form?.name || data.product.name}
					required
					minlength="2"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				/>
			</div>

			<div class="mb-6">
				<label for="description" class="block mb-2 font-medium">Description *</label>
				<textarea
					id="description"
					name="description"
					required
					minlength="5"
					rows="4"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				>{form?.description || data.product.description}</textarea>
			</div>

			<div class="mb-6">
				<label for="image_file" class="block mb-2 font-medium">Upload New Image (optional)</label>
				<input 
					type="file" 
					id="image_file" 
					name="image_file" 
					accept=".png,.jpg,.jpeg,image/png,image/jpeg"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
				/>
				<small class="block mt-1 text-gray-400 text-sm">Upload a .png or .jpg image (max 5MB). This will replace the current image.</small>
			</div>

			<div class="mb-6">
				<label for="image_url" class="block mb-2 font-medium">Or Image URL (optional)</label>
				<input
					type="url"
					id="image_url"
					name="image_url"
					value={form?.image_url !== undefined ? form.image_url : (data.product.image_url || '')}
					placeholder="https://example.com/image.jpg"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				/>
				<small class="block mt-1 text-gray-400 text-sm">Alternatively, enter a URL to an image</small>
			</div>

			{#if data.product.image_url}
				<div class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
					<p class="mb-2 text-sm font-medium">Current Image:</p>
					<img src={data.product.image_url} alt={data.product.name} class="w-full max-w-xs h-48 object-cover rounded-lg border border-white/10 mb-3" on:error={(e) => { e.currentTarget.style.display = 'none'; }} />
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" name="delete_image" value="true" class="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500" />
						<span class="text-sm text-gray-400">Delete current image</span>
					</label>
				</div>
			{/if}

			<div class="grid grid-cols-3 gap-4 mb-6">
				<div>
					<label for="cost_price" class="block mb-2 font-medium">Cost Price *</label>
					<input
						type="number"
						id="cost_price"
						name="cost_price"
						step="0.01"
						min="0"
						value={form?.cost_price !== undefined ? form.cost_price : (data.product.cost_price || 0)}
						required
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
				</div>

				<div>
					<label for="price" class="block mb-2 font-medium">Selling Price *</label>
					<input
						type="number"
						id="price"
						name="price"
						step="0.01"
						min="0"
						value={form?.price || data.product.price}
						required
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
				</div>

				<div>
					<label for="stock" class="block mb-2 font-medium">Stock *</label>
					<input
						type="number"
						id="stock"
						name="stock"
						min="0"
						value={form?.stock || data.product.stock}
						required
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
				</div>
			</div>

			<div class="flex gap-4 mt-8">
				<button type="submit" class="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base transition-colors hover:bg-indigo-700">
					Update Product
				</button>
				<a href="/admin/products" class="bg-gray-600 text-white px-6 py-3 rounded-lg no-underline inline-block transition-colors hover:bg-gray-700">
					Cancel
				</a>
			</div>
		</form>
	</div>
</div>

