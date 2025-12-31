<!-- VIEW: PC Builder page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';
	import type { ComponentCategory } from '$lib/models/PCBuild';
	import type { Product } from '$lib/models/Product';

	export let data: PageData;
	export let form: ActionData;
	export const params = {};

	let selectedComponents: Record<string, { product: Product; category: ComponentCategory }> = {};
	let hideUnconfigured = false;
	let showSaveModal = false;
	let buildName = '';
	let buildDescription = '';
	let showProductModal = false;
	let currentCategory: ComponentCategory | null = null;
	let showOverview = false;

	// Calculate total price
	$: totalPrice = Object.values(selectedComponents).reduce(
		(sum, comp) => sum + (comp.product.price || 0),
		0
	);

	// Get item count
	$: itemCount = Object.keys(selectedComponents).length;

	// Get configured categories
	$: configuredCategories = Object.keys(selectedComponents);

	function openProductModal(category: ComponentCategory) {
		currentCategory = category;
		showProductModal = true;
	}

	function selectProduct(product: Product, category: ComponentCategory) {
		selectedComponents[category.id] = { product, category };
		showProductModal = false;
		currentCategory = null;
	}

	function removeComponent(categoryId: string) {
		delete selectedComponents[categoryId];
	}

	function getProductsForCategory(categoryId: string): Product[] {
		return data.productsByCategory[categoryId] || [];
	}

	function handleSave() {
		showSaveModal = true;
	}

	function handlePrint() {
		window.print();
	}

	function handleAddToCart() {
		// This will be handled by the form action
	}

	function getRequiredCategories() {
		return data.categories.filter((cat) => cat.is_required);
	}

	function getOptionalCategories() {
		return data.categories.filter((cat) => !cat.is_required);
	}

	function getDisplayCategories() {
		const all = [...getRequiredCategories(), ...getOptionalCategories()];
		if (hideUnconfigured) {
			return all.filter((cat) => selectedComponents[cat.id]);
		}
		return all;
	}

	function getSelectedProduct(categoryId: string): Product | null {
		return selectedComponents[categoryId]?.product || null;
	}
</script>

<svelte:head>
	<title>PC Builder - Build Your Own Computer</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
				PC Builder - Build Your Own Computer
			</h1>
			<p class="text-gray-600">Select components to build your custom PC</p>
		</div>

		<!-- Action Bar -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={hideUnconfigured}
							class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
						/>
						<span class="text-sm text-gray-700">Hide Unconfigured Components</span>
					</label>
				</div>
				<div class="flex items-center gap-4">
					<button
						type="button"
						on:click={() => (showOverview = !showOverview)}
						class="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
					>
						Overview
						<span class="ml-2 px-2 py-0.5 bg-indigo-700 rounded text-xs">BETA</span>
						{#if itemCount > 0}
							<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
								{itemCount}
							</span>
						{/if}
					</button>
					<form 
						method="POST" 
						action="?/addToCart" 
						use:enhance={({ result, update }) => {
							return async () => {
								// Always update to show success/error messages
								await update();
							};
						}}
						class="inline"
					>
						<input
							type="hidden"
							name="components"
							value={JSON.stringify(
								Object.entries(selectedComponents).map(([catId, comp]) => ({
									product_id: comp.product.id,
									component_category_id: catId,
									quantity: 1
								}))
							)}
						/>
						<button
							type="submit"
							disabled={itemCount === 0}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
						>
							Add to Cart
						</button>
					</form>
					<button
						type="button"
						on:click={handleSave}
						disabled={itemCount === 0}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
					>
						Save PC
					</button>
					<button
						type="button"
						on:click={handlePrint}
						class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
					>
						Print
					</button>
				</div>
			</div>
		</div>

		<!-- Messages -->
		{#if form?.error}
			<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
				{form.success === true ? 'Operation successful!' : form.success}
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Core Components -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Core Components</h2>
					<div class="space-y-4">
						{#each getRequiredCategories() as category}
							{@const product = getSelectedProduct(category.id)}
							{@const products = getProductsForCategory(category.id)}
							<div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-2">
											<h3 class="font-semibold text-gray-900">{category.display_name}</h3>
											<span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
												Required
											</span>
										</div>
										{#if product}
											<div class="mt-2 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
												<div class="flex items-start gap-4">
													{#if product.image_url}
														<img
															src={product.image_url}
															alt={product.name}
															class="w-20 h-20 object-cover rounded-lg border border-gray-200"
														/>
													{:else}
														<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
															<span class="text-gray-400 text-xs">No image</span>
														</div>
													{/if}
													<div class="flex-1">
														<p class="font-bold text-gray-900 text-base mb-1">{product.name}</p>
														{#if product.brand}
															<p class="text-xs text-indigo-600 font-semibold mb-1">{product.brand}</p>
														{/if}
														<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
														<div class="flex items-baseline gap-2">
															<p class="text-2xl font-bold text-indigo-600">
																Tk {product.price.toFixed(2)}
															</p>
															{#if product.stock > 0}
																<span class="text-xs text-green-600 font-medium">
																	({product.stock} in stock)
																</span>
															{:else}
																<span class="text-xs text-red-600 font-medium">(Out of stock)</span>
															{/if}
														</div>
													</div>
													<button
														type="button"
														on:click={() => removeComponent(category.id)}
														class="text-red-600 hover:text-red-700 p-1"
														aria-label="Remove component"
													>
														<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</div>
											</div>
										{:else}
											<p class="text-sm text-gray-500">No component selected</p>
										{/if}
									</div>
									<button
										type="button"
										on:click={() => openProductModal(category)}
										class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold whitespace-nowrap"
									>
										{product ? 'Change' : 'Choose'}
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Peripherals & Others -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Peripherals & Others</h2>
					<div class="space-y-4">
						{#each getOptionalCategories() as category}
							{@const product = getSelectedProduct(category.id)}
							{@const products = getProductsForCategory(category.id)}
							{#if !hideUnconfigured || product}
								<div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
									<div class="flex items-center justify-between">
										<div class="flex-1">
											<h3 class="font-semibold text-gray-900 mb-2">{category.display_name}</h3>
											{#if product}
												<div class="mt-2 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
													<div class="flex items-start gap-4">
														{#if product.image_url}
															<img
																src={product.image_url}
																alt={product.name}
																class="w-20 h-20 object-cover rounded-lg border border-gray-200"
															/>
														{:else}
															<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
																<span class="text-gray-400 text-xs">No image</span>
															</div>
														{/if}
														<div class="flex-1">
															<p class="font-bold text-gray-900 text-base mb-1">{product.name}</p>
															{#if product.brand}
																<p class="text-xs text-indigo-600 font-semibold mb-1">{product.brand}</p>
															{/if}
															<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
															<div class="flex items-baseline gap-2">
																<p class="text-2xl font-bold text-indigo-600">
																	Tk {product.price.toFixed(2)}
																</p>
																{#if product.stock > 0}
																	<span class="text-xs text-green-600 font-medium">
																		({product.stock} in stock)
																	</span>
																{:else}
																	<span class="text-xs text-red-600 font-medium">(Out of stock)</span>
																{/if}
															</div>
														</div>
														<button
															type="button"
															on:click={() => removeComponent(category.id)}
															class="text-red-600 hover:text-red-700 p-1"
															aria-label="Remove component"
														>
															<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M6 18L18 6M6 6l12 12"
																/>
															</svg>
														</button>
													</div>
												</div>
											{:else}
												<p class="text-sm text-gray-500">No component selected</p>
											{/if}
										</div>
										<button
											type="button"
											on:click={() => openProductModal(category)}
											class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold whitespace-nowrap"
										>
											{product ? 'Change' : 'Choose'}
										</button>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>

			<!-- Overview Sidebar -->
			<div class="lg:col-span-1">
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
					<h2 class="text-xl font-bold text-gray-900 mb-4">Overview</h2>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-gray-700">Total Items:</span>
							<span class="font-bold text-gray-900">{itemCount}</span>
						</div>
						<div class="border-t border-gray-200 pt-4">
							<div class="flex justify-between items-center mb-2">
								<span class="text-gray-700">Total Price:</span>
								<span class="text-2xl font-bold text-indigo-600">Tk {totalPrice.toFixed(2)}</span>
							</div>
						</div>
						{#if itemCount > 0}
							<div class="pt-4 border-t border-gray-200 space-y-2">
								<h3 class="font-semibold text-gray-900 mb-2">Selected Components:</h3>
								{#each Object.values(selectedComponents) as comp}
									<div class="text-sm">
										<p class="font-medium text-gray-900">{comp.category.display_name}</p>
										<p class="text-gray-600">{comp.product.name}</p>
										<p class="text-indigo-600 font-semibold">Tk {comp.product.price.toFixed(2)}</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Selected Products Summary (Bottom Section) -->
	{#if itemCount > 0}
		<div class="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Selected Components Summary</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{#each Object.values(selectedComponents) as comp}
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div class="flex items-start gap-3 mb-3">
							{#if comp.product.image_url}
								<img
									src={comp.product.image_url}
									alt={comp.product.name}
									class="w-16 h-16 object-cover rounded-lg border border-gray-200"
								/>
							{:else}
								<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
									<span class="text-gray-400 text-xs">No image</span>
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<p class="text-xs text-indigo-600 font-semibold mb-1">{comp.category.display_name}</p>
								<p class="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{comp.product.name}</p>
								{#if comp.product.brand}
									<p class="text-xs text-gray-500 mb-1">Brand: {comp.product.brand}</p>
								{/if}
							</div>
							<button
								type="button"
								on:click={() => removeComponent(comp.category.id)}
								class="text-red-600 hover:text-red-700 p-1 flex-shrink-0"
								aria-label="Remove {comp.product.name}"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div class="border-t border-gray-200 pt-3 mt-3">
							<div class="flex justify-between items-center mb-2">
								<span class="text-xs text-gray-600">Price:</span>
								<span class="text-lg font-bold text-indigo-600">Tk {comp.product.price.toFixed(2)}</span>
							</div>
							{#if comp.product.specifications}
								<div class="mt-2">
									<p class="text-xs text-gray-500 line-clamp-2">{comp.product.specifications}</p>
								</div>
							{/if}
							{#if comp.product.stock > 0}
								<p class="text-xs text-green-600 mt-2 font-medium">
									✓ {comp.product.stock} in stock
								</p>
							{:else}
								<p class="text-xs text-red-600 mt-2 font-medium">✕ Out of stock</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-6 pt-6 border-t border-gray-200">
				<div class="flex justify-between items-center">
					<div>
						<p class="text-sm text-gray-600">Total Items: <span class="font-bold text-gray-900">{itemCount}</span></p>
						<p class="text-sm text-gray-600 mt-1">Total Components: <span class="font-bold text-gray-900">{itemCount}</span></p>
					</div>
					<div class="text-right">
						<p class="text-sm text-gray-600 mb-1">Total Price:</p>
						<p class="text-3xl font-bold text-indigo-600">Tk {totalPrice.toFixed(2)}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Product Selection Modal -->
{#if showProductModal && currentCategory}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="product-modal-title"
		on:click={() => {
			showProductModal = false;
			currentCategory = null;
		}}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showProductModal = false;
				currentCategory = null;
			}
		}}
	>
		<div
			class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 id="product-modal-title" class="text-2xl font-bold text-gray-900">
						Choose {currentCategory.display_name}
					</h2>
					<button
						type="button"
						on:click={() => {
							showProductModal = false;
							currentCategory = null;
						}}
						class="text-gray-400 hover:text-gray-600"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each getProductsForCategory(currentCategory.id) as product}
						<button
							type="button"
							class="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-indigo-500 cursor-pointer transition-colors"
							on:click={() => currentCategory && selectProduct(product, currentCategory)}
						>
							<div class="flex gap-4">
								{#if product.image_url}
									<img
										src={product.image_url}
										alt={product.name}
										class="w-20 h-20 object-cover rounded"
									/>
								{:else}
									<div class="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
										<span class="text-gray-400 text-xs">No image</span>
									</div>
								{/if}
								<div class="flex-1">
									<h3 class="font-semibold text-gray-900 mb-1">{product.name}</h3>
									<p class="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
									<p class="text-lg font-bold text-indigo-600">Tk {product.price.toFixed(2)}</p>
									{#if product.stock > 0}
										<p class="text-xs text-green-600 mt-1">
											{product.stock} in stock
										</p>
									{:else}
										<p class="text-xs text-red-600 mt-1">Out of stock</p>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
				{#if getProductsForCategory(currentCategory.id).length === 0}
					<div class="text-center py-8 text-gray-500">
						No products available in this category
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Save Build Modal -->
{#if showSaveModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="save-modal-title"
		on:click={() => (showSaveModal = false)}
		on:keydown={(e) => {
			if (e.key === 'Escape') {
				showSaveModal = false;
			}
		}}
	>
		<div 
			class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4" 
			role="document"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<form method="POST" action="?/saveBuild" use:enhance class="p-6">
				<h2 id="save-modal-title" class="text-2xl font-bold text-gray-900 mb-4">Save PC Build</h2>
				<div class="mb-4">
					<label for="build-name" class="block mb-2 font-medium text-gray-900">Build Name *</label>
					<input
						type="text"
						id="build-name"
						name="name"
						bind:value={buildName}
						required
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
						placeholder="e.g., Gaming PC 2025"
					/>
				</div>
				<div class="mb-4">
					<label for="build-description" class="block mb-2 font-medium text-gray-900">
						Description (Optional)
					</label>
					<textarea
						id="build-description"
						name="description"
						bind:value={buildDescription}
						rows="3"
						class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
						placeholder="Add a description for this build..."
					></textarea>
				</div>
				<input
					type="hidden"
					name="components"
					value={JSON.stringify(
						Object.entries(selectedComponents).map(([catId, comp]) => ({
							product_id: comp.product.id,
							component_category_id: catId,
							quantity: 1
						}))
					)}
				/>
				<div class="flex gap-4">
					<button
						type="submit"
						class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
					>
						Save
					</button>
					<button
						type="button"
						on:click={() => (showSaveModal = false)}
						class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

