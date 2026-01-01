<!-- VIEW: Product Variants Management Page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { uploadImage } from '$lib/utils/storage';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	export let params: { id: string };

	let showVariantForm = false;
	let showBulkForm = false;
	let editingVariant: any = null;

	// Variant form
	let variantName = '';
	let variantSku = '';
	let variantAttributes: Record<string, string> = {};
	let variantPrice = 0;
	let variantStock = 0;
	let variantImageUrl = '';
	let variantIsActive = true;

	// Bulk form
	let bulkAttributes: Array<{ name: string; values: string[] }> = [{ name: '', values: [''] }];
	let bulkBasePrice = 0;
	let bulkBaseStock = 0;

	function addAttribute() {
		bulkAttributes.push({ name: '', values: [''] });
	}

	function removeAttribute(index: number) {
		bulkAttributes.splice(index, 1);
	}

	function addAttributeValue(attrIndex: number) {
		bulkAttributes[attrIndex].values.push('');
	}

	function removeAttributeValue(attrIndex: number, valueIndex: number) {
		bulkAttributes[attrIndex].values.splice(valueIndex, 1);
	}

	function editVariant(variant: any) {
		editingVariant = variant;
		variantName = variant.name;
		variantSku = variant.sku || '';
		variantAttributes = variant.attributes || {};
		variantPrice = variant.price || 0;
		variantStock = variant.stock;
		variantImageUrl = variant.image_url || '';
		variantIsActive = variant.is_active;
		showVariantForm = true;
	}

	function resetVariantForm() {
		editingVariant = null;
		variantName = '';
		variantSku = '';
		variantAttributes = {};
		variantPrice = 0;
		variantStock = 0;
		variantImageUrl = '';
		variantIsActive = true;
		showVariantForm = false;
	}

	async function handleVariantImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			variantImageUrl = await uploadImage(file, 'product-images');
		} catch (error: any) {
			alert('Image upload failed: ' + error.message);
		}
	}
</script>

<svelte:head>
	<title>Product Variants - {data.product?.name || 'Product'}</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<a href="/admin/products" class="inline-block mb-6 text-indigo-400 no-underline hover:underline">← Back to Products</a>
	
	<h1 class="text-3xl font-bold text-gray-900 mb-2">Product Variants</h1>
	<p class="text-gray-600 mb-8">Manage variants for: <strong>{data.product?.name}</strong></p>

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
			Operation successful!
		</div>
	{/if}

	<div class="flex gap-4 mb-6">
		<button
			on:click={() => {
				resetVariantForm();
				showVariantForm = true;
				showBulkForm = false;
			}}
			class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
		>
			+ Add Variant
		</button>
		<button
			on:click={() => {
				showBulkForm = true;
				showVariantForm = false;
			}}
			class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
		>
			+ Bulk Create Variants
		</button>
	</div>

	<!-- Single Variant Form -->
	{#if showVariantForm}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">
				{editingVariant ? 'Edit Variant' : 'Create New Variant'}
			</h2>
			<form method="POST" action={editingVariant ? '?/updateVariant' : '?/createVariant'} use:enhance>
				{#if editingVariant}
					<input type="hidden" name="id" value={editingVariant.id} />
				{/if}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block mb-2 font-medium">Variant Name *</label>
						<input
							type="text"
							name="name"
							bind:value={variantName}
							required
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
							placeholder="e.g., Red - Large"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">SKU</label>
						<input
							type="text"
							name="sku"
							bind:value={variantSku}
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Price (overrides product price)</label>
						<input
							type="number"
							name="price"
							bind:value={variantPrice}
							min="0"
							step="0.01"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Stock *</label>
						<input
							type="number"
							name="stock"
							bind:value={variantStock}
							required
							min="0"
							class="w-full p-3 border-2 border-gray-300 rounded-lg"
						/>
					</div>
					<div>
						<label class="block mb-2 font-medium">Image URL</label>
						<div class="flex gap-2">
							<input
								type="text"
								name="image_url"
								bind:value={variantImageUrl}
								class="flex-1 p-3 border-2 border-gray-300 rounded-lg"
							/>
							<input
								type="file"
								accept="image/*"
								on:change={handleVariantImageUpload}
								class="p-3 border-2 border-gray-300 rounded-lg"
							/>
						</div>
					</div>
					<div>
						<label class="flex items-center gap-2 mt-6">
							<input
							type="checkbox"
							name="is_active"
							bind:checked={variantIsActive}
								class="w-4 h-4"
							/>
							<span>Active</span>
						</label>
					</div>
				</div>
				<input type="hidden" name="attributes" value={JSON.stringify(variantAttributes)} />
				<div class="mt-6 flex gap-3">
					<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
						{editingVariant ? 'Update' : 'Create'} Variant
					</button>
					<button type="button" on:click={resetVariantForm} class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Bulk Create Form -->
	{#if showBulkForm}
		<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Bulk Create Variants</h2>
			<form method="POST" action="?/bulkCreateVariants" use:enhance>
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block mb-2 font-medium">Base Price</label>
							<input
								type="number"
								name="base_price"
								bind:value={bulkBasePrice}
								min="0"
								step="0.01"
								class="w-full p-3 border-2 border-gray-300 rounded-lg"
							/>
						</div>
						<div>
							<label class="block mb-2 font-medium">Base Stock</label>
							<input
								type="number"
								name="base_stock"
								bind:value={bulkBaseStock}
								min="0"
								class="w-full p-3 border-2 border-gray-300 rounded-lg"
							/>
						</div>
					</div>
					<div>
						<label class="block mb-2 font-medium">Variant Attributes</label>
						{#each bulkAttributes as attr, attrIndex}
							<div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
								<div class="flex gap-2 mb-2">
									<input
										type="text"
										bind:value={attr.name}
										placeholder="Attribute name (e.g., Color)"
										class="flex-1 p-2 border border-gray-300 rounded"
									/>
									<button
										type="button"
										on:click={() => removeAttribute(attrIndex)}
										class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
									>
										Remove
									</button>
								</div>
								<div class="space-y-2">
									{#each attr.values as value, valueIndex}
										<div class="flex gap-2">
											<input
												type="text"
												bind:value={value}
												placeholder="Value (e.g., Red)"
												class="flex-1 p-2 border border-gray-300 rounded"
											/>
											<button
												type="button"
												on:click={() => removeAttributeValue(attrIndex, valueIndex)}
												class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
											>
												×
											</button>
										</div>
									{/each}
									<button
										type="button"
										on:click={() => addAttributeValue(attrIndex)}
										class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
									>
										+ Add Value
									</button>
								</div>
							</div>
						{/each}
						<button
							type="button"
							on:click={addAttribute}
							class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
						>
							+ Add Attribute
						</button>
					</div>
					<input type="hidden" name="attributes" value={JSON.stringify(bulkAttributes)} />
					<div class="flex gap-3">
						<button type="submit" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
							Create All Variants
						</button>
						<button
							type="button"
							on:click={() => (showBulkForm = false)}
							class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</div>
			</form>
		</div>
	{/if}

	<!-- Variants List -->
	<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
		<h2 class="text-xl font-bold text-gray-900 mb-4">All Variants</h2>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attributes</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.variants as variant}
						<tr>
							<td class="px-6 py-4 font-medium text-gray-900">{variant.name}</td>
							<td class="px-6 py-4 text-gray-600 font-mono text-sm">{variant.sku || 'N/A'}</td>
							<td class="px-6 py-4 text-gray-600 text-sm">
								{Object.entries(variant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
							</td>
							<td class="px-6 py-4 text-gray-600">{variant.price ? `Tk ${variant.price.toFixed(2)}` : 'Use product price'}</td>
							<td class="px-6 py-4 text-gray-600">{variant.stock}</td>
							<td class="px-6 py-4">
								<span class="px-2 py-1 text-xs font-semibold rounded-full {variant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
									{variant.is_active ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="flex gap-2">
									<button
										on:click={() => editVariant(variant)}
										class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
									>
										Edit
									</button>
									<form method="POST" action="?/deleteVariant" use:enhance class="inline">
										<input type="hidden" name="id" value={variant.id} />
										<button
											type="submit"
											class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
											on:click={(e) => {
												if (!confirm('Delete this variant?')) e.preventDefault();
											}}
										>
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-6 py-8 text-center text-gray-500">No variants found. Create your first variant!</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

