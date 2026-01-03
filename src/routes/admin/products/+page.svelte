<!-- VIEW: Admin products management page -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import MediaPicker from '$lib/components/MediaPicker.svelte';
	import { toast } from '$lib/stores/toast';

	export let data: PageData;
	export let form: ActionData;
	export let params: Record<string, string> = {};

	let showCreateForm = false;
	let showMediaPicker = false;
	let selectedImageUrl = '';
	let searchInput = data.searchQuery || '';
	let showPriceOptimization = false;
	let priceOptimizations: any[] = [];
	let loadingOptimizations = false;
	
	// Advanced Filters
	let showFilters = false;
	let filterCategory = data.filters?.categoryId || '';
	let filterBrand = data.filters?.brand || '';
	let filterStockStatus = data.filters?.stockStatus || 'all';
	let filterMinPrice = data.filters?.minPrice || '';
	let filterMaxPrice = data.filters?.maxPrice || '';
	let filterStartDate = data.filters?.startDate || '';
	let filterEndDate = data.filters?.endDate || '';
	
	// AI Description Generation
	let descriptionTextarea: HTMLTextAreaElement;
	let generatingDescription = false;
	let descriptionError: string | null = null;
	let generatedDescription: string | null = null;
	let generatedKeywords: string[] = [];
	let descriptionVariations: string[] = [];
	let showDescriptionModal = false;

	function toggleCreateForm() {
		showCreateForm = !showCreateForm;
		if (!showCreateForm) {
			selectedImageUrl = '';
		}
	}

	function handleMediaSelect(urls: string[]) {
		if (urls.length > 0) {
			selectedImageUrl = urls[0];
			// Also set the image_url input value
			const imageUrlInput = document.getElementById('image_url') as HTMLInputElement;
			if (imageUrlInput) {
				imageUrlInput.value = urls[0];
			}
		}
		showMediaPicker = false;
	}

	function applyFilters() {
		const params = new URLSearchParams();
		
		if (searchInput.trim()) {
			params.set('search', searchInput.trim());
		}
		if (filterCategory) {
			params.set('category', filterCategory);
		}
		if (filterBrand) {
			params.set('brand', filterBrand);
		}
		if (filterStockStatus !== 'all') {
			params.set('stockStatus', filterStockStatus);
		}
		if (filterMinPrice) {
			params.set('minPrice', filterMinPrice);
		}
		if (filterMaxPrice) {
			params.set('maxPrice', filterMaxPrice);
		}
		if (filterStartDate) {
			params.set('startDate', filterStartDate);
		}
		if (filterEndDate) {
			params.set('endDate', filterEndDate);
		}
		
		const queryString = params.toString();
		goto(`/admin/products${queryString ? '?' + queryString : ''}`);
	}

	function clearFilters() {
		searchInput = '';
		filterCategory = '';
		filterBrand = '';
		filterStockStatus = 'all';
		filterMinPrice = '';
		filterMaxPrice = '';
		filterStartDate = '';
		filterEndDate = '';
		goto('/admin/products');
	}

	function handleSearch() {
		applyFilters();
	}

	function clearSearch() {
		clearFilters();
	}

	async function loadPriceOptimizations() {
		loadingOptimizations = true;
		try {
			const response = await fetch('/api/admin/ai-price-optimization');
			if (response.ok) {
				const data = await response.json();
				priceOptimizations = data.optimizations || [];
				showPriceOptimization = true;
			}
		} catch (error) {
			console.error('Error loading price optimizations:', error);
		} finally {
			loadingOptimizations = false;
		}
	}

	async function generateDescription() {
		generatingDescription = true;
		descriptionError = null;
		generatedDescription = null;
		generatedKeywords = [];
		descriptionVariations = [];

		try {
			const nameInput = document.getElementById('name') as HTMLInputElement;
			const brandInput = document.getElementById('brand') as HTMLInputElement;
			const specificationsInput = document.getElementById('specifications') as HTMLTextAreaElement;
			const priceInput = document.getElementById('price') as HTMLInputElement;
			const categorySelect = document.getElementById('component_category_id') as HTMLSelectElement;

			const selectedCategory = data.categories.find(c => c.id === categorySelect?.value);

			const response = await fetch('/api/admin/ai-generate-description', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: nameInput?.value || '',
					brand: brandInput?.value || null,
					specifications: specificationsInput?.value || null,
					price: priceInput?.value ? parseFloat(priceInput.value) : undefined,
					component_category_name: selectedCategory?.display_name || null
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
</script>

<svelte:head>
	<title>Product Management - Admin Dashboard</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header Section -->
	<div class="mb-8">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
			<div>
				<h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
					Product Management
				</h1>
				<p class="text-gray-500 text-sm">Manage your product catalog efficiently</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<button 
					on:click={loadPriceOptimizations}
					disabled={loadingOptimizations}
					class="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cursor-pointer text-sm font-semibold transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					{#if loadingOptimizations}
						<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Loading...
					{:else}
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
						</svg>
						AI Price Optimization
					{/if}
				</button>
				<button 
					class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl cursor-pointer text-sm font-semibold transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg flex items-center gap-2" 
					on:click={toggleCreateForm}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
					{showCreateForm ? 'Cancel' : 'Add New Product'}
				</button>
			</div>
		</div>
	</div>

	{#if data.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border-2 border-red-200 shadow-md flex items-center gap-3">
			<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span class="font-semibold">{data.error}</span>
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border-2 border-red-200 shadow-md flex items-center gap-3">
			<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span class="font-semibold">{form.error}</span>
		</div>
	{/if}

	{#if showCreateForm}
		<div class="bg-white rounded-xl shadow-xl border border-gray-200 p-8 mb-8">
			<div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
				<div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-gray-900">Create New Product</h2>
			</div>
			<form method="POST" action="?/create" use:enhance enctype="multipart/form-data">
				<div class="mb-6">
					<label for="name" class="block mb-2 font-semibold text-gray-700">Product Name *</label>
					<input type="text" id="name" name="name" required minlength="2" class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" />
				</div>

				<div class="mb-6">
					<div class="flex items-center justify-between mb-2">
						<label for="description" class="block font-semibold text-gray-700">Description *</label>
						<button
							type="button"
							on:click={generateDescription}
							disabled={generatingDescription}
							class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
						class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
					></textarea>
					<small class="block mt-1.5 text-gray-500 text-sm">Click "AI Generate Description" to auto-generate an SEO-optimized description</small>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div>
						<label for="component_category_id" class="block mb-2 font-semibold text-gray-700">Component Category (optional)</label>
						<select id="component_category_id" name="component_category_id" class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all">
							<option value="">None (Regular Product)</option>
							{#each data.categories as category}
								<option value={category.id}>{category.display_name}</option>
							{/each}
						</select>
						<small class="block mt-1.5 text-gray-500 text-sm">Select a category if this is a PC component</small>
					</div>

					<div>
						<label for="brand" class="block mb-2 font-semibold text-gray-700">Brand (optional)</label>
						<input type="text" id="brand" name="brand" placeholder="e.g., Intel, AMD, Samsung" class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" />
					</div>
				</div>

				<div class="mb-6">
					<label for="specifications" class="block mb-2 font-semibold text-gray-700">Specifications (optional)</label>
					<textarea id="specifications" name="specifications" rows="4" placeholder="Enter product specifications (e.g., CPU: Intel i7, RAM: 16GB, Storage: 512GB SSD)" class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all resize-none"></textarea>
					<small class="block mt-1.5 text-gray-500 text-sm">Add detailed specifications for this product</small>
				</div>

				<div class="mb-6">
					<label class="block mb-2 font-semibold text-gray-700">Product Image (optional)</label>
					<div class="flex gap-3 mb-3">
						<button
							type="button"
							on:click={() => showMediaPicker = true}
							class="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold transition-all hover:shadow-lg flex items-center gap-2"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
							</svg>
							Select from Media Library
						</button>
						<span class="text-gray-500 text-sm self-center">or</span>
					</div>
					<input 
						type="file" 
						id="image_file" 
						name="image_file" 
						accept=".png,.jpg,.jpeg,image/png,image/jpeg"
						class="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer"
					/>
					<small class="block mt-1.5 text-gray-500 text-sm">Upload a .png or .jpg image (max 5MB). Images are automatically added to Media Library.</small>
				</div>

				<div class="mb-6">
					<label for="image_url" class="block mb-2 font-semibold text-gray-700">Or Image URL (optional)</label>
					<input type="url" id="image_url" name="image_url" bind:value={selectedImageUrl} placeholder="https://example.com/image.jpg" class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" />
					<small class="block mt-1.5 text-gray-500 text-sm">Alternatively, enter a URL to an image</small>
					{#if selectedImageUrl}
						<div class="mt-3">
							<img src={selectedImageUrl} alt="Selected" class="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-md" />
						</div>
					{/if}
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div>
						<label for="cost_price" class="block mb-2 font-semibold text-gray-700">Cost Price *</label>
						<input type="number" id="cost_price" name="cost_price" step="0.01" min="0" required class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" />
					</div>

					<div>
						<label for="price" class="block mb-2 font-semibold text-gray-700">Selling Price *</label>
						<input type="number" id="price" name="price" step="0.01" min="0" required class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" />
					</div>

					<div>
						<label for="stock" class="block mb-2 font-semibold text-gray-700">Stock *</label>
						<input type="number" id="stock" name="stock" min="0" required class="w-full p-3.5 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" />
					</div>
				</div>

				<div class="flex gap-3 pt-4 border-t border-gray-200">
					<button type="submit" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl cursor-pointer text-base font-semibold transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg flex items-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						Create Product
					</button>
					<button type="button" on:click={toggleCreateForm} class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl cursor-pointer text-base font-semibold transition-all hover:bg-gray-300">
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- AI Price Optimization Panel -->
	{#if showPriceOptimization}
		<div class="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-3">
					<div class="bg-purple-600 p-3 rounded-lg">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-900">AI Price Optimization Recommendations</h2>
				</div>
				<button
					on:click={() => showPriceOptimization = false}
					class="text-gray-600 hover:text-gray-800"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			{#if priceOptimizations.length > 0}
				<div class="space-y-4">
					{#each priceOptimizations as opt}
						<div class="bg-white rounded-lg p-5 border border-purple-100 shadow-sm">
							<div class="flex items-start justify-between mb-3">
								<div class="flex-1">
									<h3 class="text-lg font-bold text-gray-900 mb-2">{opt.productName}</h3>
									<div class="flex items-center gap-4 mb-2">
										<div>
											<p class="text-sm text-gray-600">Current Price</p>
											<p class="text-xl font-semibold text-gray-900">Tk {opt.currentPrice.toFixed(2)}</p>
										</div>
										<div class="text-2xl text-gray-400">→</div>
										<div>
											<p class="text-sm text-gray-600">Suggested Price</p>
											<p class="text-xl font-semibold {opt.priceChange > 0 ? 'text-green-600' : 'text-blue-600'}">
												Tk {opt.suggestedPrice.toFixed(2)}
											</p>
										</div>
										<div>
											<p class="text-sm text-gray-600">Change</p>
											<p class="text-lg font-semibold {opt.priceChange > 0 ? 'text-green-600' : 'text-blue-600'}">
												{opt.priceChange > 0 ? '+' : ''}{opt.priceChange.toFixed(1)}%
											</p>
										</div>
									</div>
									<p class="text-sm text-gray-700 mb-2"><strong>Reason:</strong> {opt.reason}</p>
									<p class="text-sm text-indigo-600"><strong>Expected Impact:</strong> {opt.expectedImpact}</p>
								</div>
								<div class="flex gap-2">
									<a
										href="/admin/products/{opt.productId}/edit"
										class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
									>
										Update Price
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-600 text-center py-8">No price optimizations recommended at this time. All prices are well-optimized.</p>
			{/if}
		</div>
	{/if}

	<div class="mt-8">
		<!-- Advanced Search & Filter Panel -->
		<div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-indigo-100 rounded-lg">
						<svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-gray-900">Search & Filter Products</h2>
				</div>
				<button
					type="button"
					on:click={() => showFilters = !showFilters}
					class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
					</svg>
					{showFilters ? 'Hide Filters' : 'Show Filters'}
				</button>
			</div>

			<!-- Basic Search -->
			<div class="mb-4">
				<label for="search" class="block mb-2 font-semibold text-gray-700 text-sm">Search</label>
				<div class="flex gap-2">
					<div class="flex-1 relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
						</div>
						<input
							type="text"
							id="search"
							bind:value={searchInput}
							placeholder="Search by name or description..."
							class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
							on:keydown={(e) => {
								if (e.key === 'Enter') {
									handleSearch();
								}
							}}
						/>
					</div>
					<button
						type="button"
						on:click={handleSearch}
						class="px-6 py-3 bg-indigo-600 text-white rounded-xl cursor-pointer text-base font-semibold transition-all hover:bg-indigo-700 hover:shadow-lg"
					>
						Search
					</button>
					<button
						type="button"
						on:click={clearFilters}
						class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl cursor-pointer text-base font-semibold transition-all hover:bg-gray-300"
					>
						Clear All
					</button>
				</div>
			</div>

			<!-- Advanced Filters (Collapsible) -->
			{#if showFilters}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
					<!-- Category Filter -->
					<div>
						<label for="filterCategory" class="block mb-2 font-semibold text-gray-700 text-sm">Category</label>
						<select
							id="filterCategory"
							bind:value={filterCategory}
							class="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
						>
							<option value="">All Categories</option>
							{#each data.categories as category}
								<option value={category.id}>{category.display_name}</option>
							{/each}
						</select>
					</div>

					<!-- Brand Filter -->
					<div>
						<label for="filterBrand" class="block mb-2 font-semibold text-gray-700 text-sm">Brand</label>
						<select
							id="filterBrand"
							bind:value={filterBrand}
							class="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
						>
							<option value="">All Brands</option>
							{#each data.brands as brand}
								<option value={brand}>{brand}</option>
							{/each}
						</select>
					</div>

					<!-- Stock Status Filter -->
					<div>
						<label for="filterStockStatus" class="block mb-2 font-semibold text-gray-700 text-sm">Stock Status</label>
						<select
							id="filterStockStatus"
							bind:value={filterStockStatus}
							class="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
						>
							<option value="all">All</option>
							<option value="in_stock">In Stock</option>
							<option value="low_stock">Low Stock (≤10)</option>
							<option value="out_of_stock">Out of Stock</option>
						</select>
					</div>

					<!-- Price Range -->
					<div>
						<label class="block mb-2 font-semibold text-gray-700 text-sm">Price Range</label>
						<div class="flex gap-2">
							<input
								type="number"
								bind:value={filterMinPrice}
								placeholder="Min"
								step="0.01"
								min="0"
								class="flex-1 p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
							/>
							<input
								type="number"
								bind:value={filterMaxPrice}
								placeholder="Max"
								step="0.01"
								min="0"
								class="flex-1 p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
							/>
						</div>
					</div>

					<!-- Date Range -->
					<div>
						<label for="filterStartDate" class="block mb-2 font-semibold text-gray-700 text-sm">Created From</label>
						<input
							type="date"
							id="filterStartDate"
							bind:value={filterStartDate}
							class="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
						/>
					</div>

					<div>
						<label for="filterEndDate" class="block mb-2 font-semibold text-gray-700 text-sm">Created To</label>
						<input
							type="date"
							id="filterEndDate"
							bind:value={filterEndDate}
							class="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-base box-border focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all"
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Products Header -->
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-2xl font-bold text-gray-900">
				{#if data.searchQuery || data.filters?.categoryId || data.filters?.brand || data.filters?.stockStatus !== 'all' || data.filters?.minPrice || data.filters?.maxPrice || data.filters?.startDate || data.filters?.endDate}
					Filtered Results
				{:else}
					All Products
				{/if}
			</h2>
			<div class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
				{data.products.length} {data.products.length === 1 ? 'Product' : 'Products'}
			</div>
		</div>

		{#if data.products.length === 0}
			<div class="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
				<svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
				</svg>
				<p class="text-gray-600 text-lg font-semibold mb-2">
					{#if data.searchQuery}
						No products found matching "{data.searchQuery}"
					{:else}
						No products found
					{/if}
				</p>
				<p class="text-gray-500 text-sm mb-4">
					{#if data.searchQuery}
						Try a different search term or clear filters
					{:else}
						Create your first product to get started!
					{/if}
				</p>
				{#if !showCreateForm}
					<button 
						on:click={toggleCreateForm}
						class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg"
					>
						Create Product
					</button>
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.products as product (product.id)}
					<div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
						{#if product.image_url}
							<div class="relative h-48 bg-gray-100 overflow-hidden">
								<img src={product.image_url} alt={product.name} class="w-full h-full object-cover" on:error={(e) => { e.currentTarget.style.display = 'none'; }} />
								<div class="absolute top-3 right-3">
									<span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-md">
										${product.price.toFixed(2)}
									</span>
								</div>
							</div>
						{:else}
							<div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
								<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
							</div>
						{/if}
						<div class="p-5">
							<h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
							<p class="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
							<div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
								<div>
									<p class="text-xs text-gray-500 mb-1">Stock</p>
									<p class="text-sm font-semibold {product.stock && product.stock > 10 ? 'text-green-600' : product.stock && product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
										{product.stock ?? 'N/A'} {product.stock && product.stock > 0 ? 'units' : 'unit'}
									</p>
								</div>
								<div class="text-right">
									<p class="text-xs text-gray-500 mb-1">Price</p>
									<p class="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</p>
								</div>
							</div>
							<div class="flex gap-2">
								<a href="/admin/products/{product.id}/edit" class="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg no-underline text-sm font-semibold transition-all hover:bg-indigo-700 hover:shadow-md text-center">
									Edit
								</a>
								<form method="POST" action="?/delete" use:enhance={({ update }) => {
									return async ({ result, update: updateFn }) => {
										if (updateFn) {
											await updateFn();
										} else if (update) {
											await update();
										}
										if (result.type === 'success') {
											toast.success('Product deleted successfully');
										} else if (result.type === 'failure') {
											toast.error(result.data?.error || 'Failed to delete product');
										}
									};
								}} class="flex-1">
									<input type="hidden" name="id" value={product.id} />
									<button 
										type="submit" 
										class="w-full px-4 py-2.5 bg-gray-600 text-white rounded-lg border-none cursor-pointer text-sm font-semibold transition-all hover:bg-gray-700 hover:shadow-md"
										on:click={(e) => { if (!confirm('Are you sure you want to delete this product?')) { e.preventDefault(); } }}
									>
										Delete
									</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if showMediaPicker}
	<MediaPicker
		multiple={false}
		selectedUrls={selectedImageUrl ? [selectedImageUrl] : []}
		onSelect={handleMediaSelect}
		onClose={() => showMediaPicker = false}
	/>
{/if}

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
