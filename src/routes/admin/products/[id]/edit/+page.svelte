<!-- VIEW: Edit product page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { generateSlug, generateMetaTitle, generateMetaDescription, generateSchemaMarkup } from '$lib/utils/seo';
	import MediaPicker from '$lib/components/MediaPicker.svelte';

	export let data: PageData;
	export let form: ActionData;
	export let params: { id: string };

	let descriptionTextarea: HTMLTextAreaElement;
	let generatingDescription = false;
	let descriptionError: string | null = null;
	let generatedDescription: string | null = null;
	let generatedKeywords: string[] = [];
	let descriptionVariations: string[] = [];
	let showDescriptionModal = false;
	let showMediaPicker = false;
	let selectedImageUrl = data.product.image_url || '';

	async function generateDescription() {
		generatingDescription = true;
		descriptionError = null;
		generatedDescription = null;
		generatedKeywords = [];
		descriptionVariations = [];

		try {
			const response = await fetch('/api/admin/ai-generate-description', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: (document.getElementById('name') as HTMLInputElement)?.value || data.product.name,
					brand: (document.getElementById('brand') as HTMLInputElement)?.value || data.product.brand || null,
					specifications: (document.getElementById('specifications') as HTMLTextAreaElement)?.value || data.product.specifications || null,
					price: data.product.price,
					component_category_name: data.categories.find(c => c.id === data.product.component_category_id)?.display_name || null
				})
			});

			const result = await response.json();

			if (result.error) {
				descriptionError = result.error;
			} else {
				generatedDescription = result.description;
				generatedKeywords = result.keywords || [];
				descriptionVariations = result.variations || [];
				showDescriptionModal = true;
			}
		} catch (error: any) {
			descriptionError = error.message || 'Failed to generate description';
		} finally {
			generatingDescription = false;
		}
	}

	function useDescription(description: string) {
		if (descriptionTextarea) {
			descriptionTextarea.value = description;
			// Trigger input event to update form state
			descriptionTextarea.dispatchEvent(new Event('input', { bubbles: true }));
		}
		showDescriptionModal = false;
	}

	async function generateSEOFields() {
		const nameInput = document.getElementById('name') as HTMLInputElement;
		const brandInput = document.getElementById('brand') as HTMLInputElement;
		const metaTitleInput = document.getElementById('meta_title') as HTMLInputElement;
		const metaDescTextarea = document.getElementById('meta_description') as HTMLTextAreaElement;

		const name = nameInput?.value || data.product.name;
		const desc = descriptionTextarea?.value || data.product.description;
		const brand = brandInput?.value || data.product.brand;

		if (metaTitleInput && !metaTitleInput.value) {
			metaTitleInput.value = generateMetaTitle(name, brand);
		}

		if (metaDescTextarea && !metaDescTextarea.value) {
			metaDescTextarea.value = generateMetaDescription(desc);
		}
	}
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
				<div class="flex items-center justify-between mb-2">
					<label for="description" class="block font-medium">Description *</label>
					<button
						type="button"
						on:click={generateDescription}
						disabled={generatingDescription}
						class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if generatingDescription}
							<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Generating...
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
							</svg>
							AI Generate Description
						{/if}
					</button>
				</div>
				{#if descriptionError}
					<div class="mb-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
						{descriptionError}
					</div>
				{/if}
				<textarea
					id="description"
					name="description"
					bind:this={descriptionTextarea}
					required
					minlength="5"
					rows="4"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				>{form?.description || data.product.description}</textarea>
				<small class="block mt-1 text-gray-400 text-sm">Click "AI Generate Description" to auto-generate an SEO-optimized description</small>
			</div>

			<div class="mb-6">
				<label for="component_category_id" class="block mb-2 font-medium">Component Category (optional)</label>
				<select 
					id="component_category_id" 
					name="component_category_id" 
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				>
					<option value="">None (Regular Product)</option>
					{#each data.categories as category}
						<option value={category.id} selected={data.product.component_category_id === category.id}>
							{category.display_name}
						</option>
					{/each}
				</select>
				<small class="block mt-1 text-gray-400 text-sm">Select a category if this is a PC component</small>
			</div>

			<div class="mb-6">
				<label for="brand" class="block mb-2 font-medium">Brand (optional)</label>
				<input 
					type="text" 
					id="brand" 
					name="brand" 
					value={form?.brand !== undefined ? form.brand : (data.product.brand || '')}
					placeholder="e.g., Intel, AMD, Samsung" 
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500" 
				/>
			</div>

			<div class="mb-6">
				<label for="specifications" class="block mb-2 font-medium">Specifications (optional)</label>
				<textarea 
					id="specifications" 
					name="specifications" 
					rows="4" 
					placeholder="Enter product specifications (e.g., CPU: Intel i7, RAM: 16GB, Storage: 512GB SSD)" 
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				>{form?.specifications !== undefined ? form.specifications : (data.product.specifications || '')}</textarea>
				<small class="block mt-1 text-gray-400 text-sm">Add detailed specifications for this product</small>
			</div>

			<div class="mb-6">
				<label class="block mb-2 font-medium">Product Image (optional)</label>
				<div class="flex gap-3 mb-2">
					<button
						type="button"
						on:click={() => showMediaPicker = true}
						class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
					>
						📁 Select from Media Library
					</button>
					<span class="text-gray-400 text-sm self-center">or</span>
				</div>
				<input 
					type="file" 
					id="image_file" 
					name="image_file" 
					accept=".png,.jpg,.jpeg,image/png,image/jpeg"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
				/>
				<small class="block mt-1 text-gray-400 text-sm">Upload a .png or .jpg image (max 5MB). Images are automatically added to Media Library.</small>
			</div>

			<div class="mb-6">
				<label for="image_url" class="block mb-2 font-medium">Or Image URL (optional)</label>
				<input
					type="url"
					id="image_url"
					name="image_url"
					bind:value={selectedImageUrl}
					placeholder="https://example.com/image.jpg"
					class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
				/>
				<small class="block mt-1 text-gray-400 text-sm">Alternatively, enter a URL to an image</small>
				{#if selectedImageUrl}
					<div class="mt-2">
						<img src={selectedImageUrl} alt="Selected" class="w-32 h-32 object-cover rounded-lg border border-white/10" />
					</div>
				{/if}
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

			<!-- SEO Tools Section -->
			<div class="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
				<h2 class="text-xl font-bold mb-4">SEO Tools</h2>
				
				<div class="mb-4">
					<label for="slug" class="block mb-2 font-medium">URL Slug</label>
					<input
						type="text"
						id="slug"
						name="slug"
						value={form?.slug !== undefined ? form.slug : (data.product.slug || '')}
						placeholder="auto-generated-from-name"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
						on:input={(e) => {
							const input = e.currentTarget;
							if (!input.value && data.product.name) {
								input.value = generateSlug(data.product.name);
							}
						}}
					/>
					<small class="block mt-1 text-gray-400 text-sm">URL-friendly version of product name</small>
				</div>

				<div class="mb-4">
					<label for="meta_title" class="block mb-2 font-medium">Meta Title</label>
					<input
						type="text"
						id="meta_title"
						name="meta_title"
						value={form?.meta_title !== undefined ? form.meta_title : (data.product.meta_title || '')}
						maxlength="60"
						placeholder="Auto-generated from product name"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
					<small class="block mt-1 text-gray-400 text-sm">SEO title (recommended: 50-60 characters)</small>
				</div>

				<div class="mb-4">
					<label for="meta_description" class="block mb-2 font-medium">Meta Description</label>
					<textarea
						id="meta_description"
						name="meta_description"
						rows="3"
						maxlength="160"
						placeholder="Auto-generated from description"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					>{form?.meta_description !== undefined ? form.meta_description : (data.product.meta_description || '')}</textarea>
					<small class="block mt-1 text-gray-400 text-sm">SEO description (recommended: 150-160 characters)</small>
				</div>

				<button
					type="button"
					on:click={generateSEOFields}
					class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
				>
					Generate SEO Fields
				</button>
			</div>

			<!-- Tags Section -->
			<div class="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
				<h2 class="text-xl font-bold mb-4">Product Tags</h2>
				<div class="mb-4">
					<label for="tags" class="block mb-2 font-medium">Tags (comma-separated)</label>
					<input
						type="text"
						id="tags"
						name="tags"
						value={form?.tags !== undefined ? form.tags : (data.product.tags?.join(', ') || '')}
						placeholder="e.g., featured, bestseller, new-arrival"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
					<small class="block mt-1 text-gray-400 text-sm">Add tags to help categorize and filter products</small>
				</div>
			</div>

			<!-- Related Products Section -->
			<div class="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
				<h2 class="text-xl font-bold mb-4">Related Products</h2>
				<div class="mb-4">
					<label for="related_product_ids" class="block mb-2 font-medium">Related Product IDs (comma-separated)</label>
					<input
						type="text"
						id="related_product_ids"
						name="related_product_ids"
						value={form?.related_product_ids !== undefined ? form.related_product_ids : (data.product.related_product_ids?.join(', ') || '')}
						placeholder="Enter product IDs separated by commas"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					/>
					<small class="block mt-1 text-gray-400 text-sm">Suggest related or upsell products to customers</small>
				</div>
				{#if data.allProducts && data.allProducts.length > 0}
					<div class="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
						<p class="text-sm font-medium mb-2">Available Products:</p>
						<div class="max-h-40 overflow-y-auto space-y-1">
							{#each data.allProducts.filter(p => p.id !== data.product.id) as product}
								<div class="text-sm text-gray-400">
									<span class="font-mono text-xs">{product.id.slice(0, 8)}</span> - {product.name}
								</div>
							{/each}
		</div>
	</div>
{/if}

{#if showMediaPicker}
	<MediaPicker
		multiple={false}
		selectedUrls={selectedImageUrl ? [selectedImageUrl] : []}
		onSelect={handleMediaSelect}
		onClose={() => showMediaPicker = false}
	/>
{/if}
</div>

			<!-- Image Gallery Section -->
			<div class="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
				<h2 class="text-xl font-bold mb-4">Image Gallery</h2>
				<div class="mb-4">
					<label for="images" class="block mb-2 font-medium">Additional Images (comma-separated URLs)</label>
					<textarea
						id="images"
						name="images"
						rows="3"
						placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
						class="w-full p-3 border-2 border-white/10 rounded-lg bg-white/5 text-base box-border focus:outline-none focus:border-indigo-500"
					>{form?.images !== undefined ? form.images : (data.product.images?.join(', ') || '')}</textarea>
					<small class="block mt-1 text-gray-400 text-sm">Add multiple images for product gallery (drag-and-drop reordering coming soon)</small>
				</div>
				{#if data.product.images && data.product.images.length > 0}
					<div class="grid grid-cols-4 gap-4 mt-4">
						{#each data.product.images as image}
							<div class="relative">
								<img src={image} alt="Gallery" class="w-full h-24 object-cover rounded-lg border border-white/10" />
							</div>
						{/each}
					</div>
				{/if}
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

<!-- AI Generated Description Modal -->
{#if showDescriptionModal && generatedDescription}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="description-modal-title"
		tabindex="-1"
		on:click={() => (showDescriptionModal = false)}
		on:keydown={(e) => e.key === 'Escape' && (showDescriptionModal = false)}
	>
		<div
			class="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<div class="p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 id="description-modal-title" class="text-2xl font-bold text-gray-900">AI Generated Description</h2>
					<button
						type="button"
						on:click={() => (showDescriptionModal = false)}
						class="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>

				<!-- Main Description -->
				<div class="mb-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Generated Description</h3>
					<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
						<p class="text-gray-700 whitespace-pre-wrap">{generatedDescription}</p>
					</div>
					<button
						type="button"
						on:click={() => generatedDescription && useDescription(generatedDescription)}
						class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
					>
						Use This Description
					</button>
				</div>

				<!-- Variations -->
				{#if descriptionVariations && descriptionVariations.length > 0}
					<div class="mb-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-3">Alternative Variations</h3>
						<div class="space-y-3">
							{#each descriptionVariations as variation, index}
								<div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<div class="flex items-start justify-between gap-3">
										<p class="text-gray-700 whitespace-pre-wrap flex-1">{variation}</p>
										<button
											type="button"
											on:click={() => useDescription(variation)}
											class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-semibold whitespace-nowrap"
										>
											Use
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Keywords -->
				{#if generatedKeywords && generatedKeywords.length > 0}
					<div class="mb-6">
						<h3 class="text-lg font-semibold text-gray-900 mb-2">Suggested SEO Keywords</h3>
						<div class="flex flex-wrap gap-2">
							{#each generatedKeywords as keyword}
								<span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
									{keyword}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<div class="flex gap-3 pt-4 border-t border-gray-200">
					<button
						type="button"
						on:click={() => (showDescriptionModal = false)}
						class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

